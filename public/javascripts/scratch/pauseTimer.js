document.addEventListener("DOMContentLoaded", () => {

    console.log("pauseTimer session eingebunden");
    
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            if (registration.active) {
              initializeSessionTimer(registration);
            }
        })
    }
})

function initializeSessionTimer(registration) {
      // Alle 10 Sekunden ein Signal an den Service Worker senden
  setInterval(() => {
    registration.active.postMessage({ command: 'keepAlive' });
  }, 10000); // 10 Sekunden Intervall (Passen Sie das Intervall nach Bedarf an)

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


  const weightInputs = document.getElementsByClassName("weight");
  console.log(weightInputs);
  const categorySelectors = document.querySelectorAll(
    ".exercise-category-selector"
  );

  const progressBars = document.querySelector(".rest-pause-progress-bar");
  const timerDisplay = document.querySelector(".rest-pause-timer");

  let lastCategory = "";

  const audioElement = document.getElementById("timerAudio");

  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data;
    if (data.command === "currentTime") {
      const currentTime = data.currentTime / 1000;
      const formattedTime = data.formattedTime;
  
      timerDisplay.textContent = formattedTime;
  
      const progress =
        (currentTime / getPauseTimeByExerciseCategory(lastCategory)) * 100;
        
        //fehler konsolenausgabe verhinder wenn die seite neu geladen wird:
        if (!isNaN(progress) && isFinite(progress)) {
            progressBars.value = progress;
        }
  
  
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

  for (let i = 0; i < weightInputs.length; i++) {
    weightInputs[i].addEventListener("change", () => {
      console.log("weight input changed");

      const category = categorySelectors[i].value;
      lastCategory = category;

      registration.active.postMessage({
        command: "start",
        duration: getPauseTimeByExerciseCategory(category) * 1000,
      })
    })
  }


}