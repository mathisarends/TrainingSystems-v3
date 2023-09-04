
//changes Exercise Selector in dependance of the exercise-category-selector
const displayedSelectors = document.querySelectorAll('.exercise-name-selector:not([style*="display: none"])');



document.addEventListener("DOMContentLoaded", () => {

  //remove placeholder values
    for (let i = 0; i < displayedSelectors.length; i++) {
        if (displayedSelectors[i].value === "Placeholder") {
            displayedSelectors[i].style.display = "none";
        }
    }

    const tableRows = document.querySelectorAll(".table-row.mainExercise");
    const exerciseCatgorySelectorsNew = document.getElementsByClassName("exercise-category-selector");

    for (let i = 0; i < tableRows.length; i++) {
      //retrieve all exerciseNameSelectors (10)
      const exerciseNameSelectors = tableRows[i].querySelectorAll(".exercise-name-selector");

      exerciseCatgorySelectorsNew[i].addEventListener("change", () => {
        let category = exerciseCatgorySelectorsNew[i].value;

        if (category === "- Bitte Auswählen -") {
            for (let i = 0; i < exerciseNameSelectors.length; i++) {
                exerciseNameSelectors[i].style.display = "none"; // display no select
            }
        } else {
          // Loop through all exerciseNameSelectors and apply styles and disabled attribute
          for (let j = 0; j < exerciseNameSelectors.length; j++) {
            exerciseNameSelectors[j].style.display = j === indexForCategory(category) ? "block" : "none";
            exerciseNameSelectors[j].disabled = j !== indexForCategory(category);
          }
        }
      });
}


})


// das hier muss dynamisch von der page gesendet werden ist mir momentan zu hardcoded



function indexForCategory(category) {
  // This function maps category names to their corresponding index in exerciseNameSelectors
  switch (category) {
    case "Squat":
      return 1;
    case "Bench":
      return 2;
    // Add more cases for other categories...
    case "Deadlift":
        return 3;
    case "Overheadpress":
        return 4;
    case "Chest": 
        return 5;
    case "Back":
        return 6;
    case "Shoulder":
        return 7;
    case "Triceps":
        return 8;
    case "Biceps":
        return 9;
    case "Legs":
        return 10;    
    default:
      return -1; // Return -1 for categories that don't match any index
  }
}