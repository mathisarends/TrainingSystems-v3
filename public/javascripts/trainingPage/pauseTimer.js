document.addEventListener("DOMContentLoaded", () => {

  if ("serviceWorker" in navigator) {

    // prioritize service worker - ready api
    navigator.serviceWorker.ready.then(function (registration) {
      console.log("Service worker ist registriert", registration);

      initializeApp(registration);
    })
  }
});

function initializeApp(registration) {

  let currentTimerTime = 0; //for restarting the timer while keeping it alive

  // in order to detect which timer display or progress bar is addressed
  const navButtons = document.querySelectorAll(".dot-indicators button");
  const workoutTables = document.querySelectorAll(".workout-table"); 
  const progressBars = document.getElementsByClassName("rest-pause-progress-bar");
  const timerDisplays = document.getElementsByClassName("rest-pause-timer");

  let currentDayIndex = findCurrentlyDisplayedWorkoutTable();
  let currentWorkoutTable = workoutTables[currentDayIndex];
  let currentProgressBar = progressBars[currentDayIndex];
  let currentTimerDisplay = timerDisplays[currentDayIndex];
  let lastCategory = "";

  const pageHeadlines = document.querySelectorAll(".numbered-title");
  const restPauseContainers = document.querySelectorAll(".rest-pause-container");
  const maxScreenWidthToShowTimer = 1154; // in px

  // exercise pauseTimes by category from backend
  const categoryPauseTimes = document.getElementsByClassName(
    "category-pause-time-input"
  );

  let currentPauseTime = 0;

  // exercise categories from backend
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



  // show timer through clicking on headline, another clicks hides it and disables the timer

  pageHeadlines.forEach((pageHeadline, index) => {
    pageHeadline.addEventListener("click", e => {
      e.preventDefault();

      // mobile only feature
      if (window.innerWidth <= maxScreenWidthToShowTimer) {
        if (restPauseContainers[index].style.display === "block") { // if the display was previously displayed hide it and reset timer
          restPauseContainers[index].style.display = "none";
          stopTimer();
  
        } else if (restPauseContainers[index].style.display === "none") { // if the display was previously not display show it 
          restPauseContainers[index].style.display = "block";
        }
      } else {
        restPauseContainers[index].style.display = "none";
      }
    })
  })

  function stopTimer() {
    registration.active.postMessage({
      command: "stop"
    });

    currentProgressBar.value = 100;
    currentTimerDisplay.textContent = "00:00";
    currentTimerTime = 0
  }

  window.addEventListener("beforeunload", event => {
    stopTimer();
  })


  // variables in order to detec a double tap / click event
  let isTimerPaused = false;
  let clickCount = 0;
  let clickTimeout;

  function toggleTimerPause() {
    if (!isTimerPaused) {
      registration.active.postMessage({
        command: "pauseTimer",
      });
      isTimerPaused = true;
    } else {
      registration.active.postMessage({
        command: "continueTimer",
      });
    }
  }

  function addRestTimeAndNotes(index) {
    registration.active.postMessage({
      command: "addRestTime",
    });
    currentPauseTime = parseInt(currentPauseTime) + 30;
  }


  restPauseContainers.forEach((restPauseContainer, index) => {
    restPauseContainer.addEventListener("click", e => {
      e.preventDefault();
  
      clickCount++;
  
      if (clickCount === 1) {
        clickTimeout = setTimeout(() => { // first click wait for the possible following click
          if (clickCount === 1) {            // single click => pause or continue timer
            toggleTimerPause();
          }
          else if (clickCount === 2) { // add rest time 30 sekunds per double tap
            addRestTimeAndNotes();
          }
          clickCount = 0;
        }, 350); // time in which the second klick has to follow in order to detect the double klick event:
      }
    });
  })
 


  window.addEventListener("resize", () => {
    if (window.innerWidth > maxScreenWidthToShowTimer) { // the display is bigger than mobile screen size threshold dont show restPauseContainers
        restPauseContainers.forEach(container => {
            container.style.display = "none";
        });
    }
  });


  // send keepAlive signal every ten seconds if the timer is currently running
  setInterval(() => {
    if (currentTimerTime !== 0) {
      registration.active.postMessage({
        command: "keepAlive",
        duration: currentTimerTime,
       });
    }
  }, 10000);


  updateCurrentTable();

  navButtons.forEach((navButton, index) => {
    navButton.addEventListener("click", (e) => {
      currentDayIndex = index;
      updateCurrentTable(); // setup eventlisteners that trigger pause time for the newly displayed table
    });
  });

  const audioElement = document.getElementById("timerAudio");

  // TIMER DISPLAY LOGIC - receives a currentTime command every second from service worker => used to animate the progressbar and timer display
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data.command === "currentTime") {
      currentTimerTime = data.currentTime;

      const currentTime = data.currentTime / 1000;
      const formattedTime = data.formattedTime;

      currentTimerDisplay.textContent = formattedTime;

      const progress =
        (currentTime / currentPauseTime) * 100;

      //fehler konsolenausgabe verhinder wenn die seite neu geladen wird:
      if (!isNaN(progress) && isFinite(progress)) {
        currentProgressBar.value = progress;
      }

      if (currentTime <= 0) {
        audioElement.play();
        currentProgressBar.value = 100;
        currentTimerDisplay.textContent = "00:00";
        currentTimerTime = 0;
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

  // sets up the newly or initially display workout table for listening to change events to the weight input so that the pause timer is triggered
  function updateCurrentTable() {
    currentWorkoutTable = workoutTables[currentDayIndex];
    currentProgressBar = progressBars[currentDayIndex];
    currentTimerDisplay = timerDisplays[currentDayIndex];

    const form = document.querySelector("form");
    form.addEventListener("change", (e) => {
      const target = e.target;

      const weightInputs = currentWorkoutTable.querySelectorAll(".weight");
      const categorySelectors = currentWorkoutTable.querySelectorAll(
        ".exercise-category-selector"
      );
  
      if (target && target.classList.contains("weight")) {
        const index = Array.from(weightInputs).indexOf(target);
        const category = categorySelectors[index].value; // zugehörige Kategorie auswählen
        lastCategory = category;
  
        registration.active.postMessage({
          command: "start",
          duration: getPauseTimeByExerciseCategory(category) * 1000, // Timerdauer in Millisekunden
        });
  
        currentPauseTime = getPauseTimeByExerciseCategory(category);
      }
    });
  }
}