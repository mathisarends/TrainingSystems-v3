document.addEventListener("DOMContentLoaded", () => {
  // Auf jedes change event der weight-eingabe wird reagiert damit dass der entsprechende timer wieder von vorne läuft
  
  const exerciseCategoryLength = document.getElementById("exercise-category-length").value; //12

  const categoryPauseTimes = document.getElementsByClassName("category-pause-time-input"); //12

  const exerciseCategorys = [
    "- Bitte Auswählen -",
    "Squat",
    "Bench",
    "Deadlift",
    "Overheadpress",
    "Chest",
    "Back",
    "Shoulder",
    "Triceps",
    "Biceps",
    "Core",
    "Legs"
  ];

  console.log(getPauseTimeByExerciseCategory("Back"));

  function getPauseTimeByExerciseCategory(category) {
    for (let i = 0; i < exerciseCategorys.length; i++) {
      if (category === exerciseCategorys[i]) {
        return categoryPauseTimes[i].value;
      }
    }
  }
    
  const workoutTables = document.querySelectorAll(".workout-table");
  const moreInfoButtons = document.getElementsByClassName("more-info-button");
  const restPauseTimers = document.getElementsByClassName("rest-pause-timer");
  const timerIntervals = [];

  const restPauseContainers = document.getElementsByClassName("rest-pause-container");
  const restPauseProgressBars = document.getElementsByClassName("rest-pause-progress-bar");

  for (let i = 0; i < moreInfoButtons.length; i++) {
    moreInfoButtons[i].addEventListener("click", (e) => {
      e.preventDefault();
      if (restPauseContainers[i].style.display === "none") {
        restPauseContainers[i].style.display = "block";
      } else {
        restPauseContainers[i].style.display = "none";
        clearInterval(timerIntervals[i]); //reset timer if the button is clicked again
        //TODO: Hier progress bar auch zurücksetzen
        restPauseTimers[i].textContent = "00:00";
      }
    });
  }

  for (let i = 0; i < workoutTables.length; i++) {
    const table = workoutTables[i];
    const weightInputs = table.querySelectorAll(".weight"); //retrieve the weight input of the table
    const exerciseCategorySelectors = table.querySelectorAll(".exercise-category-selector"); // per table

    for (let k = 0; k < weightInputs.length; k++) {
      weightInputs[k].addEventListener("change", () => {
        const category = exerciseCategorySelectors[k].value;
        console.log(category);

        if (timerIntervals[i]) { //if there is a already a timer - clear
          clearInterval(timerIntervals[i]);
        }

        startTimer(restPauseTimers[i], restPauseProgressBars[i], i, category);
      });
    }
  }

  function startTimer(timerElement, progressBar, index, category) {

    const pauseTime = getPauseTimeByExerciseCategory(category);
  
    let remainingSeconds = pauseTime; 
  
    const updateTimer = () => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
  
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      timerElement.textContent = formattedTime;
  
      const progress = (remainingSeconds / pauseTime) * 100; //refresh progress bar
      progressBar.value = progress;
  
      if (remainingSeconds <= 0) { //stop
        clearInterval(timerIntervals[index]);
      } else {
        remainingSeconds--;
      }
    };

    updateTimer();
  
    timerIntervals[index] = setInterval(updateTimer, 1000); //call timer-method every second
  }
  
});


