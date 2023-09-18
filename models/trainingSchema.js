//schema for a single training session - saves on session of a kind and history of sessions up to 5

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
  trainingPhase: String,
  trainings: [
    {
      trainingDate: Date,
      exercises: [
        {
          category: String,
          exercise: String,
          sets: Number,
          reps: Number,
          weight: Number,
          targetRPE: Number,
          actualRPE: Number,
          estMax: Number,
          notes: String,
        },
      ],
    },
  ],
});

const TrainingSchema = mongoose.model("TrainingSchema", trainingSchema);
module.exports = TrainingSchema;
