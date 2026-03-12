// Food Reel Model
import mongoose from "mongoose";

const ReelSchema = new mongoose.Schema({
  video: { type: String, required: true },
  caption: { type: String },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      message: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      replies: [
        {
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          message: {
            type: String
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  ]
}, { timestamps: true });

const Reel = mongoose.model('Reel', ReelSchema);
export default Reel;