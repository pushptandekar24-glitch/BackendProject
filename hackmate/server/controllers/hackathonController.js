const { validationResult } = require('express-validator');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');

// @desc    Get all hackathons with search and filter
// @route   GET /api/hackathons
// @access  Public
const getHackathons = async (req, res, next) => {
  try {
    const {
      search,
      theme,
      mode,
      skill,
      upcoming,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { theme: searchRegex },
        { location: searchRegex },
      ];
    }

    if (theme && theme !== 'All') {
      query.theme = new RegExp(theme, 'i');
    }

    if (mode && mode !== 'All') {
      query.mode = mode;
    }

    if (skill) {
      query.skillsRequired = { $regex: new RegExp(skill, 'i') };
    }

    if (upcoming === 'true') {
      query.endDate = { $gte: new Date() };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Hackathon.countDocuments(query);
    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email avatar college')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch team counts for each hackathon
    const hackathonIds = hackathons.map((h) => h._id);
    const teamCounts = await Team.aggregate([
      { $match: { hackathon: { $in: hackathonIds } } },
      { $group: { _id: '$hackathon', count: { $sum: 1 } } },
    ]);

    const teamCountMap = {};
    teamCounts.forEach((tc) => {
      teamCountMap[tc._id.toString()] = tc.count;
    });

    const hackathonsWithCounts = hackathons.map((h) => {
      const obj = h.toObject();
      obj.teamsCount = teamCountMap[h._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      hackathons: hackathonsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hackathon by ID with associated teams
// @route   GET /api/hackathons/:id
// @access  Public
const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate(
      'organizer',
      'name email avatar college'
    );

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found.',
      });
    }

    // Find active teams looking for members or registered for this hackathon
    const teams = await Team.find({ hackathon: hackathon._id })
      .populate('leader', 'name avatar email college')
      .populate('members', 'name avatar college preferredRole skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      hackathon,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new hackathon listing
// @route   POST /api/hackathons
// @access  Private
const createHackathon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const {
      title,
      tagline,
      description,
      theme,
      mode,
      location,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      minTeamSize,
      maxTeamSize,
      skillsRequired,
      websiteUrl,
      bannerUrl,
    } = req.body;

    const parsedSkills = Array.isArray(skillsRequired)
      ? skillsRequired
      : typeof skillsRequired === 'string'
      ? skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const hackathon = await Hackathon.create({
      title,
      tagline,
      description,
      theme,
      mode,
      location: location || (mode === 'Online' ? 'Virtual' : 'In-Person Venue'),
      startDate,
      endDate,
      registrationDeadline,
      prizePool: prizePool || '$10,000',
      minTeamSize: minTeamSize || 1,
      maxTeamSize: maxTeamSize || 4,
      skillsRequired: parsedSkills,
      websiteUrl,
      bannerUrl:
        bannerUrl ||
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      organizer: req.user._id,
    });

    const populatedHackathon = await Hackathon.findById(hackathon._id).populate(
      'organizer',
      'name avatar email college'
    );

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully!',
      hackathon: populatedHackathon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hackathon listing
// @route   PUT /api/hackathons/:id
// @access  Private (Owner only)
const updateHackathon = async (req, res, next) => {
  try {
    let hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found.',
      });
    }

    // Check ownership
    if (hackathon.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this hackathon listing.',
      });
    }

    const fieldsToUpdate = { ...req.body };
    if (fieldsToUpdate.skillsRequired) {
      fieldsToUpdate.skillsRequired = Array.isArray(fieldsToUpdate.skillsRequired)
        ? fieldsToUpdate.skillsRequired
        : typeof fieldsToUpdate.skillsRequired === 'string'
        ? fieldsToUpdate.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).populate('organizer', 'name email avatar college');

    res.status(200).json({
      success: true,
      message: 'Hackathon updated successfully!',
      hackathon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hackathon listing
// @route   DELETE /api/hackathons/:id
// @access  Private (Owner only)
const deleteHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found.',
      });
    }

    // Check ownership
    if (hackathon.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this hackathon listing.',
      });
    }

    await hackathon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hackathon listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
};

