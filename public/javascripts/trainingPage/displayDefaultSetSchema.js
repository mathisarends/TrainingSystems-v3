document.addEventListener("DOMContentLoaded", () => {

    const defaultSetsByCategory = document.getElementsByClassName("category-default-sets-input");
    const defaultRepsByCategory = document.getElementsByClassName("category-default-reps-input");
    const defaultRPEByCategory = document.getElementsByClassName("category-default-rpe-input");

    const exerciseCategorySelectors = document.getElementsByClassName("exercise-category-selector");
    

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

    console.log(getDefaultSetsByExerciseCategory("Bench"));
    console.log(getDefaultRepsByExerciseCategory("Deadlift"));

    const setsInputs = document.getElementsByClassName("sets");
    const repsInputs = document.getElementsByClassName("reps");
    const targetRPEInputs = document.getElementsByClassName("targetRPE");

    for (let i = 0; i < exerciseCategorySelectors.length; i++) {
        exerciseCategorySelectors[i].addEventListener("change", () => {

            const category = exerciseCategorySelectors[i].value;

            if (category !== "- Bitte Auswählen -") {
                setsInputs[i].value = getDefaultSetsByExerciseCategory(category);
                repsInputs[i].value = getDefaultRepsByExerciseCategory(category);
                targetRPEInputs[i].value = getDefaultRPEByExerciseCategory(category);
            } else {
                setsInputs[i].value = "";
                repsInputs[i].value = "";
                targetRPEInputs[i].value = "";

            }
        })
    }
})