document.addEventListener("DOMContentLoaded", () => {

const targetRPEInputs = document.getElementsByClassName("targetRPE");
const rpeInput = document.getElementsByClassName("actualRPE");

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
  
  for (let i = 0; i < rpeInput.length; i++) {
    rpeInput[i].addEventListener("change", () => {
      const rpeField = rpeInput[i];
      const rpe = parseInt(rpeField.value);
      if (rpe < 6) {
        rpeField.value = 6;
      } else if (rpe > 10) {
        rpeField.value = 10;
      }
    });
  }
})



