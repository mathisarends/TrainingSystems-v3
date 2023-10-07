document.addEventListener("DOMContentLoaded", () => {
  console.log("display offline data");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
      if (registration.active) {
        const userIDInput = document.getElementById("userID");

        // then there is a userInput on the page request offline data for url and user
        if (userIDInput) {
          console.log("get offline data request is sent");
          const userID = userIDInput.value;
          registration.active.postMessage({
            command: "getOfflineData",
            url: `${window.location.href}`,
            user: userID,
          });
        }
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
                  let categoryIndex;

                  if (element.classList.contains("exercise-name-selector")) {
                    const exerciseNameSelectors = document.querySelectorAll(
                      `[name="${key}"]`
                    ); //alle selectors die dieses name attribut haben
                    // für jede kategorie einen

                    //aus dem name attribut ausglesen
                    const dayNumber = key[3];
                    const exerciseNumber = key[13];

                    const associatedCategory = document.querySelector(
                      `select[name="day${dayNumber}_exercise${exerciseNumber}_category"]`
                    ).value;
                    categoryIndex = getIndexByCategory(associatedCategory);

                    const actualExerciseSelector =
                      exerciseNameSelectors[categoryIndex];

                    const option = actualExerciseSelector.querySelector(
                      `[value="${offlineData[key]}"]`
                    );

                    if (option) {
                      option.selected = true;
                      actualExerciseSelector.dispatchEvent(new Event("change"));
                    }

                    continue;
                  }

                  // Wenn es sich um ein <select>-Element handelt, suchen Sie die entsprechende Option und setzen Sie sie auf "selected"
                  if (
                    !categoryIndex ||
                    categoryIndex === 0 ||
                    categoryIndex === -1
                  ) {
                    const option = element.querySelector(
                      `[value="${offlineData[key]}"]`
                    );
                    if (option) {
                      option.selected = true;
                      element.dispatchEvent(new Event("change"));
                    }
                  }
                } else {
                  // Wenn es sich nicht um ein <select>-Element handelt, setzen Sie den Wert wie gewohnt
                  element.value = offlineData[key];
                }
              }
            }
          }

          const workoutTables = document.querySelectorAll(".workout-table");

          // für jeden table row werden die categoryselectors betrachtet der erste bleibt immer als placeholder stehen!
          workoutTables.forEach((table) => {
            const exerciseCategorySelectorsOfTable = table.querySelectorAll(
              ".exercise-category-selector"
            );

            exerciseCategorySelectorsOfTable.forEach(
              (categorySelector, index) => {
                const category = categorySelector.value;

                if (category === "- Bitte Auswählen -" && index !== 0) {
                  const parentTableRow = categorySelector.closest("tr");

                  if (parentTableRow) {
                    parentTableRow.style.display = "none";
                  }
                }
              }
            );
          });
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
      return -1;
    }
  }
});
