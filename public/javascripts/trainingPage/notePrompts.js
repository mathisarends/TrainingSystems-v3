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

    function updateCurrentTable() {
        currentWorkoutTable = workoutTables[currentDayIndex];

        currentNoteInputs = currentWorkoutTable.querySelectorAll(".workout-notes");
        currentTableRows = currentWorkoutTable.querySelectorAll(".table-row");

        indexOfFirstEmptyTableRow = findIndexOfFirstEmptyExerciseRow(currentTableRows);

        // jeder aktuell angezeigte input soll auf bestimmte eingaben höeren: delete or new
        for (let i = 0; i < currentNoteInputs.length; i++) {
            if (i < currentNoteInputs.length - 1) {
                currentNoteInputs[i].addEventListener("change", () => {
                    if (currentNoteInputs[i].value.toLowerCase() === "new" && i < currentNoteInputs.length - 2) {

                        currentNoteInputs[i].value = ""; //acts as a prompt so value is removed


                        //if it is the last value only move up one row
                        if (i === indexOfFirstEmptyTableRow - 1) {
                            const valuesOfCurrentTable = getAllPropertiesOfExerciseRow(currentTableRows[i]);
                            copyExerciseToAnotherTableRow(valuesOfCurrentTable, currentTableRows[i], currentTableRows[i + 1]);
                            return;
                        } else {

                            const valuesOfAffectedRows = [];

                            for (let k = i + 1; k < indexOfFirstEmptyTableRow; k++) {
                                valuesOfAffectedRows.push(getAllPropertiesOfExerciseRow(currentTableRows[k]));
                            }

                            let offset = 1;


                            for (let k = indexOfFirstEmptyTableRow - 1; k > i; k--) {
                                const exerciseData = valuesOfAffectedRows[valuesOfAffectedRows.length - offset];
                                copyExerciseToAnotherTableRow(exerciseData, currentTableRows[k], currentTableRows[k + 1]);
                                offset++;
                            }
                        }

                    } else if (currentNoteInputs[i].value.toLowerCase() === "delete") {

                        currentNoteInputs[i].value = ""; //acts as a prompt so value is removed

                        //last exercise or the first one with no following exercises => simple delete:
                        if (i === indexOfFirstEmptyTableRow - 1 || (i === 0 && 1 === indexOfFirstEmptyTableRow)) { 
                            console.log("case 1");
                            clearAllDataFromTableRow(currentTableRows[i]);
                        } else {
                            //delete exercise the rest move up
                            
                            clearAllDataFromTableRow(currentTableRows[i]);

                            // all table rows taht have content
                            for (let k = i + 1; k < indexOfFirstEmptyTableRow; k++) {
                                const exerciseDataOfTableRow = getAllPropertiesOfExerciseRow(currentTableRows[k]);
                                copyExerciseToAnotherTableRow(exerciseDataOfTableRow, currentTableRows[k], currentTableRows[k - 1]);
                            }

                        }

                    }
                })
            }
        }
    }

    function copyExerciseToAnotherTableRow(exerciseData, sourceRow, destRow) {

        const exerciseCategorySelector = destRow.querySelector(".exercise-category-selector");
        exerciseCategorySelector.value = exerciseData.category;
        exerciseCategorySelector.dispatchEvent(new Event("change")); // manuell change event so that the display is set acordingly

        const exerciseNameSelector = destRow.querySelector('.exercise-name-selector:not([style*="display: none"])'); //actually displayed selector

        exerciseNameSelector.value = exerciseData.name;


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

        exerciseCategorySelector.value = "- Bitte Auswählen -";
        exerciseCategorySelector.dispatchEvent(new Event("change")); //manuelles change event für visibility

        row.querySelector(".sets").value = "";
        row.querySelector(".reps").value = "";
        row.querySelector(".weight").value = "";
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
    function findIndexOfFirstEmptyExerciseRow(tableRows) {
        for (let index = 0; index < tableRows.length; index++) {
            const exerciseCategory = tableRows[index].querySelector(".exercise-category-selector").value;
            if (exerciseCategory === "- Bitte Auswählen -") {
                return index;
            }
        }
        return -1; // Tabelle ist vollständig.
    }


    updateCurrentTable(); // Event Listener für die erste Seite initial einrichten


    navButtons.forEach((navButton, index) => {
        navButton.addEventListener("click", (e) => {
            currentDayIndex = index;
            updateCurrentTable(); // Event Listener für den neuen Table einrichten
        });
    });
})