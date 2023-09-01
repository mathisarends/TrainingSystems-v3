function initializeTimerWorker() {
  timerWorker = new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
    let remainingTime = 0;
    let timer;

    self.addEventListener('message', function (e) {
      const data = e.data;
      if (data.command === 'start') {
        remainingTime = data.duration;
        if (!timer) {
          startTimer();
        }


      }
    });

    function startTimer() {
      const interval = 1000; // 1 Sekunde
      timer = setInterval(function () {
        if (remainingTime <= 0) {
          clearInterval(timer);
          self.postMessage({ command: 'complete' });
        } else {
          remainingTime -= interval;
          self.postMessage({ command: 'currentTime', currentTime: remainingTime }); // Senden Sie die verbleibende Zeit in jeder Iteration
        }
      }, interval);
    }
    
    // Funktion zum Stoppen des Timers
/*     function stopTimer() {
      clearInterval(timer);
    }

    self.addEventListener('stop', function () {
      stopTimer();
    }); */
  `,
        ],
        { type: "application/javascript" }
      )
    )
  );

  return timerWorker;
}

document.addEventListener("DOMContentLoaded", () => {

  const timerWorker = initializeTimerWorker();

  const categoryPauseTimes = document.getElementsByClassName(
    "category-pause-time-input"
  );

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
    "Legs",
  ];

  function getPauseTimeByExerciseCategory(category) {
    for (let i = 0; i < exerciseCategorys.length; i++) {
      if (category === exerciseCategorys[i]) {
        return categoryPauseTimes[i].value;
      }
    }
  }

  const workoutTables = document.querySelectorAll(".workout-table");
  const restPauseTimers = document.getElementsByClassName("rest-pause-timer");
  const restPauseProgressBars = document.getElementsByClassName(
    "rest-pause-progress-bar"
  );

  workoutTables.forEach((workoutTable, index) => {
    const weightInputs = workoutTable.querySelectorAll(".weight");
    const exerciseCategorySelectors = workoutTable.querySelectorAll(".exercise-category-selector");

      weightInputs.forEach((weightInput, weightIndex) => {
        weightInput.addEventListener("change", () => {
          const category = exerciseCategorySelectors[weightIndex].value;

          timerWorker.postMessage({
            command: "start",
            duration: getPauseTimeByExerciseCategory(category) * 1000, // Timerdauer in Millisekunden
          });

          startTimer(restPauseTimers[index], restPauseProgressBars[index], category);

        })
      })
  })


  function startTimer(timerElement, progressBar, category) {

    const audioElement = document.getElementById("timerAudio");

    const updateTimer = () => {
      timerWorker.postMessage({ command: 'currentTime' }); // Anfrage an den Timer Worker, um die verbleibende Zeit abzurufen
    };
  
    updateTimer();     // init
  
    const updateInterval = setInterval(updateTimer, 1000); //every second 
  
    timerWorker.addEventListener("message", function (e) { //listens for remaining time from timer worker
      const data = e.data;
      if (data.command === "currentTime") {
        const currentTime = data.currentTime / 1000; // in secunds
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
  
        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        timerElement.textContent = formattedTime;
  
        const progress = (currentTime / getPauseTimeByExerciseCategory(category)) * 100; // progress in percent
        progressBar.value = progress;
  
        if (currentTime <= 0) {
          clearInterval(updateInterval); // if timeout then intervall reset
          audioElement.play();
          //audio - element abspielen:
        }
      }
    });
    }


});

