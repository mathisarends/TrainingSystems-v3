document.addEventListener("DOMContentLoaded", () => {

    // if the placeholder category is selected: dont display it by setting the opacity to 0

    const exerciseCategorySelectors = document.getElementsByClassName("exercise-category-selector");

    for (let i = 0; i < exerciseCategorySelectors.length; i++) {
        let selectedCategory = exerciseCategorySelectors[i].value;
        if (selectedCategory === "- Bitte Auswählen -") {
            exerciseCategorySelectors[i].style.opacity = "0";
            
        }

        exerciseCategorySelectors[i].addEventListener("mousedown", () => {
            if (exerciseCategorySelectors[i].value === "- Bitte Auswählen -") {
                exerciseCategorySelectors[i].style.opacity = "0";
            }
        });

    
        exerciseCategorySelectors[i].addEventListener("change", () => {
            if (exerciseCategorySelectors[i].value !== "- Bitte Auswählen -") {
                exerciseCategorySelectors[i].style.opacity = "1";
            } else {
                exerciseCategorySelectors[i].style.opacity = "0";
            }
        });
    }
})





