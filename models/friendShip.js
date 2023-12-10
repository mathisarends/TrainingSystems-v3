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
  friendSince: {
    type: Date,
    default: Date.now
  }
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;
