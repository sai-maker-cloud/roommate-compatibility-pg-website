import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ viewat: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // Verify user is participant
    if (!conversation.participants.some(p => p.toString() === req.user.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const [user1, user2] = conversation.participants;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ viewat: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
