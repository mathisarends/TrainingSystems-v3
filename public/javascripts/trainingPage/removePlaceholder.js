document.addEventListener("DOMContentLoaded", () => {
    const exerciseCategorySelectors = document.getElementsByClassName("exercise-category-selector");

    for (let i = 0; i < exerciseCategorySelectors.length; i++) {
        let selectedCategory = exerciseCategorySelectors[i].value;
        if (selectedCategory === "- Bitte Auswählen -") {
            exerciseCategorySelectors[i].style.color = "#e6e7e88a";
            
        }
    
        exerciseCategorySelectors[i].addEventListener("mousedown", () => {
            if (exerciseCategorySelectors[i].value === "- Bitte Auswählen -") {
                exerciseCategorySelectors[i].style.color = "#333333";
            }
        });
    
        exerciseCategorySelectors[i].addEventListener("change", () => {
            if (exerciseCategorySelectors[i].value !== "- Bitte Auswählen -") {
                exerciseCategorySelectors[i].style.color = "#333333";
            } else {
                exerciseCategorySelectors[i].style.color = "#e6e7e88a";
            }
        });
    }
})





