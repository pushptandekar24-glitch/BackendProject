const express = require('express');
const {
  getUsers,
  getUserById,
  updateProfile,
  uploadFiles,
} = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', optionalProtect, getUsers);
router.put('/profile', protect, updateProfile);
router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  uploadFiles
);
router.get('/:id', optionalProtect, getUserById);

module.exports = router;

