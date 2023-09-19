document.addEventListener("DOMContentLoaded", () => {
    
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            if (registration.active) {
              initializeSessionTimer(registration);
            }
        })
    }
})

function initializeSessionTimer(registration) {

  let remainingTime = 0; // used in order to send the timer service worker wake up signals

  const weightInputs = document.getElementsByClassName("weight"); //triggers timer
  const categorySelectors = document.querySelectorAll(".exercise-category-selector");

  const displayTimerField = document.getElementsByClassName("numbered-title")[0];
  const restPauseContainer = document.getElementsByClassName("rest-pause-container")[0];
  const progressBar = document.querySelector(".rest-pause-progress-bar");
  const timerDisplay = document.querySelector(".rest-pause-timer");

  let lastCategory = ""; //keep track of wich pauseTime is applied

  const audioElement = document.getElementById("timerAudio");

  let isTimerPaused = false;
  let clickCount = 0;
  let clickTimeout;
  
  setInterval(() => {
    if (remainingTime !== 0) {
      registration.active.postMessage({ 
        command: 'keepAlive',
        duration: remainingTime
       });
    }

  }, 10000); 

  const categoryPauseTimes = document.getElementsByClassName("category-pause-time-input");
  
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

  restPauseContainer.addEventListener("click", e => {
    e.preventDefault();
    clickCount++;

    if (clickCount === 1) {
      clickTimeout = setTimeout(() => {
        if (clickCount === 1) { // single click => pause timer
          if (!isTimerPaused) { 
            registration.active.postMessage( {
              command: "pauseTimer",
            })
            isTimerPaused = true;
          } else if (isTimerPaused) {
            registration.active.postMessage({
              command: "continueTimer",
            })
          }
        }
        else if (clickCount === 2) { // double click => add 30 seconds to timer
          registration.active.postMessage({
            command: "addRestTime",
          })
        }
        clickCount = 0;
      }, 350); // time in which the second klick has to follow in order to detect the double klick event:
    }
  })

  let isTimerDisplayed = false;
  displayTimerField.addEventListener("click", e => {
    e.preventDefault();
    if (isTimerDisplayed) {
      restPauseContainer.style.display = "none";
      isTimerDisplayed = false;

      registration.active.postMessage({ //send message to sw to stop timer
        command: "stop",
      })

      progressBar.value = 100;
      timerDisplay.textContent = "00:00";
      remainingTime = 0;

    } else {
      restPauseContainer.style.display = "block";
      isTimerDisplayed = true;
    }
  })

  window.addEventListener("resize", () => {
    if (window.innerWidth > maxScreenWidthToShowTimer) {
        // Bildschirm ist größer als die maximale Breite, alle Pause-Timer ausblenden
        restPauseContainer.forEach(container => {
            container.style.display = "none";
        });
    }
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data.command === "currentTime") {
      remainingTime = data.currentTime;
      const currentTime = data.currentTime / 1000;
      const formattedTime = data.formattedTime;
  
      timerDisplay.textContent = formattedTime;
  
      const progress =
        (currentTime / getPauseTimeByExerciseCategory(lastCategory)) * 100;
        
        //fehler konsolenausgabe verhinder wenn die seite neu geladen wird:
        if (!isNaN(progress) && isFinite(progress)) {
            progressBar.value = progress;
        }
  
  
      if (currentTime <= 0) {
        audioElement.play();
        progressBar.value = 100;
        remainingTime = 0;
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

  for (let i = 0; i < weightInputs.length; i++) {
    weightInputs[i].addEventListener("change", () => {

      const category = categorySelectors[i].value;
      lastCategory = category;

      registration.active.postMessage({
        command: "start",
        duration: getPauseTimeByExerciseCategory(category) * 1000,
      })
    })
  }


}