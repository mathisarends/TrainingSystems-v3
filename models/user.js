const mongoose = require("mongoose");
const TrainingData = require("./trainingData");
const Exercise = require("./exercises");

const TrainingPlan = require("./trainingPlanSchema");
const TrainingSchema = require("./trainingSchema"); //for new scratch trainings

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
    passwordHash: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String,
        required: false,
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

    lastVisitedTrainingMode: {
        type: String
    },

    trainingPlanTemplate: [TrainingPlan.schema], // works so far
    trainingPlansCustomNew: [TrainingPlan.schema], //also
    trainings: [TrainingSchema.schema],

    trainingData: [TrainingData.schema], 
    exercises: [Exercise.schema],
});


const User = mongoose.model("User", userSchema);
module.exports = User;