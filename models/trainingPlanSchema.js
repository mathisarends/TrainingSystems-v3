import mongoose from "mongoose";

const trainingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  title: String,
  trainingFrequency: Number,
  trainingPhase: String,
  lastUpdated: Date,
  trainingWeeks: [
    {
      trainingDays: [
        {
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
          trainingDayNotes: String,
        },
      ],
    },
  ],
});

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
export default TrainingPlan;