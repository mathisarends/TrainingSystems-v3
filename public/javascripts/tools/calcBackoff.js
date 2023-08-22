document.addEventListener("DOMContentLoaded", () => {
  const calcBackoffBTN = document.querySelector("button");


  let workingSetRPE = document.getElementById("working-rpe");
  let desiredRPE = document.getElementById("desired-rpe");

  // WerteValidierung RPE Eingaben dürfen nur von 5 bis 10 getätigt werden.
  workingSetRPE.addEventListener("change", () => {
    let rpe = workingSetRPE.value;

    if (rpe < 5) {
      workingSetRPE.value = 5;
    } else if (rpe > 10) {
      workingSetRPE.value = 10;
    }
  });

  desiredRPE.addEventListener("change", () => {
    let rpe = desiredRPE.value;

    if (rpe < 5) {
      desiredRPE.value = 5;
    } else if (rpe > 10) {
      desiredRPE.value = 10;
    }
  });

  calcBackoffBTN.addEventListener("click", (e) => {
    e.preventDefault();
    const resultField = document.getElementById("weight-span"); //ErgebnisLeiste

    const weight = document.getElementById("working-weight").value;
    const reps = document.getElementById("working-reps").value;
    const rpe = document.getElementById("working-rpe").value;
    const estMax = calcMax(weight, reps, rpe);

    const backOffReps = document.getElementById("desired-reps").value;
    const desiredRPE = document.getElementById("desired-rpe").value;
    const totalBackoffReps = parseInt(backOffReps) + parseInt(10 - desiredRPE);

    let percentage =
      (0.484472 * totalBackoffReps * totalBackoffReps -
        33.891 * totalBackoffReps +
        1023.67) *
      0.001;

    let result = estMax * percentage;
    let roundedResult = Math.ceil(result / 2.5) * 2.5;

    if (isNaN(roundedResult)) {
      resultField.value = "";
      return;
    }

    let weightSpanLow = roundedResult - 2.5;
    let weightSpanHigh = roundedResult + 2.5;

    let resultString = weightSpanLow + " - " + weightSpanHigh;

    resultField.value = resultString;
  });

  function calcMax(weight, reps, rpe) {
    actualReps = parseInt(reps) + parseInt(10 - rpe);
    const unroundedValue = weight * (1 + 0.0333 * actualReps);
    const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;

    return roundedValue;
  }
});
