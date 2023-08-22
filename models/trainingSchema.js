const mongoose = require("mongoose");
const User = require("./user");

const trainingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  lastUpdated: Date,
  trainings: [
    {
      trainingDate: Date,
      trainingNote: String,
      exercises: [
        {
          exercise: String,
          sets: Number,
          reps: Number,
          weight: Number,
          rpe: Number,
          estMax: Number,
        },
      ],
    },
  ],
});

const TrainingSchema = mongoose.model("TrainingSchema", trainingSchema);
module.exports = TrainingSchema;
