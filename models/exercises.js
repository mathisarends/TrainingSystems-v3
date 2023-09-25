import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        name: {
            type: String,
            required: true
        },
        pauseTime: {
            type: Number,
            default: 60,
        },
        defaultSets: {
            type: Number,
            default: 3
        },
        defaultReps: {
            type: Number,
            default: 12,
        },
        defaultRPE: {
            type: Number,
            default: 9,
        },
    }
});

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;