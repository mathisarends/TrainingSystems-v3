document.addEventListener("DOMContentLoaded", () => {

    //refactor
    const form = document.querySelector("form");

    form.addEventListener("change", e => {
        const target = e.target;

        // if there was a change in weight, rpe or reps calc new max and try to 
        if (target && (target.classList.contains("weight") || target.classList.contains("actualRPE") || target.classList.contains("reps"))) {
            const parentRow = target.closest(".table-row");
            const category = parentRow.querySelector(".exercise-category-selector").value;

            // if it is a main category try to calc the estimated max
            if (category === "Squat" || category === "Bench" || category === "Deadlift") {


                const weight = parseFloat(parentRow.querySelector(".weight").value);
                const reps = parseInt(parentRow.querySelector(".reps").value);
                const rpe = parseFloat(parentRow.querySelector(".actualRPE").value);
                const workoutNotes = parentRow.querySelector(".workout-notes");

                //only calc max when all parameters are there
                if (weight && reps && rpe) {
                    const estMax = calcEstMax(weight, reps, rpe, workoutNotes, category);
                    const estMaxInput = parentRow.querySelector(".estMax");
                    estMaxInput.value = estMax;

                    const nextRow = parentRow.nextElementSibling;
                    const exercise = parentRow.querySelector('.exercise-name-selector:not([style*="display: none"])').value;
                    const nextExercise = nextRow.querySelector('.exercise-name-selector:not([style*="display: none"])').value;
                    const nextWeightInputValue = nextRow.querySelector(".weight").value;

                    // if the exercsies are the same and the estMax was calced sucessfull and there is no weight inputted in the next row -> try to calc backoff
                    if (nextRow && (exercise === nextExercise) && estMax && !nextWeightInputValue) {
                        console.log("wir calcen backoff!")
                        const nextRowReps = parseInt(nextRow.querySelector(".reps").value);
                        const nextRowRPE = parseFloat(nextRow.querySelector(".targetRPE").value);

                        if (nextRowReps && nextRowRPE) {
                            const backoffWeight = calcBackoff(nextRowReps, nextRowRPE, estMax);
                            console.log(backoffWeight);
                            const nextRowWeightInput = nextRow.querySelector(".weight");
                            nextRowWeightInput.placeholder = backoffWeight;
                        }
                    }
                }
            }
        }
    })

    function calcBackoff(planedReps, planedRPE, topSetMax) {
        const totalReps = planedReps + (10 - planedRPE);
        let percentage = 
        (0.484472 * totalReps * totalReps -
            33.891 * totalReps +
            1023.67) *
        0.001;

        let backoffWeight = topSetMax * percentage;
        backoffWeight = Math.ceil(backoffWeight / 2.5) * 2.5;

        const lowEndBackoffweight = backoffWeight - 2.5;
        const highEndBackoffweight = backoffWeight + 2.5;

        backoffWeight = lowEndBackoffweight + " - " + highEndBackoffweight;
        return backoffWeight;

    }

    function calcEstMax(weight, reps, rpe, workoutNotes, category) {

        const actualReps = reps + (10 - rpe);
        const unroundedValue = weight * (1 + 0.0333 * actualReps); //forumlar for estmax

        const roundedValue = parseFloat(Math.ceil(unroundedValue / 2.5) * 2.5);
        const allTimeBestEstMax = getMaxByCategory(category);

        // make a new note for user that performance was good
        if (roundedValue - allTimeBestEstMax > 5) {
            if (!workoutNotes.value.includes("uptrend")) {
                workoutNotes.value = "uptrend " + workoutNotes.value;
            }
        }
        return roundedValue;
    }

    function getMaxByCategory(category) {
        if (category === "Squat") {
          return document.getElementById("userMaxSquat").value;
        } else if (category === "Bench") {
          return document.getElementById("userMaxBench").value;
        } else if (category === "Deadlift") {
          return document.getElementById("userMaxDeadlift").value;
        }
      }
})