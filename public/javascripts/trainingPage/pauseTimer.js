document.addEventListener("DOMContentLoaded", () => {

  if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        console.log('Push-Benachrichtigungen sind erlaubt.');
      } else {
        console.warn('Push-Benachrichtigungen sind nicht erlaubt.');
      }
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/register-timer-service-worker", {
        scope: "/training/",
      })
      .then((registration) => {
        console.log("Service Worker registriert:", registration);

        initializeApp(registration);
      })
      .catch((error) => {
        console.log("Fehler bei der Registrierung des Service Workers:", error);
      });
  }
});

function initializeApp(registration) {
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
    "Legs",
  ];

  const navButtons = document.querySelectorAll(".dot-indicators button");
  const workoutTables = document.querySelectorAll(".workout-table"); //all workout tables
  const progressBars = document.getElementsByClassName(
    "rest-pause-progress-bar"
  );
  const timerDisplays = document.getElementsByClassName("rest-pause-timer");

  let currentDayIndex = findCurrentlyDisplayedWorkoutTable();
  let currentWorkoutTable = workoutTables[currentDayIndex];
  let currentProgressBar = progressBars[currentDayIndex];
  let currentTimerDisplay = timerDisplays[currentDayIndex];
  let lastCategory = "";

  updateCurrentTable();

  navButtons.forEach((navButton, index) => {
    navButton.addEventListener("click", (e) => {
      currentDayIndex = index;
      updateCurrentTable(); // Event Listener für den neuen Table einrichten
    });
  });

  const audioElement = document.getElementById("timerAudio");

  // jede sekunde kommt eine solche nachricht sofern der timer läuft
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data.command === "currentTime") {
      const currentTime = data.currentTime / 1000;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      currentTimerDisplay.textContent = formattedTime;

      const progress =
        (currentTime / getPauseTimeByExerciseCategory(lastCategory)) * 100;
      currentProgressBar.value = progress;

      if (currentTime <= 0) {
        audioElement.play();
      }
    }
  });

  function getPauseTimeByExerciseCategory(category) {
    for (let i = 0; i < exerciseCategorys.length; i++) {
      if (category === exerciseCategorys[i]) {
        return categoryPauseTimes[i].value;
      }
    }
  }
  function findCurrentlyDisplayedWorkoutTable() {
    for (let index = 0; index < navButtons.length; index++) {
      const button = navButtons[index];
      if (button.getAttribute("aria-selected") === "true") {
        return index;
      }
    }
    return -1;
  }

  function updateCurrentTable() {
    currentWorkoutTable = workoutTables[currentDayIndex];
    currentProgressBar = progressBars[currentDayIndex];
    currentTimerDisplay = timerDisplays[currentDayIndex];

    // weightInput for triggering timer and category selector in order to retrieve correct pauseTime;
    const weightInputs = currentWorkoutTable.querySelectorAll(".weight");
    const categorySelectors = currentWorkoutTable.querySelectorAll(
      ".exercise-category-selector"
    );

    weightInputs.forEach((weightInput, index) => {
      weightInput.addEventListener("change", () => {

        const category = categorySelectors[index].value; //zugehörig zum weight input die richtige category rausfidnen
        lastCategory = category;

        registration.active.postMessage({
          command: "start",
          duration: getPauseTimeByExerciseCategory(category) * 1000, // Timerdauer in Millisekunden
        });
      });
    });
  }
}
