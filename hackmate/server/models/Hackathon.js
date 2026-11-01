const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a hackathon title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
    },
    theme: {
      type: String,
      required: [true, 'Please specify the primary theme'],
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'In-Person', 'Hybrid'],
      default: 'Online',
    },
    location: {
      type: String,
      default: 'Virtual',
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    prizePool: {
      type: String,
      default: '$10,000',
      trim: true,
    },
    minTeamSize: {
      type: Number,
      default: 1,
      min: [1, 'Minimum team size must be at least 1'],
    },
    maxTeamSize: {
      type: Number,
      default: 4,
      min: [1, 'Maximum team size must be at least 1'],
      max: [10, 'Maximum team size cannot exceed 10'],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      default: '',
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for fast search queries
hackathonSchema.index({ title: 'text', description: 'text', theme: 'text' });

module.exports = mongoose.model('Hackathon', hackathonSchema);

