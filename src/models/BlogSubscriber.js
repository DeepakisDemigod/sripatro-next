import mongoose from "mongoose";

const BlogSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  locale: { type: String, default: "en", index: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false, index: true },
  verifyToken: { type: String, index: true },
  verifyTokenExpires: { type: Date },
  unsubscribeToken: { type: String, index: true },
  source: { type: String, default: "blog-form" },
});

export default mongoose.models.BlogSubscriber ||
  mongoose.model("BlogSubscriber", BlogSubscriberSchema);
