import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Hier musst du den richtigen Namen deines Benutzermodells angeben
    required: true
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Hier musst du den richtigen Namen deines Benutzermodells angeben
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "sent"],
    default: "sent"
  },
  friendSince: {
    type: Date,
    default: Date.now
  }
});

// Eindeutiger Index für die Kombination von "user" und "friend"
friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;
