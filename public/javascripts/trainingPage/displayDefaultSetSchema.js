document.addEventListener("DOMContentLoaded", () => {

    const defaultSetsByCategory = document.getElementsByClassName("category-default-sets-input");
    const defaultRepsByCategory = document.getElementsByClassName("category-default-reps-input");
    const defaultRPEByCategory = document.getElementsByClassName("category-default-rpe-input");

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
        "Legs"
      ];

      function getDefaultSetsByExerciseCategory(category) {
        for (let i = 0; i < exerciseCategorys.length; i++) {
            if (category === exerciseCategorys[i]) {
                return defaultSetsByCategory[i].value;
            }
        }
      }

      function getDefaultRepsByExerciseCategory(category) {
        for (let i = 0; i < exerciseCategorys.length; i++) {
            if (category === exerciseCategorys[i]) {
                return defaultRepsByCategory[i].value;
            }
        }
      }

      function getDefaultRPEByExerciseCategory(category) {
        for (let i = 0; i < exerciseCategorys.length; i++) {
            if (category === exerciseCategorys[i]) {
                return defaultRPEByCategory[i].value;
            }
        }
      }


      document.addEventListener("change", (e) => {
        const target = e.target;

        // Überprüfe, ob das ausgelöste Event von einem .exercise-category-selector stammt
        if (target && target.classList.contains("exercise-category-selector")) {
            const category = target.value;

            // Finde das Elternelement (z.B. die Zeile), das die .exercise-category-selector enthält
            const parentRow = target.closest(".table-row.mainExercise");

            if (parentRow) {
                // Finde die entsprechenden Elemente in derselben Zeile und aktualisiere sie
                const setsInput = parentRow.querySelector(".sets");
                const repsInput = parentRow.querySelector(".reps");
                const targetRPEInput = parentRow.querySelector(".targetRPE");

                if (category !== "- Bitte Auswählen -") {
                    setsInput.value = getDefaultSetsByExerciseCategory(category);
                    repsInput.value = getDefaultRepsByExerciseCategory(category);
                    targetRPEInput.value = getDefaultRPEByExerciseCategory(category);
                } else {
                    setsInput.value = "";
                    repsInput.value = "";
                    targetRPEInput.value = "";
                }
            }
        }
    });
});