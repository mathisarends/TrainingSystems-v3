
//changes Exercise Selector in dependance of the exercise-category-selector
const displayedSelectors = document.querySelectorAll('.exercise-name-selector:not([style*="display: none"])');

document.addEventListener("DOMContentLoaded", () => {

  //remove placeholder values
    for (let i = 0; i < displayedSelectors.length; i++) {
        if (displayedSelectors[i].value === "Placeholder") {
            displayedSelectors[i].style.display = "none";
        }
    }

    document.addEventListener("change", (e) => {
      const target = e.target;
  
      // Überprüfe, ob das ausgelöste Event von einem exercise-category-selector stammt
      if (target && target.classList.contains("exercise-category-selector")) {
          const category = target.value;
  
          // Finde die übergeordnete Zeile (tr) des exercise-category-selectors
          const tableRow = target.closest(".table-row.mainExercise");
  
          if (tableRow) {
              // Suche alle exercise-name-selector in dieser Zeile
              const exerciseNameSelectors = tableRow.querySelectorAll(".exercise-name-selector");
  
              if (category === "- Bitte Auswählen -") {
                  exerciseNameSelectors.forEach((selector) => {
                      selector.style.display = "none";
                      selector.disabled = false; // Zurücksetzen der deaktivierten Attribute
                  });
              } else {
                  exerciseNameSelectors.forEach((selector, index) => {
                      selector.style.display = index === indexForCategory(category) ? "block" : "none";
                      selector.style.opacity = index === indexForCategory(category) ? "1" : "0";
                      selector.disabled = index !== indexForCategory(category);      

                  });
              }
          }
      }
  });
})


function indexForCategory(category) {
  // This function maps category names to their corresponding index in exerciseNameSelectors
  switch (category) {
    case "Squat":
      return 1;
    case "Bench":
      return 2;
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