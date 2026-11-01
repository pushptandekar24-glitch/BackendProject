const express = require('express');
const { body } = require('express-validator');
const {
  sendInvitation,
  getReceivedInvitations,
  getSentInvitations,
  respondToInvitation,
  deleteInvitation,
} = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const invitationValidation = [
  body('teamId').notEmpty().withMessage('Team ID is required'),
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
];

router.post('/', protect, invitationValidation, sendInvitation);
router.get('/received', protect, getReceivedInvitations);
router.get('/sent', protect, getSentInvitations);
router.put('/:id/respond', protect, respondToInvitation);
router.delete('/:id', protect, deleteInvitation);

module.exports = router;

