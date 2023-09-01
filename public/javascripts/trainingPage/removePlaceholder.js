document.addEventListener("DOMContentLoaded", () => {
    const exerciseCategorySelectors = document.getElementsByClassName("exercise-category-selector");

    for (let i = 0; i < exerciseCategorySelectors.length; i++) {
        let selectedCategory = exerciseCategorySelectors[i].value;
        if (selectedCategory === "- Bitte Auswählen -") {
            console.log("jo ist");
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





