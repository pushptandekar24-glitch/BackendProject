const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: 'Hey! We would love to have you on our hackathon team.',
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple pending invitations from the same team to the same user
invitationSchema.index({ team: 1, receiver: 1, status: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);

