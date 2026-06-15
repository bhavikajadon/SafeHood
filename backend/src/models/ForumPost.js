const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["warning", "tip", "question", "general"],
      default: "warning",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);