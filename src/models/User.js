import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
});

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "astrologer"], default: "user" },
    name: String,
    bio: String,
    languages: [String],
    services: [ServiceSchema],
    profileComplete: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
