import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false, // Allow anonymous users
      default: null,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'bot'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sessionId: {
      type: String,
      required: true,
      unique: true, // One session per document
    },
    lastInteraction: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      context: {
        // Store relevant user context for better responses
        currentPage: String,
        userRole: {
          type: String,
          enum: ['customer', 'owner', 'deliveryBoy', 'admin'],
        },
      },
    },
  },
  { timestamps: true }
);

// Auto-delete sessions older than 24 hours (for privacy)
chatMessageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 } // 24 hours
);

export default mongoose.model('ChatMessage', chatMessageSchema);
