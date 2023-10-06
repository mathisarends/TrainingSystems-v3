document.addEventListener("DOMContentLoaded", () => {

    //addNewExercise.js
    const addNewExerciseButtons = document.querySelectorAll(".add-new-exercise-button");
    const removeExerciseButtons = document.querySelectorAll(".remove-exercise-button");
    const exerciseTables = document.querySelectorAll(".workout-table");

    addNewExerciseButtons.forEach((addExerciseBTN, index) => {
        addExerciseBTN.addEventListener("click", e => {
            e.preventDefault();

            const tableBody = exerciseTables[index].querySelector("tbody");
            const tableRows = tableBody.querySelectorAll(".table-row.mainExercise");
            const lastTr = tableRows[tableRows.length - 1];

            if (tableRows.length >= 12) {
                showMaxExercisesReachedModal();
            } else {
                const lastTrInnerHTML = lastTr.innerHTML; //create a new table row for the given table based on the previous last one
                const newTableRowInnerHTML = lastTrInnerHTML.replace(/_exercise(\d+)_/g, (match, group) => `_exercise${parseInt(group) + 1}_`);

                const newRow = document.createElement("tr");
                newRow.classList.add("table-row", "mainExercise");
                newRow.innerHTML = newTableRowInnerHTML;
                tableBody.appendChild(newRow);

                setupNewTableRow(newRow);
            }
        })
    })

    function showMaxExercisesReachedModal() {
        const modal = document.getElementById("offlineModal");
        const infoText = modal.querySelector("input");
        infoText.value = "Maximale Übungsanzahl erreicht!";

        modal.style.display = "block"; //show modal

        ackBTN.addEventListener("click", function closeModal(e) {
            e.preventDefault();
            modal.style.display = "none";
            ackBTN.removeEventListener("click", closeModal); // Entferne das Event-Handling, um Mehrfachklicks zu verhindern
        });
    }

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





})