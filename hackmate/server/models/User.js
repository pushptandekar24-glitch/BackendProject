const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    college: {
      type: String,
      required: [true, 'Please provide your university or college name'],
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [600, 'Bio cannot exceed 600 characters'],
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    preferredRole: {
      type: String,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'Fullstack Developer',
        'Mobile Developer',
        'AI/ML Engineer',
        'UI/UX Designer',
        'DevOps/Cloud',
        'Product Manager',
        'Data Scientist',
        'General Hacker',
      ],
      default: 'Fullstack Developer',
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: '',
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

