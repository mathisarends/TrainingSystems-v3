document.addEventListener("DOMContentLoaded", () => {

const targetRPEInputs = document.getElementsByClassName("targetRPE");
const rpeInputs = document.getElementsByClassName("actualRPE");

//so that the user can only enter RPEs that make sense
for (let i = 0; i < targetRPEInputs.length; i++) {
    targetRPEInputs[i].addEventListener("change", () => {
      const rpeInput = targetRPEInputs[i];
      const targetRPE = parseInt(rpeInput.value);
      if (targetRPE < 6) {
        rpeInput.value = 6;
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
      }
  
      rpe = rpe.replace(/,/g, ".");
      let numbers = rpe.split(";").map(Number);
  
      for (let k = 0; k < numbers.length; k++) {
        if (isNaN(numbers[k])) {
          rpeInputs[i].value = "";
          console.log("Nicht numerischer wert");
          return;
        }
      }
  
      const sum = numbers.reduce((acc, num) => acc + num + 0);
      const average = sum / numbers.length;
  
      const roundedAverage = Math.ceil(average / 0.5) * 0.5;

      if (roundedAverage < 5) {
        rpeInputs[i].value = 5;
      } else if (roundedAverage > 10) {
        rpeInputs[i].value = 10;
      } else {
        rpeInputs[i].value = roundedAverage;
      }
    })

   
  }
})



