document.addEventListener("DOMContentLoaded", () => {

    //calculates the 1RM for a main-Exercise and if possible the backoff weight for the next one
    const tableRows = document.querySelectorAll(".table-row.mainExercise");

    const weightInputs = document.getElementsByClassName("weight");
    const repInputs = document.getElementsByClassName("reps");
    const rpeInputs = document.getElementsByClassName("actualRPE");
    const targetRPEInputs = document.getElementsByClassName("targetRPE");
    const estMaxInputs = document.getElementsByClassName("estMax");

    const exerciseCategorySelectors = document.getElementsByClassName("exercise-category-selector");

    for (let i = 0; i < tableRows.length - 1; i++) {
        const tableRow = tableRows[i];
        const nextTableRow = tableRows[i + 1];

        // because there are 12 exercise-name-selectors and 11 of these are not shown - select only the one displayed
        const visibleSelectors = tableRow.querySelectorAll(
            '.exercise-name-selector:not([style*="display: none"])'
        );

        const visibleSelectorsNextRow = nextTableRow.querySelectorAll(
            '.exercise-name-selector:not([style*="display: none"])'
        );
        const category = exerciseCategorySelectors[i].value;

        if (visibleSelectors.length === 1 && (category === "Squat" || category === "Bench" || category === "Deadlift")) { //exercise selected input change from estMax through calc-max Script
            rpeInputs[i].addEventListener("change", () => {
                 handleChangeEvent(i, visibleSelectors, visibleSelectorsNextRow , category);

            })

            weightInputs[i].addEventListener("change", () => {
                handleChangeEvent(i, visibleSelectors, visibleSelectorsNextRow , category);
            })
        }
    }

    const workoutNoteInputs = document.querySelectorAll(".workout-notes");
    
    const maxFactorsInput = document.getElementById('maxFactors');
    const maxFactors = JSON.parse(maxFactorsInput.value);

    function handleChangeEvent(index, visibleSelectors, visibleSelectorsNextRow, category) {
        const weight = parseFloat(weightInputs[index].value) || "undefined";
        const reps = parseInt(repInputs[index].value) || "undefined";
        const rpe = parseFloat(rpeInputs[index].value) || "undefined";

        if (weight === "undefined" || reps === "undefined" || rpe === "undefined") {
            return;
        } else {
            const actualReps = reps + (10 - rpe);
            const unroundedValue = weight * (1 + 0.0333 * actualReps);
            
            const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;
            const allTimeBestEstMax = getMaxByCategory(category);

            if (roundedValue - allTimeBestEstMax > 5) {
                if (!workoutNoteInputs[index].value.includes("uptrend")) {
                    workoutNoteInputs[index].value = "uptrend " + workoutNoteInputs[index].value;
                }
            }

            estMaxInputs[index].value = parseInt(roundedValue); //we have to change the 1RM here

            if (visibleSelectorsNextRow.length === 1 && visibleSelectors[0].value === visibleSelectorsNextRow[0].value) {
                const backoffReps = parseInt(repInputs[index + 1].value) || "undefined";
                const desiredRPE = parseFloat(targetRPEInputs[index + 1].value || "undefined");
                const totalBackoffReps =
                parseInt(backoffReps) + parseFloat(10 - desiredRPE);

                let percentage =
                (0.484472 * totalBackoffReps * totalBackoffReps -
                    33.891 * totalBackoffReps +
                    1023.67) *
                0.001;

                let result = roundedValue * percentage;
                result = Math.ceil(result / 2.5) * 2.5;

                weightInputs[index + 1].value = result;
            }
        }
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