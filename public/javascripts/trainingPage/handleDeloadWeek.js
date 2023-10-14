document.addEventListener("DOMContentLoaded", async () => {

    const planDeloadButtons = document.querySelectorAll(".plan-deload-button");
    planDeloadButtons.forEach((button) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            const deloadModal = document.getElementById("deloadModal");

            const handleDeloadButton = document.getElementById("handle-deload-button");
            const hideModalButton = document.getElementById("hide-modal-button");

            handleDeloadButton.addEventListener("click", e => {
                e.preventDefault();

                handleDeloadWeekChanges();

                deloadModal.style.display = "none";
                window.scrollTo(0, 0);

            })

            hideModalButton.addEventListener("click", e => {
                e.preventDefault();
                deloadModal.style.display = "none";
            })

            deloadModal.style.display = "block";
        })
    })

  function handleDeloadWeekChanges() {
    const trainingTableRows = document.querySelectorAll(
      ".workout-table .table-row"
    );

    trainingTableRows.forEach(async (row, index) => {
      const exerciseCategory = row.querySelector(
        ".exercise-category-selector"
      ).value; //decide on rpe decrement
      const sets = row.querySelector(".sets");
      const planedRPE = row.querySelector(".targetRPE");

      if (exerciseCategory === "- Bitte Auswählen -") {
        return;
      } else if (
        exerciseCategory === "Squat" ||
        exerciseCategory === "Bench" ||
        exerciseCategory === "Deadlift"
      ) {
        planedRPE.value = 6;
        sets.value = Math.round(parseInt(sets.value) * 0.66);
      } else {
        planedRPE.value = 7.5;
        sets.value = Math.round(parseInt(sets.value) * 0.85);
      }
    });

    const trainingDayTables = document.querySelectorAll(".workout-table");

    trainingDayTables.forEach((table) => {
      const firstNoteInputOfDay = table.querySelector(".workout-notes");
      if (!firstNoteInputOfDay.value.includes("DELOAD")) {
        firstNoteInputOfDay.value = "DELOAD";
      }

    });

    sendDeloadChangesToServer();
  }

  function sendDeloadChangesToServer() {

    const lastWeekDeloadHandledInput = document.getElementById("lastWeekDeloadHandled");
    lastWeekDeloadHandledInput.disabled = false;

    const form = document.querySelector("form");

    form.dispatchEvent(new Event("submit"));
  }
});