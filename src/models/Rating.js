import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  astrologerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEmail: String,
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
