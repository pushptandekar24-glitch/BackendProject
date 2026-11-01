const { validationResult } = require('express-validator');
const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const { sendInvitationEmail, sendStatusUpdateEmail } = require('../utils/mailer');

// @desc    Send an invitation to a student to join a team
// @route   POST /api/invitations
// @access  Private (Team Leader)
const sendInvitation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { teamId, receiverId, message } = req.body;

    // Cannot invite oneself
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself to your own team.',
      });
    }

    // Verify team
    const team = await Team.findById(teamId).populate('hackathon');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    // Verify sender is leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader can send invitations.',
      });
    }

    // Verify team capacity
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Team "${team.name}" is already full (${team.members.length}/${team.maxMembers} members).`,
      });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'The student you are trying to invite does not exist.',
      });
    }

    // Check if receiver is already in this team
    if (team.members.some((m) => m.toString() === receiverId)) {
      return res.status(400).json({
        success: false,
        message: `${receiver.name} is already a member of this team.`,
      });
    }

    // Check if receiver is already in ANY team for this hackathon
    const alreadyInHackathonTeam = await Team.findOne({
      hackathon: team.hackathon._id,
      members: receiverId,
    });

    if (alreadyInHackathonTeam) {
      return res.status(400).json({
        success: false,
        message: `${receiver.name} is already part of another team ("${alreadyInHackathonTeam.name}") for this hackathon.`,
      });
    }

    // Check if there is already a pending invitation
    const existingInvite = await Invitation.findOne({
      team: teamId,
      receiver: receiverId,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: `An invitation has already been sent to ${receiver.name} and is currently pending.`,
      });
    }

    // Create invitation
    const invitation = await Invitation.create({
      team: teamId,
      hackathon: team.hackathon._id,
      sender: req.user._id,
      receiver: receiverId,
      message: message || `Hey ${receiver.name}! We'd love for you to join ${team.name} for ${team.hackathon.title}.`,
      status: 'pending',
    });

    // Populate for response
    const populated = await Invitation.findById(invitation._id)
      .populate('team', 'name description requiredSkills members maxMembers')
      .populate('hackathon', 'title theme startDate endDate mode bannerUrl')
      .populate('sender', 'name email college avatar')
      .populate('receiver', 'name email college avatar preferredRole');

    // Trigger email notification safely
    sendInvitationEmail({
      toEmail: receiver.email,
      toName: receiver.name,
      inviterName: req.user.name,
      teamName: team.name,
      hackathonTitle: team.hackathon.title,
      message: invitation.message,
      inviteId: invitation._id,
    }).catch((e) => console.error('[Mailer Async Warning]', e.message));

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${receiver.name}!`,
      invitation: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invitations received by current logged-in user
// @route   GET /api/invitations/received
// @access  Private
const getReceivedInvitations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { receiver: req.user._id };

    if (status && ['pending', 'accepted', 'declined'].includes(status)) {
      query.status = status;
    }

    const invitations = await Invitation.find(query)
      .populate('team', 'name description requiredSkills members maxMembers')
      .populate('hackathon', 'title theme mode startDate endDate bannerUrl')
      .populate('sender', 'name email avatar college preferredRole')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invitations sent by teams led by current user
// @route   GET /api/invitations/sent
// @access  Private
const getSentInvitations = async (req, res, next) => {
  try {
    const { status, teamId } = req.query;
    const query = { sender: req.user._id };

    if (status && ['pending', 'accepted', 'declined'].includes(status)) {
      query.status = status;
    }

    if (teamId) {
      query.team = teamId;
    }

    const invitations = await Invitation.find(query)
      .populate('team', 'name members maxMembers')
      .populate('hackathon', 'title theme mode')
      .populate('receiver', 'name email avatar college preferredRole skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to an invitation (Accept or Decline)
// @route   PUT /api/invitations/:id/respond
// @access  Private (Recipient only)
const respondToInvitation = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "declined".',
      });
    }

    const invitation = await Invitation.findById(req.params.id)
      .populate('team')
      .populate('hackathon')
      .populate('sender', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    // Only the invitation recipient may accept or decline an invitation
    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the recipient can accept or decline this invitation.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status}.`,
      });
    }

    if (status === 'accepted') {
      const team = await Team.findById(invitation.team._id);

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'The team for this invitation no longer exists.',
        });
      }

      // Check capacity
      if (team.members.length >= team.maxMembers) {
        invitation.status = 'declined';
        await invitation.save();
        return res.status(400).json({
          success: false,
          message: 'Sorry, this team is already full.',
        });
      }

      // Verify user has not joined another team for this hackathon
      const alreadyInAnotherTeam = await Team.findOne({
        hackathon: invitation.hackathon._id,
        members: req.user._id,
      });

      if (alreadyInAnotherTeam) {
        return res.status(400).json({
          success: false,
          message: `You are already part of team "${alreadyInAnotherTeam.name}" for this hackathon.`,
        });
      }

      // Add user to team
      team.members.push(req.user._id);
      team.checkCapacity();
      await team.save();

      invitation.status = 'accepted';
      await invitation.save();

      // Decline any other pending invitations for this user for the same hackathon
      await Invitation.updateMany(
        {
          receiver: req.user._id,
          hackathon: invitation.hackathon._id,
          _id: { $ne: invitation._id },
          status: 'pending',
        },
        { status: 'declined' }
      );

      // Send status email to team leader
      if (invitation.sender && invitation.sender.email) {
        sendStatusUpdateEmail({
          toEmail: invitation.sender.email,
          toName: invitation.sender.name,
          responderName: req.user.name,
          teamName: team.name,
          status: 'accepted',
        }).catch((e) => console.error('[Mailer Async Warning]', e.message));
      }

      return res.status(200).json({
        success: true,
        message: `Hooray! You have joined team "${team.name}"!`,
        invitation,
      });
    } else {
      // Declined
      invitation.status = 'declined';
      await invitation.save();

      if (invitation.sender && invitation.sender.email) {
        sendStatusUpdateEmail({
          toEmail: invitation.sender.email,
          toName: invitation.sender.name,
          responderName: req.user.name,
          teamName: invitation.team.name,
          status: 'declined',
        }).catch((e) => console.error('[Mailer Async Warning]', e.message));
      }

      return res.status(200).json({
        success: true,
        message: 'Invitation declined.',
        invitation,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/delete an invitation
// @route   DELETE /api/invitations/:id
// @access  Private (Sender only)
const deleteInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    if (invitation.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this invitation.',
      });
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invitation canceled.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInvitation,
  getReceivedInvitations,
  getSentInvitations,
  respondToInvitation,
  deleteInvitation,
};

