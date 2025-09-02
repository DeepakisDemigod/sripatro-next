// models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  userEmail: String,
  astrologerId: String,
  astrologerEmail: String,
  service: { title: String, price: Number },
  message: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
