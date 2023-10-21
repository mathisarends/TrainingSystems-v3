import NewTrainingPlan from "./trainingPlanSchema.js";
  
  function createTemplatePlanA(userID) {
  
    const curDate = new Date();
    const trainingWeeks = createExerciseWeeksAndDaysTemplateA();
  
    const templateTrainingPlan = new NewTrainingPlan({
      user: userID,
      title: "Template A",
      trainingFrequency: 4,
      trainingPhase: "hypertrophie",
      lastUpdated: curDate,
      lastWeekDeload: true,
      lastWeekDeloadHandled: false,
      trainingWeeks: trainingWeeks,
      weightPlaceholders: "basedOnMax",
  
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
      lastWeekDeload: true,
      lastWeekDeloadHandled: false,
      trainingWeeks: trainingWeeks,
      weightPlaceholders: "basedOnMax",
    })
    return templateTrainingPlan;
  }
  
  
  // helper function to create the weeks and the associated exercises:
  function createExerciseWeeksAndDaysTemplateA() {
    const trainingWeeks = [];
    const weeksCount = 5; // Number of weeks
    const daysPerWeek = 4; // Number of training days per week
  
    //rpe and backoff rpe are incremented each week
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
    ];

    const day1Exercises2 = day1Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day2Exercises2 = day2Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day3Exercises2 = day3Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day4Exercises2 = day4Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
  
      // define each day of the training Week
      for (let day = 0; day < daysPerWeek; day++) {
        // Rotate through exercise arrays based on index
  
        let exercises;
        if (week === 0) {
          if (day === 0) {
            exercises = day1Exercises;
          } else if (day === 1) {
            exercises = day2Exercises;
          } else if (day === 2) {
            exercises = day3Exercises;
          } else if (day === 3) {
            exercises = day4Exercises;
          } else {
            exercises = day1Exercises;
          }
        } else {
          if (day === 0) {
            exercises = day1Exercises2;
          } else if (day === 1) {
            exercises = day2Exercises2;
          } else if (day === 2) {
            exercises = day3Exercises2;
          } else if (day === 3) {
            exercises = day4Exercises2;
          } else {
            exercises = day1Exercises2;
          }
        }
  
        const trainingDay = {
          exercises: exercises,
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
    const weeksCount = 5; // Number of weeks
    const daysPerWeek = 4; // Number of training days per week
  
    //rpe and backoff rpe are incremented each week
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
    ];

    const day1Exercises2 = day1Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day2Exercises2 = day2Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day3Exercises2 = day3Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
    
    const day4Exercises2 = day4Exercises.map((exercise) => ({
      targetRPE: exercise.targetRPE,
    }));
  
      // define each day of the training Week
      for (let day = 0; day < daysPerWeek; day++) {
        // Rotate through exercise arrays based on index
  
        let exercises;
        if (week === 0) {
          if (day === 0) {
            exercises = day1Exercises;
          } else if (day === 1) {
            exercises = day2Exercises;
          } else if (day === 2) {
            exercises = day3Exercises;
          } else if (day === 3) {
            exercises = day4Exercises;
          } else {
            exercises = day1Exercises;
          }
        } else {
          if (day === 0) {
            exercises = day1Exercises2;
          } else if (day === 1) {
            exercises = day2Exercises2;
          } else if (day === 2) {
            exercises = day3Exercises2;
          } else if (day === 3) {
            exercises = day4Exercises2;
          } else {
            exercises = day1Exercises2;
          }
        }
  
        const trainingDay = {
          exercises: exercises,
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

  export default {
    createTemplatePlanA,
    createTemplatePlanB,
  }