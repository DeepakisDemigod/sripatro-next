import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, index: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    body: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    upvoters: { type: [String], default: [], index: true },
    downvoters: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);
