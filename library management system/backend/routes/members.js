const express = require('express');
const router = express.Router();
const { getMembers, getMember, createMember, updateMember, deleteMember } = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');
const { uploadMemberPhoto } = require('../middleware/upload');

router.get('/', authenticate, getMembers);
router.get('/:id', authenticate, getMember);
router.post('/', authenticate, uploadMemberPhoto.single('photo'), createMember);
router.put('/:id', authenticate, uploadMemberPhoto.single('photo'), updateMember);
router.delete('/:id', authenticate, deleteMember);

module.exports = router;
