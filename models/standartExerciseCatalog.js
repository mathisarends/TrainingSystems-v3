// Define a fixed dataset of exercises, rep schemes and pause times


const placeholder = {
  name: "- Bitte Auswählen -",
}

const Squat = {
  name: "Squat",
  pauseTime: 240,
  defaultSets: 3,
  defaultReps: 7,
  defaultRPE: 7.5
}

const Bench = {
  name: "Bench",
  pauseTime: 180,
  defaultSets: 4,
  defaultReps: 8,
  defaultRPE: 8
}

const Deadlift = {
  name: "Deadlift",
  pauseTime: 240,
  defaultSets: 3,
  defaultReps: 6,
  defaultRPE: 7
}

const Overheadpress = {
  name: "Overheadpress",
  pauseTime: 150,
  defaultSets: 3,
  defaultReps: 10,
  defaultRPE: 8.5
}

const Chest = {
  name: "Chest",
  pauseTime: 120,
}

const Back = {
  name: "Back",
  pauseTime: 120,
}

const Shoulder = {
  name: "Shoulder",
  pauseTime: 90
}

const Triceps = {
  name: "Triceps",
  pauseTime: 90
}
const Biceps = {
  name: "Biceps",
  pauseTime: 90
}

const Legs = {
  name: "Legs",
  pauseTime: 120,
  defaultRPE: 8.5
}



const standartExerciseCatalog = [
        {
          name: "Placeholder",
          category: placeholder
        },
        {
          name: "Lowbar - Squat",
          category: Squat,
        },
        {
          name: "Highbar - Squat",
          category: Squat,
        },
        {
          name: "Paused Squat",
          category: Squat
        },
        {
          name: "Tempo Squat (3:1:0)",
          category: Squat
        },
        {
          name: "Hack-Squat",
          category: Squat
        },
        {
          name: "Bulgurian Split Squats",
          category: Squat
        },
        {
          name: "Legpress",
          category: Squat
        },
        {
          name: "Comp. Bench",
          category: Bench
        },
        {
          name: "Larsen Press",
          category: Bench
        },
        {
          name: "Close Grip Bench",
          category: Bench
        },
        {
          name: "Spoto Bench",
          category: Bench
        },
        {
          name: "Tempo Bench",
          category: Bench
        },
        {
          name: "3ct Pause Bench",
          category: Bench
        },
        {
          name: "Chestpress",
          category: Bench
        },
        {
          name: "Incline Press",
          category: Bench
        },
        {
          name: "Conventional",
          category: Deadlift
        },
        {
          name: "Sumo",
          category: Deadlift
        },
        {
          name: "Paused Deadlift",
          category: Deadlift
        },
        {
          name: "Deficit Deadlift",
          category: Deadlift
        },
        {
          name: "RDLs",
          category: Deadlift
        },
        {
          name: "B-Stance RDLs",
          category: Deadlift
        },
        {
          name: "Stiff-Leg DL",
          category: Deadlift
        },
        {
          name: "Overheadpress",
          category: Overheadpress
        },
        {
          name: "Push-Press",
          category: Overheadpress
        },
        {
          name: "Dumbell Overheadpress",
          category: Overheadpress
        },
        {
          name: "Shoulderpress",
          category: Overheadpress
        },
        {
          name: "Dips",
          category: Chest
        },
        {
          name: "Butterfly",
          category: Chest
        },
        {
          name: "Deficit Pushups",
          category: Chest
        },
    
        {
          name: "Pull-Up",
          category: Back
        },
        {
          name: "Dumbell Row",
          category: Back
        },
        {
          name: "Pulldowns (wide-grip)",
          category: Back
        },
        {
          name: "Pulldowns (close-grip)",
          category: Back
        },
        {
          name: "T-Bar Row",
          category: Back
        },
        {
          name: "Chestsupported Row",
          category: Back
        },
        {
          name: "Reverse Flyes",
          category: Shoulder
        },
        {
          name: "Lateral Raise",
          category: Shoulder
        },
        {
          name: "Facepulls",
          category: Shoulder
        },
        {
          name: "Upright Rows",
          category: Shoulder
        },
        {
          name: "Front-Raises",
          category: Shoulder
        },
        {
          name: "Triceps-Extensions",
          category: Triceps
        },
        {
          name: "French-Press Flat",
          category: Triceps
        },
        {
          name: "Cable-Pushdowns",
          category: Triceps
        },
        {
          name: "Diamond Pushups",
          category: Triceps
        },
    
        {
          name: "Biceps-Curls",
          category: Biceps
        },
        {
          name: "Cable Curls",
          category: Biceps
        },
        {
          name: "Hammer Curls",
          category: Biceps
        },
        {
          name: "Hip Thrusts",
          category: Legs
        },
        {
          name: "Hyperextensions",
          category: Legs
        },

        {
          name: "Leg Extension",
          category: Legs
        },
    
        {
          name: "Leg Curl",
          category: Legs
        },
        {
          name: "Calf Raises",
          category: Legs
        },
        {
          name: "Hip Adduction",
          category: Legs
        },
        {
          name: "Hip Abduction",
          category: Legs
        },
];

export default standartExerciseCatalog;