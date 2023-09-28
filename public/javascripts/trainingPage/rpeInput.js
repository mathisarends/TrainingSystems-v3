document.addEventListener("DOMContentLoaded", () => {

  // calculates the median if the user decides to input more values than one in the following format
  // 10;10;15;15

const targetRPEInputs = document.getElementsByClassName("targetRPE");
const rpeInputs = document.getElementsByClassName("actualRPE");
const setInputs = document.getElementsByClassName("sets");

//so that the user can only enter RPEs that make sense
for (let i = 0; i < targetRPEInputs.length; i++) {
    targetRPEInputs[i].addEventListener("change", () => {
      const rpeInput = targetRPEInputs[i];
      const targetRPE = parseInt(rpeInput.value);
      if (targetRPE < 5) {
        rpeInput.value = 5;
      } else if (targetRPE > 10) {
        rpeInput.value = 10;
      }
    });
  }
  

  const planedRPEs = document.querySelectorAll(".targetRPE");
  const workoutNotes = document.querySelectorAll(".workout-notes");

  //refactor this shit and make it bulletproof. e.g. check if something bad happens if there is no input to be read or some shit:

  for (let i = 0; i < rpeInputs.length; i++) {

    rpeInputs[i].addEventListener("change", () => {
      let rpe = rpeInputs[i].value;

      if (rpe === "") {
        rpeInputs[i].value = "";
        return;
      }
  
      rpe = rpe.replace(/,/g, ".");

      let numbers = rpe.split(";").map(Number);

      if (numbers.length === 1 && !isNaN(rpe)) { //eine zahl direkt eingeben
        validateRPE(numbers[0], rpeInputs[i]);
        const rpeDiff = parseFloat(planedRPEs[i].value) - numbers[0];
        console.log(rpeDiff);
        if (rpeDiff < -1) { 
          workoutNotes[i].value = `overshoot` + workoutNotes[i].value + " ";
        } else if (rpeDiff > 1) {
          workoutNotes[i].value = `undershoot` + workoutNotes[i].value + " ";
        } 
        return;
      }
  
      //wenn ein wert keine zahl ist: 
      if (numbers.some(isNaN)) { 
        rpeInputs[i].value = "";
        return;
      }

      if (numbers.length == setInputs[i].value) {
        const sum = numbers.reduce((acc, num) => acc + num + 0);
        const average = sum / numbers.length;
    
        const roundedAverage = Math.ceil(average / 0.5) * 0.5;
  
        const rpeDiff = parseFloat(planedRPEs[i].value) - roundedAverage;
        if (rpeDiff < -1) { 
          workoutNotes[i].value = `overshoot` + workoutNotes[i].value + " ";
        } else if (rpeDiff > 1) {
          workoutNotes[i].value = `undershoot` + workoutNotes[i].value+ " ";
        } 

        validateRPE(roundedAverage, rpeInputs[i]);
      } else {
        //do nothing:
      }



    })

   
  }
})

function validateRPE(rpe, rpeInput) {
  if (rpe < 5) {
    rpeInput.value = 5;
  } else if (rpe > 10) {
    rpeInput.value = 10;
  } else {
    rpeInput.value = rpe;
  }
}



