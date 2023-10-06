document.addEventListener("DOMContentLoaded", () => {

  const MIN_RPE = 5;
  const MAX_RPE = 10;

//so that the user can only enter RPEs that make sense
function validateRPE(rpe, rpeInput) {
  switch (true) {
    case rpe < MIN_RPE:
      rpeInput.value = MIN_RPE;
      break;
    case rpe > MAX_RPE:
      rpeInput.value = MAX_RPE;
      break;
    default:
      rpeInput.value = rpe;
  }
}

function updateWorkoutNotes(workoutNotes, rpeDiff) {
  if (rpeDiff < -1) {
    workoutNotes.value += " overshoot ";
  } else if (rpeDiff > 1) {
    workoutNotes.value += " undershoot ";
  }
}

// validate targetRPE inputs
document.addEventListener("change", e => {
  const targetRPEInput = e.target;

  if (targetRPEInput && targetRPEInput.classList.contains("targetRPE")) {
    const targetRPE = targetRPEInput.value;
    validateRPE(targetRPE, targetRPEInput);
  }
})

document.addEventListener("change", e => {
  const target = e.target;
  
  if (target && target.classList.contains("actualRPE")) {
    const rpeInput = target;
    let rpe = target.value;

    if (rpe === "") {
      rpeInput.value = "";
      return;
    }

    rpe = rpe.replace(/,/g, "."); //replace commas with dots
    let numbers = rpe.split(";").map(Number);

    if (numbers.length === 1 && !isNaN(rpe)) { //rpe is valid (number) and inputted without further values seperated by ;
      validateRPE(numbers[0], rpeInput);

      // finde das zugehörige planedRPE und workoutNotes element
      const parentRow = rpeInput.closest(".table-row");
      const planedRPE = parentRow.querySelector(".targetRPE");
      const workoutNotes = parentRow.querySelector(".workout-notes");

      const rpeDiff = parseFloat(planedRPE.value) - numbers[0];
      updateWorkoutNotes(workoutNotes, rpeDiff);
      return;
    }

    if (numbers.some(isNaN)) { //if one of the values is not a number
      rpeInput.value = "";
      return;
    }

    const parentRow = rpeInput.closest(".table-row");
    const setInputs = parentRow.querySelector(".sets");

    if (numbers.length == setInputs.value) {
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const average = sum / numbers.length;

      const roundedAverage = Math.ceil(average / 0.5) * 0.5;
      const planedRPE = parentRow.querySelector(".targetRPE");
      const workoutNotes = parentRow.querySelector(".workout-notes");

      const rpeDiff = parseFloat(planedRPE.value) - roundedAverage;
      updateWorkoutNotes(workoutNotes, rpeDiff);
      validateRPE(roundedAverage, rpeInput);

    }

  }
})

})




