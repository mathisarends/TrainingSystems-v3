document.addEventListener("DOMContentLoaded", () => {
  const scratchExerciseNames = document.getElementsByClassName("exercise-name");

  for (let i = 0; i < scratchExerciseNames.length - 1; i++) {
    const rpeInput = document.getElementsByClassName("actualRPE")[i];

    const weightInput = document.getElementsByClassName("weight")[i];
    const nextWeightInput = document.getElementsByClassName("weight")[i + 1];

    const estMaxInput = document.getElementsByClassName("estMax")[i];

    const exerciseName = scratchExerciseNames[i].value;
    const nextExerciseName = scratchExerciseNames[i + 1].value;
    

    rpeInput.addEventListener("change", () => {
      const estMax = calcEstimatedMax(estMaxInput, i);
      if (estMax && (exerciseName === nextExerciseName)) { //calc Backoff
        const backoffReps = parseInt(document.getElementsByClassName("reps")[i + 1].value);
        const backoffRPE = parseFloat(document.getElementsByClassName("actualRPE")[i + 1].value);

        const totalBackoffReps = parseInt(backoffReps) + parseFloat(10 - backoffRPE);

        const percentage =
                (0.484472 * totalBackoffReps * totalBackoffReps -
                    33.891 * totalBackoffReps +
                    1023.67) *
                0.001;
        let result = estMax * percentage;
        result = Math.ceil(result / 2.5) * 2.5;
        nextWeightInput.value = result;
      }
    })

    weightInput.addEventListener("change", () => {
      const estMax = calcEstimatedMax(estMaxInput, i);
      if (estMax && (exerciseName === nextExerciseName)) { //calc Backoff
        const backoffReps = parseInt(document.getElementsByClassName("reps")[i + 1].value);
        const backoffRPE = parseFloat(document.getElementsByClassName("actualRPE")[i + 1].value);

        const totalBackoffReps = parseInt(backoffReps) + parseFloat(10 - backoffRPE);

        const percentage =
                (0.484472 * totalBackoffReps * totalBackoffReps -
                    33.891 * totalBackoffReps +
                    1023.67) *
                0.001;
        let result = estMax * percentage;
        result = Math.ceil(result / 2.5) * 2.5;
        nextWeightInput.value = result;
      }
    })
  }

  // asugelagerte Funktion die aufgerufen wird falls sich ein gewicht/rpe input feld ändert
  function calcEstimatedMax(estMaxInput, index) {
    const weight =
        parseFloat(document.getElementsByClassName("weight")[index].value) ||
        "undefined";
      const reps =
        parseInt(document.getElementsByClassName("reps")[index].value) ||
        "undefined";
      const rpe =
        parseFloat(document.getElementsByClassName("actualRPE")[index].value) ||
        "undefined";

      if (
        weight === "undefined" ||
        reps === "undefined" ||
        rpe === "undefined"
      ) {
        return;
      } else {
        const actualReps = reps + (10 - rpe);
        const unroundedValue = weight * (1 + 0.0333 * actualReps);
        const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;
        console.log("1RM", roundedValue);
        estMaxInput.value = roundedValue;
        return roundedValue;
      }
  }

  function calcBackoff() {

  }

});
