const mongoose = require("mongoose");
//saves the best squat, bench, deadlift set in order to calculate strenght level and individualized volume

const trainingDataSchema = new mongoose.Schema({
    recentSquatWeight: {
        type: Number,
    },
    recentSquatReps: {
        type: Number,
    },
    recentBenchWeight: {
        type: Number,
    },
    recentBenchReps: {
        type: Number,
    },
    recentDeadliftWeight: {
        type: Number,
    },
    recentDeadliftReps: {
        type: Number,
    },
    minimumSetsSquat: {
        type: Number,
    }, 
    maximumSetsSquat: {
        type: Number,
    },
    minimumSetsBench: {
        type: Number,
    }, 
    maximumSetsBench: {
        type: Number,
    },
    minimumSetsDeadlift: {
        type: Number,
    }, 
    maximumSetsDeadlift: {
        type: Number,
    }
});

const TrainingData = mongoose.model("TrainingData", trainingDataSchema);
module.exports = TrainingData;