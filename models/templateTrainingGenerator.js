const NewTrainingPlan = require("./trainingPlanSchema");

const placeholderExercise = {
    category: "",
    exercise: "",
    sets: null,
    reps: null,
    weight: null,
    targetRPE: null,
    actualRPE: null,
    estMax: null,
    notes: "",
  };
  
  function createTemplatePlanA(userID) {
  
    const curDate = new Date();
    const trainingWeeks = createExerciseWeeksAndDaysTemplateA();
  
    const templateTrainingPlan = new NewTrainingPlan({
      user: userID,
      title: "Template A",
      trainingFrequency: 4,
      trainingPhase: "hypertrophie",
      lastUpdated: curDate,
      trainingWeeks: trainingWeeks,
  
    })
    return templateTrainingPlan;
  }
  
  function createTemplatePlanB(userID) {
    const curDate = new Date();
    const trainingWeeks = createExerciseWeeksAndDaysTemplateB();
  
    const templateTrainingPlan = new NewTrainingPlan({
      user: userID,
      title: "Template B",
      trainingFrequency: 4,
      trainingPhase: "kraft",
      lastUpdated: curDate,
      trainingWeeks: trainingWeeks
    })
    return templateTrainingPlan;
  }
  
  
  // helper function to create the weeks and the associated exercises:
  function createExerciseWeeksAndDaysTemplateA() {
    const trainingWeeks = [];
    const weeksCount = 4; // Number of weeks
    const daysPerWeek = 4; // Number of training days per week
  
    let topRPE = 7.5;
    let backoffRPE = 6.5;
  
  
    for (let week = 0; week < weeksCount; week++) {
      const trainingDays = [];
  
      //defining exercise Array for each day: 
    const day1Exercises = [
      {
        category: "Squat",
        exercise: "High-Bar Squat",
        sets: 1,
        reps: 6,
        targetRPE: topRPE,
      },
      {
        category: "Squat",
        exercise: "High-Bar Squat",
        sets: 3,
        reps: 6,
        targetRPE: backoffRPE,
      },
      {
        category: "Bench",
        exercise: "Comp. Bench",
        sets: 1,
        reps: 8,
        targetRPE: topRPE,
      },
      {
        category: "Bench",
        exercise: "Comp. Bench",
        sets: 3,
        reps: 8,
        targetRPE: 7,
      },
      {
        category: "Overheadpress",
        exercise: "Shoulderpress",
        sets: 3,
        reps: 8,
        targetRPE: 8,
      },
      {
        category: "Squat",
        exercise: "Legpress",
        sets: 2,
        reps: 12,
        targetRPE: 8,
      },
      {
        category: "Back",
        exercise: "Chestsupported Rows",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
      {
        category: "Triceps",
        exercise: "Triceps-Extensions",
        sets: 2,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
    ];
  
    const day2Exercises = [
      {
        category: "Deadlift",
        exercise: "Conventional Deadlift",
        sets: 5,
        reps: 6,
        targetRPE: topRPE,
      },
      {
        category: "Bench",
        exercise: "Incline Benchpress",
        sets: 3,
        reps: 8,
        targetRPE: 8,
      },
      {
        category: "Squat",
        exercise: "Legpress (unilateral)",
        sets: 2,
        reps: 10,
        targetRPE: 8,
      },
      {
        category: "Back",
        exercise: "Dumbell Row",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
      {
        category: "Shoulder",
        exercise: "Reverse Flys",
        sets: 4,
        reps: 12,
        targetRPE: 9,
      },
      {
        category: "Biceps",
        exercise: "Biceps-Curls",
        sets: 4,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
      placeholderExercise
    ];
  
    const day3Exercises = [
      {
        category: "Squat",
        exercise: "Tempo Squat (3:1:0)",
        sets: 2,
        reps: 5,
        targetRPE: topRPE,
      },
      {
        category: "Squat",
        exercise: "Highbar - Squat",
        sets: 2,
        reps: 10,
        targetRPE: 8,
      },
      {
        category: "Bench",
        exercise: "Bench (close grip)",
        sets: 4,
        reps: 8,
        targetRPE: topRPE,
      },
      {
        category: "Overheadpress",
        exercise: "Shoulderpress",
        sets: 3,
        reps: 10,
        targetRPE: 8,
      },
      {
        category: "Back",
        exercise: "Pendlay Rows",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
      {
        category: "Triceps",
        exercise: "Triceps-Extensions",
        sets: 2,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
      placeholderExercise
    ];
  
    const day4Exercises = [
      {
        category: "Deadlift",
        exercise: "Deficit Deadlift",
        sets: 1,
        reps: 7,
        targetRPE: topRPE,
      },
      {
        category: "Deadlift",
        exercise: "Deficit Deadlift",
        sets: 2,
        reps: 7,
        targetRPE: backoffRPE,
      },
      {
        category: "Deadlift",
        exercise: "RDLs",
        sets: 2,
        reps: 12,
        targetRPE: 8,
      },
      {
        category: "Bench",
        exercise: "Spoto Benchpress",
        sets: 3,
        reps: 7,
        targetRPE: topRPE,
      },
      {
        category: "Bench",
        exercise: "Chestpress",
        sets: 2,
        reps: 12,
        targetRPE: 9,
      },
      {
        category: "Back",
        exercise: "Lat Pulldown",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
      placeholderExercise
    ];
  
      // define each day of the training Week
      for (let day = 0; day < daysPerWeek; day++) {
        // Rotate through exercise arrays based on index
  
        let exercises;
        switch (day) {
          case 0:
            exercises = day1Exercises;
            break;
          case 1:
            exercises = day2Exercises;
            break;
          case 2: 
            exercises = day3Exercises;
            break;
          case 3:
            exercises = day4Exercises;
            break;
          default:
              exercises = day1Exercises;
        }
  
        const trainingDay = {
          exercises: exercises,
          trainingDayNotes: "",
        }
        trainingDays.push(trainingDay);
      }
  
      const trainingWeek = {
        trainingDays: trainingDays
      }
  
      topRPE += 0.5;
      backoffRPE += 0.5;
  
      trainingWeeks.push(trainingWeek);
    }
  
    return trainingWeeks;
  }
  
  function createExerciseWeeksAndDaysTemplateB() {
    const trainingWeeks = [];
    const weeksCount = 4; // Number of weeks
    const daysPerWeek = 4; // Number of training days per week
  
    let topRPE = 7;
    let backoffRPE = 6.5;
  
  
    for (let week = 0; week < weeksCount; week++) {
      const trainingDays = [];
  
      //defining exercise Array for each day: 
    const day1Exercises = [
      {
        category: "Squat",
        exercise: "Lowbar-Squat",
        sets: 3,
        reps: 4,
        targetRPE: topRPE,
      },
      {
        category: "Bench",
        exercise: "Comp. Bench",
        sets: 1,
        reps: 3,
        targetRPE: backoffRPE,
      },
      {
        category: "Bench",
        exercise: "Comp. Bench",
        sets: 3,
        reps: 5,
        targetRPE: backoffRPE,
      },
      {
        category: "Overheadpress",
        exercise: "Shoulderpress",
        sets: 3,
        reps: 10,
        targetRPE: 7,
      },
      {
        category: "Squat",
        exercise: "Legpress (unilateral)",
        sets: 2,
        reps: 12,
        targetRPE: 8,
      },
      {
        category: "Back",
        exercise: "Chestsupported Rows",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
      {
        category: "Biceps",
        exercise: "Biceps Curls",
        sets: 3,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
    ];
  
    const day2Exercises = [
      {
        category: "Deadlift",
        exercise: "Conventional Deadlift",
        sets: 2,
        reps: 4,
        targetRPE: topRPE,
      },
      {
        category: "Deadlift",
        exercise: "Deficit Deadlift",
        sets: 2,
        reps: 6,
        targetRPE: backoffRPE,
      },
      {
        category: "Bench",
        exercise: "Close Grip Bench",
        sets: 4,
        reps: 5,
        targetRPE: backoffRPE,
      },
      {
        category: "Back",
        exercise: "Dumbell Row",
        sets: 4,
        reps: 10,
        targetRPE: 8,
      },
      {
        category: "Shoulder",
        exercise: "Reverse Flys",
        sets: 4,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
      placeholderExercise,
      placeholderExercise,
    ];
  
    const day3Exercises = [
      {
        category: "Squat",
        exercise: "Lowbar-Squat",
        sets: 1,
        reps: 3,
        targetRPE: topRPE,
      },
      {
        category: "Squat",
        exercise: "Lowbar-Squat",
        sets: 2,
        reps: 5,
        targetRPE: backoffRPE,
      },
      {
        category: "Squat",
        exercise: "Pause Squat (Below Parallel)",
        sets: 2,
        reps: 5,
        targetRPE: backoffRPE,
      },
      {
        category: "Bench",
        exercise: "Comp. Bench",
        sets: 3,
        reps: 4,
        targetRPE: backoffRPE,
      },
      {
        category: "Overheadpress",
        exercise: "Shouldepress",
        sets: 2,
        reps: 8,
        targetRPE: 9,
      },
      {
        category: "Triceps",
        exercise: "Triceps-Extensions",
        sets: 4,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
      placeholderExercise,
      placeholderExercise
    ];
  
    const day4Exercises = [
      {
        category: "Deadlift",
        exercise: "Conventional",
        sets: 1,
        reps: 3,
        targetRPE: topRPE,
      },
      {
        category: "Deadlift",
        exercise: "Deficit Deadlift",
        sets: 2,
        reps: 5,
        targetRPE: 2,
      },
      {
        category: "Deadlift",
        exercise: "Paused Deadlift",
        sets: 2,
        reps: 5,
        targetRPE: 7,
      },
      {
        category: "Bench",
        exercise: "Spoto Benchpress",
        sets: 3,
        reps: 5,
        targetRPE: backoffRPE,
      },
      {
        category: "Bench",
        exercise: "Chestpress",
        sets: 2,
        reps: 10,
        targetRPE: 8.5,
      },
      {
        category: "Back",
        exercise: "Dumbell Row",
        sets: 4,
        reps: 10,
        targetRPE: 9,
      },
  
      {
        category: "Biceps",
        exercise: "Biceps Curls",
        sets: 3,
        reps: 12,
        targetRPE: 9,
      },
      {
        category: "Triceps",
        exercise: "Triceps Extensions",
        sets: 3,
        reps: 12,
        targetRPE: 9,
      },
      placeholderExercise,
    ];
  
      // define each day of the training Week
      for (let day = 0; day < daysPerWeek; day++) {
        // Rotate through exercise arrays based on index
  
        let exercises;
        switch (day) {
          case 0:
            exercises = day1Exercises;
            break;
          case 1:
            exercises = day2Exercises;
            break;
          case 2: 
            exercises = day3Exercises;
            break;
          case 3:
            exercises = day4Exercises;
            break;
          default:
              exercises = day1Exercises;
        }
  
        const trainingDay = {
          exercises: exercises,
          trainingDayNotes: "",
        }
        trainingDays.push(trainingDay);
      }
  
      const trainingWeek = {
        trainingDays: trainingDays
      }
  
      topRPE += 0.5;
      backoffRPE += 0.5;
  
      trainingWeeks.push(trainingWeek);
    }
  
    return trainingWeeks;
  }

  module.exports = {
    createTemplatePlanA,
    createTemplatePlanB,
  };