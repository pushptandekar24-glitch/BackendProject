const { validationResult } = require('express-validator');
const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const Invitation = require('../models/Invitation');

// @desc    Get all teams (with optional hackathon filter)
// @route   GET /api/teams
// @access  Public
const getTeams = async (req, res, next) => {
  try {
    const { hackathonId, status, skill, search } = req.query;
    const query = {};

    if (hackathonId) {
      query.hackathon = hackathonId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (skill) {
      query.requiredSkills = { $regex: new RegExp(skill, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const teams = await Team.find(query)
      .populate('hackathon', 'title theme startDate endDate mode bannerUrl')
      .populate('leader', 'name email avatar college preferredRole')
      .populate('members', 'name email avatar college preferredRole skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Public
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('hackathon', 'title theme startDate endDate mode bannerUrl maxTeamSize')
      .populate('leader', 'name email avatar college preferredRole bio skills')
      .populate('members', 'name email avatar college preferredRole skills bio githubUrl linkedinUrl');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    // Get any active invitations for this team if caller is the leader
    let invitations = [];
    if (req.user && team.leader._id.toString() === req.user._id.toString()) {
      invitations = await Invitation.find({ team: team._id })
        .populate('receiver', 'name email avatar college preferredRole skills')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      team,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new team for a hackathon
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, description, hackathonId, requiredSkills, maxMembers } = req.body;

    // Verify hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found.',
      });
    }

    // Check if the current user is already in a team for this hackathon
    const existingMembership = await Team.findOne({
      hackathon: hackathonId,
      members: req.user._id,
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: `You are already a member of team "${existingMembership.name}" for this hackathon. A student can only join one team per hackathon.`,
      });
    }

    const parsedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const effectiveMaxMembers = Math.min(
      maxMembers || hackathon.maxTeamSize || 4,
      hackathon.maxTeamSize || 10
    );

    const team = await Team.create({
      name,
      description: description || '',
      hackathon: hackathonId,
      leader: req.user._id,
      members: [req.user._id],
      requiredSkills: parsedSkills,
      maxMembers: effectiveMaxMembers,
      status: effectiveMaxMembers <= 1 ? 'Full' : 'Open',
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('hackathon', 'title theme startDate endDate mode bannerUrl')
      .populate('leader', 'name email avatar college preferredRole')
      .populate('members', 'name email avatar college preferredRole');

    res.status(201).json({
      success: true,
      message: 'Team created successfully!',
      team: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (Leader only)
const updateTeam = async (req, res, next) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader can modify team details.',
      });
    }

    const { name, description, requiredSkills, maxMembers } = req.body;

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (requiredSkills !== undefined) {
      team.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === 'string'
        ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (maxMembers) {
      if (maxMembers < team.members.length) {
        return res.status(400).json({
          success: false,
          message: `Cannot set max members to ${maxMembers} because team already has ${team.members.length} members.`,
        });
      }
      team.maxMembers = maxMembers;
    }

    team.checkCapacity();
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('hackathon', 'title theme startDate endDate mode')
      .populate('leader', 'name email avatar college')
      .populate('members', 'name email avatar college preferredRole');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully!',
      team: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Leader only)
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader can delete this team.',
      });
    }

    // Clean up invitations for this team
    await Invitation.deleteMany({ team: team._id });
    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team and associated invitations deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave team or remove member
// @route   POST /api/teams/:id/members/remove
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    const isLeader = team.leader.toString() === req.user._id.toString();
    const isSelfLeaving = req.user._id.toString() === memberId;

    if (!isLeader && !isSelfLeaving) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this team.',
      });
    }

    if (team.leader.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Team leader cannot leave the team directly. Please delete the team or transfer leadership.',
      });
    }

    team.members = team.members.filter((m) => m.toString() !== memberId);
    team.checkCapacity();
    await team.save();

    res.status(200).json({
      success: true,
      message: isSelfLeaving ? 'You have left the team.' : 'Member removed from team.',
      team,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  removeMember,
};

