import mongoose, { mongo } from "mongoose";

const friendSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  friendsSince: {
    type: Date,
    required: false
  }
});

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
