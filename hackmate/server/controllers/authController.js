const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const Invitation = require('../models/Invitation');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hackmate_dev_secret_key_98234729384729348',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password, college } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college,
    });

    const token = generateToken(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check for user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized dashboard summary for user
// @route   GET /api/auth/dashboard
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Teams user is a member or leader of
    const myTeams = await Team.find({ members: userId })
      .populate('hackathon', 'title theme mode startDate endDate bannerUrl')
      .populate('leader', 'name avatar email college')
      .populate('members', 'name avatar college preferredRole')
      .sort({ createdAt: -1 });

    // 2. Pending invitations received
    const pendingInvitations = await Invitation.find({
      receiver: userId,
      status: 'pending',
    })
      .populate('team', 'name description requiredSkills members maxMembers')
      .populate('hackathon', 'title theme mode startDate endDate bannerUrl')
      .populate('sender', 'name avatar college')
      .sort({ createdAt: -1 });

    // 3. Recommended hackathons (upcoming hackathons)
    const upcomingHackathons = await Hackathon.find({
      endDate: { $gte: new Date() },
    })
      .populate('organizer', 'name avatar college')
      .sort({ startDate: 1 })
      .limit(4);

    // 4. Suggested teammates (students other than current user)
    // Complementary matching: users who share interests or have different roles
    const suggestedTeammates = await User.find({
      _id: { $ne: userId },
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      summary: {
        stats: {
          myTeamsCount: myTeams.length,
          pendingInvitesCount: pendingInvitations.length,
          upcomingHackathonsCount: upcomingHackathons.length,
        },
        myTeams,
        pendingInvitations,
        recommendedHackathons: upcomingHackathons,
        suggestedTeammates,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getDashboardSummary,
};

