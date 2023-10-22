import mongoose from "mongoose";
import TrainingData from "./trainingData.js";
import Exercise from "./exercises.js";
import TrainingPlan from "./trainingPlanSchema.js";
import TrainingSchema from "./trainingSchema.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: false,
    },
    passwordHash: {
        type: String,
        required: false
    },
    bodyWeight: {
        type: Number
    },
    bodyHeight: {
        type: Number,
    },
    age: {
        type: Number
    },
    maxSquat: {
        type: Number
    },
    maxBench: {
        type: Number
    },
    maxDeadlift: {
        type: Number
    },
    total: {
        type: Number
    },
    nutrition: {
        type: String,
        enum: ["schlecht", "gut", "optimal"]
    },
    sleepQuality: {
        type: String,
        enum: ["schlecht", "gut", "optimal"]
    },
    stress: {
        type: String,
        enum: ["hoch", "mittel", "niedrig"]
    },
    doping: {
        type: String,
        enum: ["ja", "nein"]
    },
    regenerationCapacity: {
        type: String,
        enum: ["schlecht", "unterdurchschnittlich", "durchschnittlich", "gut", "perfekt"]
    },
    strengthLevel: {
        type: String,
        enum: ["Elite", "Master", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"]
    },
    trainingExperience: {
        type: String,
        enum: ["beginner", "fortgeschritten", "sehrFortgeschritten", "experte"]
    },
    gender: {
        type: String,
        enum: ["männlich", "weiblich"]
    }, 
    trainingPlanTemplate: [TrainingPlan.schema],
    trainingPlansCustomNew: [TrainingPlan.schema],
    trainings: [TrainingSchema.schema],
    archivedPlans: [TrainingPlan.schema], //fertig trainierte pläne können in das archiv verschoben werden

    trainingData: [TrainingData.schema], 
    exercises: [Exercise.schema],
});


const User = mongoose.model("User", userSchema);
export default User;