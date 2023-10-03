
document.addEventListener("DOMContentLoaded", () => {


    const isDeloadWeekValue = document.getElementById("isDeloadWeek").value;
    const isDeloadWeek = isDeloadWeekValue === "true"; //"parse" it to boolean value

    if (isDeloadWeek) {
        console.log("Hallo friends balsas");
        const trainingTableRows = document.querySelectorAll(".workout-table .table-row");

        trainingTableRows.forEach((row, index) => {
            const exerciseCategory = row.querySelector(".exercise-category-selector").value; //decide on rpe decrement
            const sets = row.querySelector(".sets");
            const planedRPE = row.querySelector(".targetRPE");

            if (exerciseCategory === "- Bitte Auswählen -") {
                return;
            } else if (exerciseCategory === "Squat" || exerciseCategory === "Bench" || exerciseCategory === "Deadlift") {
                planedRPE.value = 6;
                sets.value = Math.round(parseInt(sets.value) * 0.66);
            } else {
                planedRPE.value = 7.5;
                sets.value = Math.round(parseInt(sets.value) * 0.85);
            }

        })

        const trainingDayTables = document.querySelectorAll(".workout-table");

        trainingDayTables.forEach((table) => {
            const firstNoteInputOfDay = table.querySelector(".workout-notes");
    
            firstNoteInputOfDay.value = "DELOAD";
    
        })

    }


})