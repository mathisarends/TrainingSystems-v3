document.addEventListener("DOMContentLoaded", () => {

    const navButtons = document.querySelectorAll(".dot-indicators button");
    const workoutTables = document.querySelectorAll(".workout-table"); //all workout tables

    // can change during runtime
    let currentDayIndex = findCurrentlyDisplayedWorkoutTable();
    let currentWorkoutTable = workoutTables[currentDayIndex];
    let currentTableRows = currentWorkoutTable.querySelectorAll(".table-row")
    let currentNoteInputs = currentWorkoutTable.querySelectorAll(".workout-notes");

    let indexOfFirstEmptyTableRow = undefined;

    // method is called initally and everytime the user changes the view: 
    function findCurrentlyDisplayedWorkoutTable() {
        for (let index = 0; index < navButtons.length; index++) {
            const button = navButtons[index];
            if (button.getAttribute("aria-selected") === "true") {
                return index;
            }
        }
        return -1;
    }

    const addNewExerciseButtons = document.querySelectorAll(".add-new-exercise-button");

    function handleNewPrompt(noteInput, eventTriggerIndex, dayIndex) {
        noteInput.value = "";

        const addNewExerciseButtons = document.querySelectorAll(".add-new-exercise-button");
        addNewExerciseButtons[dayIndex].click(); //triggers event listener and creates a new tr element that we can copy to

        currentTableRows = currentWorkoutTable.querySelectorAll(".table-row.mainExercise");
        const newTrLength = currentTableRows.length;

        currentNoteInputs = currentWorkoutTable.querySelectorAll(".workout-notes"); //update this field to
        console.log(currentNoteInputs);

        const parentTableRow = noteInput.closest("tr");
        const nextTableRow = parentTableRow.nextElementSibling;

        // if the note input previously was the last one and is now the second last one because new row was created
        if (eventTriggerIndex === newTrLength - 2) {
            const valuesOfCurrentRow = getAllPropertiesOfExerciseRow(parentTableRow);
            console.log(valuesOfCurrentRow);
            copyExerciseToAnotherTableRow(valuesOfCurrentRow, parentTableRow, nextTableRow);
            return;
        } else {
            const valuesOfAffectedRows = [];

            for (let k = eventTriggerIndex + 1; k < newTrLength - 1; k++) {
                valuesOfAffectedRows.push(getAllPropertiesOfExerciseRow(currentTableRows[k]));
            }

            let offset = 1;

            for (let k = newTrLength - 2; k > eventTriggerIndex; k--) {
                const exerciseData = valuesOfAffectedRows[valuesOfAffectedRows.length - offset];
                copyExerciseToAnotherTableRow(exerciseData, currentTableRows[k], currentTableRows[k + 1]);
                offset++;
            }
        }
    }

    // macht im offline modus noch probleme
    function handleDeletePropmpt(noteInput, eventTriggerIndex, dayIndex) {
        noteInput.value = "";

        const trLength = currentTableRows.length;

        //last exercise or the first one with no following exercises => simple delete:
        if (eventTriggerIndex === trLength - 1 || (eventTriggerIndex === 0 && 1 === trLength)) {
            clearAllDataFromTableRow(currentTableRows[eventTriggerIndex]);
        } else {
            //delete the exercise and the rest of the exercises simply move up one table row
            clearAllDataFromTableRow(currentTableRows[eventTriggerIndex]);

            for (let k = eventTriggerIndex + 1; k < trLength; k++) {
                const exerciseDataOfTableRow = getAllPropertiesOfExerciseRow(currentTableRows[k]);
                copyExerciseToAnotherTableRow(exerciseDataOfTableRow, currentTableRows[k], currentTableRows[k - 1]);
            }

            //hide last tr that is now empty
/*             const lastTr = currentWorkoutTable.querySelectorAll(".table-row.mainExercise")[trLength - 1];
            lastTr.style.display = "none"; */
        }
    }

    function updateCurrentTable() {
        currentWorkoutTable = workoutTables[currentDayIndex];
        currentNoteInputs = currentWorkoutTable.querySelectorAll(".workout-notes");

        //refactor
        currentWorkoutTable = workoutTables[currentDayIndex];
        currentNoteInputs = currentWorkoutTable.querySelectorAll(".workout-notes");
        currentTableRows = currentWorkoutTable.querySelectorAll(".table-row");

        currentWorkoutTable.addEventListener("change", e => {
            const target = e.target;

            if (target.classList.contains("workout-notes")) {
                const eventTriggerIndex = Array.from(currentNoteInputs).indexOf(target);

                const value = target.value.toLowerCase();
                if (value === "new") {
                    handleNewPrompt(target, eventTriggerIndex, currentDayIndex);
                } else if (value === "delete") {
                    handleDeletePropmpt(target, eventTriggerIndex, currentDayIndex);
                } else if (value.includes("clear")) {
                    target.value = "";
                }
            }
        })
    }

    function copyExerciseToAnotherTableRow(exerciseData, sourceRow, destRow) {

        const exerciseCategorySelector = destRow.querySelector(".exercise-category-selector");
        exerciseCategorySelector.value = exerciseData.category;
        exerciseCategorySelector.dispatchEvent(new Event("change")); // manuell change event so that the display is set acordingly
        
        const category = exerciseCategorySelector.value;
        const categoryIndex = findIndexOfCategory(category);


        const exerciseNameSelector = destRow.querySelectorAll(".exercise-name-selector")[categoryIndex];
        const placeholderSelect = destRow.querySelector(".exercise-name-selector");
        placeholderSelect.disabled = true;

        placeholderSelect.style.display = "none";

        if (exerciseNameSelector) {
            exerciseNameSelector.style.display = "block";
            exerciseNameSelector.value = exerciseData.name;
            exerciseNameSelector.style.opacity = "1";
            exerciseNameSelector.disabled = false;

            const options = exerciseNameSelector.querySelectorAll("option");
            const valueToSelect = exerciseData.name;

            for (let i = 0; i < options.length; i++) {
                if (options[i].value === valueToSelect) {
                    exerciseNameSelector.selectedIndex = i;
                    break;
                }
            }

        }

        // die neuen exerciseCategorys auch einblenden
        exerciseCategorySelector.style.opacity = "1";

        destRow.querySelector(".sets").value = exerciseData.sets;
        destRow.querySelector(".reps").value = exerciseData.reps;
        destRow.querySelector(".weight").value = exerciseData.weight;
        destRow.querySelector(".targetRPE").value = exerciseData.targetRPE;
        destRow.querySelector(".actualRPE").value = exerciseData.actualRPE;
        destRow.querySelector(".estMax").value = exerciseData.estMax;
        destRow.querySelector(".workout-notes").value = exerciseData.workoutNotes;


        clearAllDataFromTableRow(sourceRow); //clears all data from existing table:

    }

    function clearAllDataFromTableRow(row) {
        const exerciseCategorySelector = row.querySelector(".exercise-category-selector");

        //blende den exerciseCategorySelector aus
        exerciseCategorySelector.value = "- Bitte Auswählen -";
        exerciseCategorySelector.style.opacity = "0";

        const previousExerciseNameSelector = row.querySelector('.exercise-name-selector:not([style*="display: none"])');
        const placeholderExerciseSelector = row.querySelector(".exercise-name-selector");

        previousExerciseNameSelector.style.display = "none"; //blende den vorherigen select aus

        placeholderExerciseSelector.style.display = "block";
        placeholderExerciseSelector.style.opacity = "0";


        row.querySelector(".sets").value = "";
        row.querySelector(".reps").value = "";
        row.querySelector(".weight").value = "";
        row.querySelector(".weight").placeholder = "";
        row.querySelector(".targetRPE").value = "";
        row.querySelector(".actualRPE").value = "";
        row.querySelector(".estMax").value = "";
        row.querySelector(".workout-notes").value = "";
    }

    function getAllPropertiesOfExerciseRow(row) {

        // only one of the selectors is displayed
        const displayedNameSelector = row.querySelector('.exercise-name-selector:not([style*="display: none"])');

        const category = row.querySelector(".exercise-category-selector").value;
        const name = displayedNameSelector.value;
        const sets = row.querySelector(".sets").value;
        const reps = row.querySelector(".reps").value;
        const weight = row.querySelector(".weight").value;
        const targetRPE = row.querySelector(".targetRPE").value;
        const actualRPE = row.querySelector(".actualRPE").value;
        const estMax = row.querySelector(".estMax").value;
        const workoutNotes = row.querySelector(".workout-notes").value;

        const returnObject = {
            category,
            name,
            sets,
            reps,
            weight,
            targetRPE,
            actualRPE,
            estMax,
            workoutNotes,
        }

        return returnObject;
    }

    // the page is rendered with no gaps from the start:
    // that means if (there is not a category selected === "- Bitte Auswählen -") then that is the lastIndex



    updateCurrentTable(); // Event Listener für die erste Seite initial einrichten


    navButtons.forEach((navButton, index) => {
        navButton.addEventListener("click", (e) => {
            currentDayIndex = index;
            updateCurrentTable(); // Event Listener für den neuen Table einrichten
        });
    });

    function findIndexOfCategory(categoryToFind) {
        return exerciseCategorys.indexOf(categoryToFind);
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