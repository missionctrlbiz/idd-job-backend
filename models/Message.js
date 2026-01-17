import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'attachment', 'invitation'],
        default: 'text'
    },
    metadata: {
        // For invitations or other rich message types
        date: Date,
        time: String,
        location: String,
        status: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String // URLs
    }]
}, {
    timestamps: true
});

// Compound index for rapid retrieval of chat history
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
