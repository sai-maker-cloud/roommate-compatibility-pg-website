import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user
    })
      .populate('participants', 'name email')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const myId = req.user;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userId], $size: 2 }
    }).populate('participants', 'name email');

    if (!conversation) {
      // Verify the other user exists
      const otherUser = await User.findById(userId);
      if (!otherUser) return res.status(404).json({ message: 'User not found' });

      conversation = await Conversation.create({
        participants: [myId, userId]
      });
      conversation = await conversation.populate('participants', 'name email');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
