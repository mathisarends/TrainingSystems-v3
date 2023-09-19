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

  
  for (let i = 0; i < rpeInputs.length; i++) {

    rpeInputs[i].addEventListener("change", () => {
      let rpe = rpeInputs[i].value;

      if (rpe === "") {
        rpeInputs[i].value = "";
        return;
      }
  
      rpe = rpe.replace(/,/g, ".");

      let numbers = rpe.split(";").map(Number);

      for (let k = 0; k < numbers.length; k++) {
        console.log(numbers[k])
      }

      if (numbers.length === 1 && !isNaN(rpe)) { //eine zahl direkt eingeben
        validateRPE(numbers[0], rpeInputs[i]);
        return;
      }
  
      //wenn ein wert keine zahl ist: 
      if (numbers.some(isNaN)) { 
        rpeInputs[i].value = "";
        return;
      }

      const sum = numbers.reduce((acc, num) => acc + num + 0);
      const average = sum / numbers.length;
  
      const roundedAverage = Math.ceil(average / 0.5) * 0.5;
      console.log(roundedAverage);

      validateRPE(roundedAverage, rpeInputs[i]);

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



