const express = require('express');
const { body } = require('express-validator');
const {
  getHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
} = require('../controllers/hackathonController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const hackathonValidation = [
  body('title').trim().notEmpty().withMessage('Hackathon title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('theme').trim().notEmpty().withMessage('Theme is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Valid registration deadline is required'),
];

router.get('/', getHackathons);
router.get('/:id', getHackathonById);
router.post('/', protect, hackathonValidation, createHackathon);
router.put('/:id', protect, updateHackathon);
router.delete('/:id', protect, deleteHackathon);

module.exports = router;

