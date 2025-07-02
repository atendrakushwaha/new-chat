const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middelwares/auth.middelware');

router.get('/users', auth, chatController.getAllUsers);
router.get('/messages/:receiverId', auth, chatController.getMessages);
router.post('/messages/:receiverId', auth, chatController.sendMessage);

module.exports = router;

