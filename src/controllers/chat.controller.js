const Message = require('../models/message.model');
const User = require('../models/user.model');

// ✅ Get all users excluding current
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ✅ Get messages between logged-in user and another
exports.getMessages = async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.receiverId;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// ✅ Send message API
exports.sendMessage = async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.receiverId;
  const { message } = req.body;

  try {
    const newMessage = await Message.create({ senderId, receiverId, message });
    res.status(201).json({ message: newMessage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};
