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

        const visibleSelectors = tableRow.querySelectorAll(
            '.exercise-name-selector:not([style*="display: none"])'
        );

        const visibleSelectorsNextRow = nextTableRow.querySelectorAll(
            '.exercise-name-selector:not([style*="display: none"])'
        );
        const category = exerciseCategorySelectors[i].value;

        if (visibleSelectors.length === 1 && (category === "Squat" || category === "Bench" || category === "Deadlift")) { //exercise selected input change from estMax through calc-max Script
            rpeInputs[i].addEventListener("change", () => {
                console.log("changed 1RM of main Exercise");

                 handleChangeEvent(i, visibleSelectors, visibleSelectorsNextRow);

            })
        }
    }

    function handleChangeEvent(index, visibleSelectors, visibleSelectorsNextRow) {
        const weight = parseFloat(weightInputs[index].value) || "undefined";
        const reps = parseInt(repInputs[index].value) || "undefined";
        const rpe = parseFloat(rpeInputs[index].value) || "undefined";

        if (weight === "undefined" || reps === "undefined" || rpe === "undefined") {
            return;
        } else {
            const actualReps = reps + (10 - rpe);
            const unroundedValue = weight * (1 + 0.0333 * actualReps);
            const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;
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
})