document.addEventListener("DOMContentLoaded", () => {
  const trainingDaySelector = document.getElementById("training-day-selector");
  const trainingDaysTables = document.getElementsByClassName("table-section");
  
  trainingDaySelector.addEventListener("change", () => {
    const trainingDays = parseInt(trainingDaySelector.value);
    showTrainingDaysTables(trainingDays);
  });
  
  const trainingDays = parseInt(trainingDaySelector.value);
  showTrainingDaysTables(trainingDays);

  
  function showTrainingDaysTables(numTrainingDays) {
    for (let i = 0; i < trainingDaysTables.length; i++) {
      trainingDaysTables[i].style.display = i < numTrainingDays ? "block" : "none";
    }
  }
})

