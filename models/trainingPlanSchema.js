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
  lastWeekDeload: Boolean,
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
          fatiqueLevel: { //newly added in order to track fatique level and make automatic volume changes:
            type: String,
            enum: ["niedrig", "mittel", "hoch"]
          }
        },
      ],
      squatSetsDone: Number,
      squatTonnage: Number,
      benchSetsDone: Number,
      benchTonnage: Number,
      deadliftSetsDone: Number,
      deadliftTonnage: Number,
    },
  ],
});

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
export default TrainingPlan;
