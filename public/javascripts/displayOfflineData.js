document.addEventListener("DOMContentLoaded", () => {
  console.log("display offline data");
  const url = window.location.href;

  const actionUrl = document.querySelector("form")?.action;

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
            url: `${actionUrl || window.location.href}`,
            user: userID,
          });
        }
      }
    });

    function setupNewTableRow(tableRow) {

      const previousExerciseNameSelector = tableRow.querySelector('.exercise-name-selector:not([style*="display: none"])');
      previousExerciseNameSelector.style.display = "none";

      const placeholderExerciseNameSelector = tableRow.querySelector(".exercise-name-selector");
      placeholderExerciseNameSelector.style.display = "block";

      const categorySelector = tableRow.querySelector(".exercise-category-selector");
      categorySelector.value = "- Bitte Auswählen -";

      categorySelector.style.opacity = "0";
      placeholderExerciseNameSelector.style.opacity = "0"


      tableRow.querySelector(".sets").value = "";
      tableRow.querySelector(".reps").value = "";
      tableRow.querySelector(".weight").value = "";
      tableRow.querySelector(".weight").placeholder = "";
      tableRow.querySelector(".targetRPE").value = "";
      tableRow.querySelector(".actualRPE").value = "";
      tableRow.querySelector(".estMax").value = "";
      tableRow.querySelector(".workout-notes").value = "";

      categorySelector.addEventListener("change", () => {

          const category = categorySelector.value;
          const allExerciseNameSelectors = tableRow.querySelectorAll(".exercise-name-selector");


          const categoryIndex = exerciseCategorys.indexOf(category);
          const exerciseNameSelector = allExerciseNameSelectors[categoryIndex];
      })

  }

    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.command === "offlineData") {
        const offlineData = message.data;

        console.log("Offline-Daten empfangen:", offlineData);

        if (offlineData) {
          for (const key in offlineData) {
            if (offlineData.hasOwnProperty(key)) {
              // Suchen Sie das Input- oder Select-Element anhand des "name"-Attributs
              let element = document.querySelector(`[name="${key}"]`);

              // wenn ein element bereits den richtigen wert hat können wir die restliche logik überspringen

              // wenn es ein solches element nicht gibt und wir auf der richtigen seite sind
              if (!element && (url.includes("/training/custom") || url.includes("/training/template"))) {
                //dieses element gibt es nicht und es muss neu auf der seite erstellt werden um angezeigt werden zu können

                //aus dem name den tag ableiten um zugriff auf den workouttable zu haben
                const dayNumber = key[3];
                const exerciseNumber = key[13];

                const addNewExerciseBTN = document.querySelectorAll(".add-new-exercise-button")[dayNumber - 1];
                addNewExerciseBTN.click();
                element = document.querySelector(`[name="${key}"]`);

              }

              if (element.value === offlineData[key]) {
                continue;
              }

              if (element) {
                if (element.tagName === "SELECT") {
                  let categoryIndex;

                  if (element.classList.contains("exercise-category-selector")) {
                    element.style.opacity = "1";
                  }

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

                    exerciseNameSelectors.forEach((nameSelector, index) => {
                      if (categoryIndex === index) {
                        nameSelector.style.display = "block";
                        nameSelector.style.opacity = "1";
                        nameSelector.disabled = false;
                        nameSelector.dispatchEvent(new Event("change"));
                      } else {
                        nameSelector.style.display = "none";
                        nameSelector.style.opacity = "0";
                        nameSelector.disabled = true;
                      }
                    })

                    const parentRow = element.closest("tr");
                    const actualExerciseSelector = parentRow.querySelector('.exercise-name-selector:not([style*="display: none"])');

                    const option = actualExerciseSelector.querySelector(
                      `[value="${offlineData[key]}"]`
                    );

                    console.log("wert aus offline data", offlineData[key], " für ", key);
                    console.log("option", option);
                    
                    actualExerciseSelector.value = offlineData[key];

                    if (option) {
                      option.selected = true;
                    }

                    /* actualExerciseSelector.dispatchEvent(new Event("change")); */
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
                const exerciseRowsLength = table.querySelectorAll(".table-row.mainExercise").length;

                if (category === "- Bitte Auswählen -" && index !== 0) {
                  const parentTableRow = categorySelector.closest("tr");

                  if (parentTableRow) {
                    parentTableRow.style.display = "none";
                  }
                } else if (category === "- Bitte Auswählen -" && exerciseRowsLength === 1) {
                  categorySelector.style.opacity = "0";

                  const parentRow = categorySelector.closest("tr");
                  hideTableRow(parentRow);

                }

                if (category === "Squat" || category === "Bench" || category === "Deadlift") {
                  categorySelector.dispatchEvent(new Event("change"));
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

  function hideTableRow(row) {
    row.querySelector(".exercise-name-selector").style.opacity = "0";
    row.querySelector(".sets").value = "";
    row.querySelector(".weight").value = "";
    row.querySelector(".weight").placeholder = "";
    row.querySelector(".targetRPE").value = "";
    row.querySelector(".actualRPE").value = "";
    row.querySelector(".estMax").value = "";
    row.querySelector(".workout-notes").placeholder = "";
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
