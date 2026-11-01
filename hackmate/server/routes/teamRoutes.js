const express = require('express');
const { body } = require('express-validator');
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  removeMember,
} = require('../controllers/teamController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

const teamValidation = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('hackathonId').notEmpty().withMessage('Hackathon ID is required'),
];

router.get('/', getTeams);
router.get('/:id', optionalProtect, getTeamById);
router.post('/', protect, teamValidation, createTeam);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);
router.post('/:id/members/remove', protect, removeMember);

module.exports = router;

