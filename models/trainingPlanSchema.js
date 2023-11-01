import mongoose from "mongoose";

const trainingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  typeOfPlan: {
    type: String,
    enum: ["custom", "template"],
    required: false,
  },
  weightPlaceholders: { //new implement this in edit and create route
    type: String, 
    enum: ["basedOnMax", "basedOnLastWeek", "off"]
  },
  title: String,
  trainingFrequency: Number,
  trainingPhase: String,
  lastUpdated: Date,
  automaticProgression: Boolean, //new entry for automatic progression in main exercises over the weeks
  lastWeekDeload: Boolean,
  lastWeekDeloadHandled: Boolean, //legacy could be removed?
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
              weight: String, //for 100;100 quotation see if it makes trouble:
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
      parentTrainingPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrainingPlan",
      },
    },
  ],
});

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
export default TrainingPlan;
