const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      trim: true,
      maxlength: [60, 'Team name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Team must be associated with a hackathon'],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    requiredSkills: {
      type: [String],
      default: [],
    },
    maxMembers: {
      type: Number,
      default: 4,
      min: [1, 'Maximum members must be at least 1'],
      max: [10, 'Maximum members cannot exceed 10'],
    },
    status: {
      type: String,
      enum: ['Open', 'Full', 'Completed'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if team is full
teamSchema.methods.checkCapacity = function () {
  if (this.members.length >= this.maxMembers) {
    this.status = 'Full';
  } else {
    this.status = 'Open';
  }
};

module.exports = mongoose.model('Team', teamSchema);

