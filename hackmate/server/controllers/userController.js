const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Get all student profiles with search and filters
// @route   GET /api/users
// @access  Public (or protected)
const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      skill,
      role,
      college,
      interest,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Don't show current logged in user in results if authenticated
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { college: searchRegex },
        { bio: searchRegex },
        { skills: searchRegex },
        { interests: searchRegex },
      ];
    }

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    if (role && role !== 'All') {
      query.preferredRole = role;
    }

    if (college) {
      query.college = new RegExp(college, 'i');
    }

    if (interest) {
      query.interests = { $regex: new RegExp(interest, 'i') };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum) || 1,
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    // Get public teams this user is a part of
    const teams = await Team.find({ members: user._id })
      .populate('hackathon', 'title theme startDate endDate mode bannerUrl')
      .populate('leader', 'name avatar');

    res.status(200).json({
      success: true,
      user,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in student profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const {
      name,
      college,
      bio,
      preferredRole,
      skills,
      interests,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    if (name) user.name = name;
    if (college) user.college = college;
    if (bio !== undefined) user.bio = bio;
    if (preferredRole) user.preferredRole = preferredRole;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests.map((i) => i.trim()).filter(Boolean)
        : typeof interests === 'string'
        ? interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];
    }
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile avatar and/or resume document
// @route   POST /api/users/upload
// @access  Private
const uploadFiles = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let updated = false;

    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        user.avatar = `/uploads/${req.files.avatar[0].filename}`;
        updated = true;
      }
      if (req.files.resume && req.files.resume[0]) {
        user.resume = `/uploads/${req.files.resume[0].filename}`;
        updated = true;
      }
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No avatar or resume file was uploaded.',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully!',
      avatar: user.avatar,
      resume: user.resume,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  uploadFiles,
};

