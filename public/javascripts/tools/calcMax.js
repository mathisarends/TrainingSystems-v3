document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("button");

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const weight = document.getElementById("weight").value;
    const reps = document.getElementById("reps").value;
    const rpe = document.getElementById("rpe").value;
    const maxField = document.getElementById("max");

    maxField.value = calcMax(weight, reps, rpe);
  });

  function calcMax(weight, reps, rpe) {
    actualReps = parseInt(reps) + parseInt(10 - rpe);
    const unroundedValue = weight * (1 + 0.0333 * actualReps);
    const roundedValue = Math.ceil(unroundedValue / 2.5) * 2.5;

    return roundedValue;
  }
});
