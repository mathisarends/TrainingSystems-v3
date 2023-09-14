document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
      if (registration.active) {
        registration.active.postMessage({
          command: "getOfflineData",
          data: `${window.location.href}`,
        });
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.command === "offlineData") {
        const offlineData = message.data;

        console.log("Offline-Daten empfangen:", offlineData);

        if (offlineData) {
          for (const key in offlineData) {
            if (offlineData.hasOwnProperty(key)) {
              // Suchen Sie das Input- oder Select-Element anhand des "name"-Attributs
              const element = document.querySelector(`[name="${key}"]`);

              if (element.value === offlineData[key]) {
                continue;
              }
              
              if (element) {
                if (element.tagName === "SELECT") {

                  if (element.classList.contains("exercise-name-selector")) {

                    const exerciseNameSelectors = document.querySelectorAll(`[name="${key}"]`); //alle selectors die dieses name attribut haben
                    // für jede kategorie einen

                    const dayNumber = key[3];
                    const exerciseNumber = key[13];
                    
                    const associatedCategory = document.querySelector(`select[name="day${dayNumber}_exercise${exerciseNumber}_category"]`).value;
                    const categoryIndex = getIndexByCategory(associatedCategory);

                    const actualExerciseSelector = exerciseNameSelectors[categoryIndex];

                    const option = actualExerciseSelector.querySelector(`[value="${offlineData[key]}"]`);

                    option.selected = true;
                    actualExerciseSelector.dispatchEvent(new Event("change"));

                    continue;
                  }

                  // Wenn es sich um ein <select>-Element handelt, suchen Sie die entsprechende Option und setzen Sie sie auf "selected"
                  const option = element.querySelector(`[value="${offlineData[key]}"]`);
                  if (option) {
                    option.selected = true;
                    element.dispatchEvent(new Event("change"));
                  }
                } else {
                  // Wenn es sich nicht um ein <select>-Element handelt, setzen Sie den Wert wie gewohnt
                  element.value = offlineData[key];
                }
              }
            }
          }
        } else {
          console.log("Keine Offline-Daten verfügbar");
        }
      }
    });
  }

  function getIndexByCategory(category) {
    if (category === "- Bitte Auswählen -") {
      return 0;
    } else if (category === "Squat") {
      return 1;
    } else if (category === "Bench") {
      return 2;
    } else if (category === "Deadlift") {
      return 3;
    } else if (category === "Overheadpress") {
      return 4;
    } else if (category === "Chest") {
      return 5;
    } else if (category === "Back") {
      return 6;
    } else if (category === "Shoulder") {
      return 7;
    } else if (category === "Triceps") {
      return 8;
    } else if (category === "Biceps") {
      return 9;
    } else if (category === "Legs") {
      return 10;
    } else {
      return 0;
    }
  }
});
