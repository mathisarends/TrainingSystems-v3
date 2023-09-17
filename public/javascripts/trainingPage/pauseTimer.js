document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/register-service-worker")
      .then((registration) => {
        console.log("Service worker ist registriert", registration);

        initializeApp(registration);
      })
      .catch((err) => {
        console.log("Fehler bei der Registrierung des Service Workers:", err);
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

  const displayTimerField = document.querySelectorAll(".numbered-title")[0];
  const restPauseContainer = document.querySelectorAll(
    ".rest-pause-container"
  )[0];

  const maxScreenWidthToShowTimer = 1154; // in px

  // show timer through clicking on headline, another clicks hides it and disables the timer
  displayTimerField.addEventListener("click", e => {
    e.preventDefault();
    if (window.innerWidth <= maxScreenWidthToShowTimer) {
      if (restPauseContainer.style.display === "block") {
        restPauseContainer.style.display = "none";
        //send message to sw to stop timer
        registration.active.postMessage( {
          command: "stop",
        })

        currentProgressBar.value = 100;
        currentTimerDisplay.textContent = "00:00";

      } else if (restPauseContainer.style.display === "none") {
        restPauseContainer.style.display = "block";
      }
    } else {
      // Bildschirm ist größer als die maximale Breite, den Pause-Timer ausblenden
      restPauseContainer.style.display = "none";
    }
  })

  let isTimerPaused = false;
  let clickCount = 0;
  let clickTimeout;

  restPauseContainer.addEventListener("click", e => {
    e.preventDefault();

    // Erhöhen Sie die Klickzählung und starten Sie ein Timeout, um auf einen zweiten Klick zu warten
    clickCount++;

    if (clickCount === 1) {
      // first click wait for the possible following click
      clickTimeout = setTimeout(() => {
        // single click
        if (clickCount === 1) { 
          if (!isTimerPaused) { //timer is currently running
            registration.active.postMessage( {
              command: "pauseTimer",
            })
            isTimerPaused = true;
          } else if (isTimerPaused) { //timer not running: 
            registration.active.postMessage({
              command: "continueTimer",
            })
          }
        }
        // double click
        else if (clickCount === 2) {
          registration.active.postMessage({
            command: "addRestTime",
          })
        }
        // Zurücksetzen der Klickzählung nach Verarbeitung
        clickCount = 0;
      }, 350); // tzime in which the second klick has to follow in order to detect the double klick event:
    }
  });


  window.addEventListener("resize", () => {
    if (window.innerWidth > maxScreenWidthToShowTimer) {
        // Bildschirm ist größer als die maximale Breite, alle Pause-Timer ausblenden
        restPauseContainer.forEach(container => {
            container.style.display = "none";
        });
    }
  });

  // Alle 10 Sekunden ein Signal an den Service Worker senden
  setInterval(() => {
    registration.active.postMessage({ command: "keepAlive" });
  }, 10000); // 10 Sekunden Intervall (Passen Sie das Intervall nach Bedarf an)


  updateCurrentTable();

  navButtons.forEach((navButton, index) => {
    navButton.addEventListener("click", (e) => {
      currentDayIndex = index;
      updateCurrentTable(); // Event Listener für den neuen Table einrichten
    });
  });

  const audioElement = document.getElementById("timerAudio");

  // TIMER DISPLAY LOGIC
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data.command === "currentTime") {
      const currentTime = data.currentTime / 1000;
      const formattedTime = data.formattedTime;

      currentTimerDisplay.textContent = formattedTime;

      const progress =
        (currentTime / getPauseTimeByExerciseCategory(lastCategory)) * 100;

      //fehler konsolenausgabe verhinder wenn die seite neu geladen wird:
      if (!isNaN(progress) && isFinite(progress)) {
        currentProgressBar.value = progress;
      }

      if (currentTime <= 0) {
        audioElement.play();
        currentProgressBar.value = 100; //progress bar wieder auf full setzen:
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
