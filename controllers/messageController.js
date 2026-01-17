import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get conversation list (sidebar)
// @route   GET /api/v1/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Message.aggregate([
            // 1. Match messages involving the current user
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { recipient: currentUserId }
                    ]
                }
            },
            // 2. Sort by newest first
            { $sort: { createdAt: -1 } },
            // 3. Group by the conversation partner
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', currentUserId] },
                            then: '$recipient',
                            else: '$sender'
                        }
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', currentUserId] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            // 4. Lookup user details for the conversation partner
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            // 5. Unwind the partner array
            { $unwind: '$partner' },
            // 6. Project the final shape
            {
                $project: {
                    _id: 1,
                    partner: {
                        _id: '$partner._id',
                        name: '$partner.name',
                        avatar: '$partner.avatar',
                        role: '$partner.role',
                        // Add headline if available (it's nested in profile)
                        headline: '$partner.profile.headline'
                    },
                    lastMessage: {
                        content: '$lastMessage.content',
                        createdAt: '$lastMessage.createdAt',
                        isRead: '$lastMessage.isRead',
                        sender: '$lastMessage.sender'
                    },
                    unreadCount: 1
                }
            },
            // 7. Sort conversations by last message date
            { $sort: { 'lastMessage.createdAt': -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get chat history with a specific user
// @route   GET /api/v1/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, recipient: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, type, metadata } = req.body;
        const senderId = req.user.id;

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
            type: type || 'text',
            metadata
        });

        // Populate sender info for immediate UI update
        await message.populate('sender', 'name avatar');
        await message.populate('recipient', 'name avatar');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
