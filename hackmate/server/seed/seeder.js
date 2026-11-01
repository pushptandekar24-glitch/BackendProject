const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Invitation = require('../models/Invitation');
const { users, hackathons } = require('./seedData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackmate';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database.');

    // Clear existing collections
    console.log('[Seeder] Clearing old records...');
    await User.deleteMany();
    await Hackathon.deleteMany();
    await Team.deleteMany();
    await Invitation.deleteMany();

    // 1. Insert Users
    console.log('[Seeder] Seeding users...');
    const createdUsers = [];
    for (const userData of users) {
      // User model pre-save hook will hash the password
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Created ${createdUsers.length} student users.`);

    // 2. Insert Hackathons
    console.log('[Seeder] Seeding hackathons...');
    const createdHackathons = [];
    for (let i = 0; i < hackathons.length; i++) {
      const hackathonData = {
        ...hackathons[i],
        organizer: createdUsers[i % createdUsers.length]._id,
      };
      const hack = await Hackathon.create(hackathonData);
      createdHackathons.push(hack);
    }
    console.log(`[Seeder] Created ${createdHackathons.length} hackathons.`);

    // 3. Create Sample Teams
    console.log('[Seeder] Seeding teams...');

    // Team 1: NeuralCrafters for Global AI Hack 2026
    const team1 = await Team.create({
      name: 'NeuralCrafters',
      description:
        'Building an agentic code refactoring workspace that autonomously tests and documents legacy codebases. Seeking a frontend UI wizard and cloud specialist!',
      hackathon: createdHackathons[0]._id, // Global AI Hack 2026
      leader: createdUsers[0]._id, // Aarav Sharma
      members: [createdUsers[0]._id, createdUsers[1]._id], // Aarav + Maya Lin
      requiredSkills: ['UI/UX Design', 'Tailwind CSS', 'Docker', 'FastAPI'],
      maxMembers: 4,
      status: 'Open',
    });

    // Team 2: PulseAI for HealthHacks Global 2026
    const team2 = await Team.create({
      name: 'PulseAI BioSense',
      description:
        'Developing an on-device anomaly detection algorithm for wearable photoplethysmography (PPG) sensors to spot cardiac arrhythmias before symptoms appear.',
      hackathon: createdHackathons[3]._id, // HealthHacks Global 2026
      leader: createdUsers[3]._id, // Zainab Patel
      members: [createdUsers[3]._id, createdUsers[4]._id], // Zainab + Elena Rostova
      requiredSkills: ['AI/ML Engineer', 'Python', 'Data Scientist'],
      maxMembers: 4,
      status: 'Open',
    });

    // Team 3: VeriChain DeFi for Web3 & DeFi Summit Buildathon
    const team3 = await Team.create({
      name: 'VeriChain Protocol',
      description:
        'Building a zero-knowledge compliance layer for cross-chain liquidity pools with sub-second proving times.',
      hackathon: createdHackathons[2]._id, // Web3 Summit
      leader: createdUsers[5]._id, // Marcus Vance
      members: [createdUsers[5]._id], // Marcus Vance alone looking for team
      requiredSkills: ['Solidity', 'Rust', 'React', 'Smart Contracts'],
      maxMembers: 3,
      status: 'Open',
    });

    console.log(`[Seeder] Created 3 initial teams.`);

    // 4. Create Sample Invitations
    console.log('[Seeder] Seeding invitations...');

    // Pending invite: Aarav (NeuralCrafters) invites Liam O'Connor (UI/UX)
    await Invitation.create({
      team: team1._id,
      hackathon: createdHackathons[0]._id,
      sender: createdUsers[0]._id,
      receiver: createdUsers[2]._id, // Liam
      message:
        'Hey Liam! Saw your MIT design portfolio—your micro-interaction work is incredible. We are building an agentic devtool for Global AI Hack and would love your UX magic on the team.',
      status: 'pending',
    });

    // Accepted invite: Zainab invited Elena to PulseAI
    await Invitation.create({
      team: team2._id,
      hackathon: createdHackathons[3]._id,
      sender: createdUsers[3]._id,
      receiver: createdUsers[4]._id, // Elena
      message:
        'Hi Elena! We need a stellar mobile developer for our cardiac sensor app. Would you like to team up for HealthHacks?',
      status: 'accepted',
    });

    // Pending invite: Marcus invites Zainab (or another student)
    await Invitation.create({
      team: team3._id,
      hackathon: createdHackathons[2]._id,
      sender: createdUsers[5]._id,
      receiver: createdUsers[0]._id,
      message:
        'Aarav, your distributed systems work would be a game-changer for our zk-Rollup project at the Web3 Summit!',
      status: 'pending',
    });

    console.log(`[Seeder] Created sample invitations.`);

    console.log('\n======================================================');
    console.log('✅  HACKMATE DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Accounts for Login (Password: "password123"):');
    createdUsers.forEach((u) => {
      console.log(`- ${u.name} (${u.preferredRole}): ${u.email}`);
    });
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedDB();

