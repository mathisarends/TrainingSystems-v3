document.addEventListener("DOMContentLoaded", () => {

    // if the placeholder category is selected: dont display it by setting the opacity to 0

    const exerciseCategorySelectors = document.querySelectorAll(".exercise-category-selector");

    // remove all placholder categorys initally 
    exerciseCategorySelectors.forEach((categorySelector) => {
        const category = categorySelector.value;
        if (category === "- Bitte Auswählen -") {
            categorySelector.style.opacity = "0";
        }
    })

    document.addEventListener("mousedown", e => {
        const target = e.target;

        if (target && target.classList.contains("exercise-category-selector")) {
            if (target.value === "- Bitte Auswählen -") {
                target.style.opacity = "0";
            }
        }
    })

    document.addEventListener("change", e => {
        const target = e.target;

        if (target && target.classList.contains("exercise-category-selector")) {
            if (target.value !== "- Bitte Auswählen -") {
                target.style.opacity = "1";
            } else {
                target.style.opacity = "0";
            }
        }
    })
})





