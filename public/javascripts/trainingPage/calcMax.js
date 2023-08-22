/* document.addEventListener("DOMContentLoaded", () => {
  // then a relevant field changes the estimated max shall be calculated given the required information is there
  const exerciseCategorySelectors = document.getElementsByClassName(
    "exercise-category-selector"
  );
  const weightInputs = document.getElementsByClassName("weight");
  const repInputs = document.getElementsByClassName("reps");
  const rpeInputs = document.getElementsByClassName("actualRPE");
  const estMaxInputs = document.getElementsByClassName("estMax");

  for (let i = 0; i < weightInputs.length; i++) {
    const category = exerciseCategorySelectors[i].value;

    if (
      category === "Squat" ||
      category === "Bench" ||
      category === "Deadlift"
    ) {
      weightInputs[i].addEventListener("change", () => {
        const weight = parseFloat(weightInputs[i].value) || "undefined";
        const reps = parseInt(repInputs[i].value) || "undefined";
        const rpe = parseFloat(rpeInputs[i].value) || "undefined";
        const estMaxInput = estMaxInputs[i];

        handleFieldChange(weight, reps, rpe, estMaxInput);
      });
    }
  }

  for (let i = 0; i < repInputs.length; i++) {
    const category = exerciseCategorySelectors[i].value;

    if (
      category === "Squat" ||
      category === "Bench" ||
      category === "Deadlift"
    ) {
      repInputs[i].addEventListener("change", () => {
        const weight = parseFloat(weightInputs[i].value) || "undefined";
        const reps = parseInt(repInputs[i].value) || "undefined";
        const rpe = parseFloat(rpeInputs[i].value) || "undefined";
        const estMaxInput = estMaxInputs[i];

        handleFieldChange(weight, reps, rpe, estMaxInput);
      });
    }
  }

  for (let i = 0; i < rpeInputs.length; i++) {
    const category = exerciseCategorySelectors[i].value;

    if (
      category === "Squat" ||
      category === "Bench" ||
      category === "Deadlift"
    ) {
      rpeInputs[i].addEventListener("change", () => {
        const weight = parseFloat(weightInputs[i].value) || "undefined";
        const reps = parseInt(repInputs[i].value) || "undefined";
        const rpe = parseFloat(rpeInputs[i].value) || "undefined";
        const estMaxInput = estMaxInputs[i];

        handleFieldChange(weight, reps, rpe, estMaxInput);
      });
    }
  }

  function handleFieldChange(weight, reps, rpe, estMaxInput) {
    if (weight === "undefined" || reps === "undefined" || rpe === "undefined") {
      return;
    } else {
      const actualReps = reps + (10 - rpe);
      const unroundedValue = weight * (1 + 0.0333 * actualReps);
      const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;
      console.log("1RM", roundedValue);
      estMaxInput.value = parseInt(roundedValue);
    }
  }
});
 */