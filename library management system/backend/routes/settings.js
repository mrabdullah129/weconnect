const express = require('express');
const router = express.Router();
const {
  getSettings, updateSettings, getActivityLogs,
  getUsers, createUser, updateUser, deleteUser
} = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize('admin'), uploadAvatar.single('logo'), updateSettings);
router.get('/activity-logs', authenticate, getActivityLogs);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.post('/users', authenticate, authorize('admin'), createUser);
router.put('/users/:id', authenticate, authorize('admin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
