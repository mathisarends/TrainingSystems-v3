document.addEventListener("DOMContentLoaded", () => {

  const MIN_RPE = 5;
  const MAX_RPE = 10;

  const targetRPEInputs = document.querySelectorAll(".targetRPE");
  const rpeInputs = document.querySelectorAll(".actualRPE");
  const setInputs = document.querySelectorAll(".sets");

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
targetRPEInputs.forEach((targetRPEInput) => {
  targetRPEInput.addEventListener("change", () => {
    const targetRPE = targetRPEInput.value;

    validateRPE(targetRPE, targetRPEInput);
  })
})
  

  const planedRPEs = document.querySelectorAll(".targetRPE");
  const workoutNotes = document.querySelectorAll(".workout-notes");

  //refactor this shit and make it bulletproof. e.g. check if something bad happens if there is no input to be read or some shit:

  rpeInputs.forEach((rpeInput, index) => {
    rpeInput.addEventListener("change", () => {
      let rpe = rpeInput.value;

      if (rpe === "") {
        rpeInput.value = "";
        return;
      }

      rpe = rpe.replace(/,/g, "."); //replace commas with dots
      let numbers = rpe.split(";").map(Number);

      if (numbers.length === 1 && !isNaN(rpe)) { //rpe is valid (number) and inputted without further values seperated by ;
        validateRPE(numbers[0], rpeInput);
        const rpeDiff = parseFloat(planedRPEs[index].value) - numbers[0];

        updateWorkoutNotes(workoutNotes[index], rpeDiff);
        return;
      }

      if (numbers.some(isNaN)) { // if the input is not valid (not a number)
        rpeInput.value = "";
        return;
      }

      if (numbers.length == setInputs[index].value) {
        const sum = numbers.reduce((acc, num) => acc + num + 0);
        const average = sum / numbers.length;
    
        const roundedAverage = Math.ceil(average / 0.5) * 0.5;
  
        const rpeDiff = parseFloat(planedRPEs[index].value) - roundedAverage;
        updateWorkoutNotes(workoutNotes[index], rpeDiff);
        validateRPE(roundedAverage, rpeInput);
      }

    })
  })

})




