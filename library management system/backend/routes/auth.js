const express = require('express');
const router = express.Router();
const { login, logout, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, uploadAvatar.single('avatar'), updateProfile);

module.exports = router;
