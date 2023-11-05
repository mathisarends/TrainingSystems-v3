document.addEventListener("DOMContentLoaded", () => {
    const archiveSection = document.querySelector("section:last-of-type");
    const archivedPlanFields = archiveSection.querySelectorAll(".custom-training-container");
    
    const moreOptionsPerFieldBTN = archiveSection.querySelector(".more-training-options");
    const restoreArchivedTrainingBTN = archiveSection.querySelector("#restore-archived-training");
    const deleteArchivedTrainingBTN = archiveSection.querySelector("#delete-archived-training");

    let lastSelectedArchiveIndex = null;

    const viewArchivedPlanButtons = document.querySelectorAll(".archive-plan-view-button");
    const viewArchivedPlanStatsButtons = document.querySelectorAll(".archive-plan-stats-button");

    // redirects to view and stats page
    viewArchivedPlanButtons.forEach((button, index) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            if (lastSelectedArchiveIndex != null) {
                const trainingPlanId = archivedPlanFields[lastSelectedArchiveIndex].querySelector(".archive-plan-id").value;
                const firstTrainingWeekId = archivedPlanFields[lastSelectedArchiveIndex].querySelector(".archive-plan-first-week-id").value;

                const redirectUrl = `/training/archive/plan/${trainingPlanId}/week/${firstTrainingWeekId}`;
                window.location.href = redirectUrl;
            }
        })
    })

    viewArchivedPlanStatsButtons.forEach((button, index) => {
        button.addEventListener("click", e => {
            e.preventDefault();
            if (lastSelectedArchiveIndex != null) {
                const trainingPlanId = archivedPlanFields[lastSelectedArchiveIndex].querySelector(".archive-plan-id").value;

                const redirectUrl = `/training/archive/stats/${trainingPlanId}`;
                window.location.href = redirectUrl;

            }
        })
    })


    archivedPlanFields.forEach((field, index) => {
        field.addEventListener("click", () => {
            selectArchivedField(index);
        })
    })

    function selectArchivedField(index) {
        archivedPlanFields.forEach((field, i) => {
            field.classList.remove("selected");
        })

        archivedPlanFields[index].classList.add("selected");
        restoreArchivedTrainingBTN.style.display = "none";
        deleteArchivedTrainingBTN.style.display = "none";
        lastSelectedArchiveIndex = index;
        moreOptionsPerFieldBTN.style.display = "block";
    }

    moreOptionsPerFieldBTN.addEventListener("click", () => {

        const currentArchiveField = archivedPlanFields[lastSelectedArchiveIndex];
        const typeOfPlan = currentArchiveField.querySelector(".trainingPlanType").textContent;

        moreOptionsPerFieldBTN.style.display = "none";
        deleteArchivedTrainingBTN.style.display = "block";
        restoreArchivedTrainingBTN.style.display = "block";

        if (typeOfPlan === "template") {
            restoreArchivedTrainingBTN.style.display = "none";
        }
    })

    deleteArchivedTrainingBTN.addEventListener("click", e =>{
        e.preventDefault();
        setupArchiveModal("delete");
    })

    restoreArchivedTrainingBTN.addEventListener("click", e => {
        e.preventDefault();
        setupArchiveModal("restore")
        
    })

    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelDeleteButton = document.getElementById("cancelResetButton");
    
    

    function setupArchiveModal(mode) {

        const trainingTitle = archivedPlanFields[lastSelectedArchiveIndex].querySelectorAll("div")[1].textContent.trim();

        if (mode === "delete") {
            confirmationModal.querySelector("input").value = `"${trainingTitle.toUpperCase()}" endgültig löschen?`;

            confirmationModal.style.display = "block";

            confirmResetButton.addEventListener("click", e => {
                e.preventDefault();
                handleDeleteProcessFromArchive();
            })

        } else if (mode === "restore") {
            confirmationModal.querySelector("input").value = `"${trainingTitle.toUpperCase()}" wiederherstellen?`;
            confirmResetButton.textContent = "BESTÄTIGEN";

            const restoreDataOptionsContainer = document.getElementById("more-restore-data-container");
            restoreDataOptionsContainer.style.display = "block";

            confirmationModal.style.display = "block";

            confirmResetButton.addEventListener("click", e => {
                e.preventDefault();
                handleRestoreProcess();
            })
        }

        // immer machen
        cancelDeleteButton.addEventListener("click", e => {
                e.preventDefault();
                confirmationModal.style.display = "none";
            })
    }

    function handleRestoreProcess() {
        const restoreIndex = lastSelectedArchiveIndex;
        const typeOfPlan = archivedPlanFields[lastSelectedArchiveIndex].querySelector(".trainingPlanType").textContent;

        
        const restoreDataOptionsContainer = document.getElementById("more-restore-data-container");
        const keepTrainingData = restoreDataOptionsContainer.querySelector("#keepTrainingData").value;
        const keepTrainingArchived = restoreDataOptionsContainer.querySelector("#keepTrainingArchived").value;

        const data = {
            restoreIndex,
            typeOfPlan,
            keepTrainingData,
            keepTrainingArchived
        }

        fetch('/training/restore-archived-training-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(async response => {
            if (response.status === 200) {
                confirmationModal.style.display = "none";
                location.reload();
            } else if (response.status === 403) {
                /// hier anzeigen dass die route für diese werte nicht erlaubt ist.
                const errorResponse = await response.json();
                handle403(errorResponse.error)
            }
        })
        .catch(error => {
            console.error("Fehler beim wiederherstellen:", error);
        })
    }

    function handle403(errorMessage) {

        // error Message anzeigen und den button ausblenden:
        confirmationModal.querySelector("input").value = errorMessage;

        //sobald man das modal ausblendet wird der erste button wieder angezeigt!
        confirmResetButton.addEventListener("click", e => {
            e.preventDefault();
            confirmationModal.querySelector("button").style.display = "block";
        })
    }

    function handleDeleteProcessFromArchive() {
        const deleteIndex = lastSelectedArchiveIndex;
        fetch('/training/delete-archived-training-plan', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deleteIndex })
        })
        .then(response => {
            if (response.status === 200) {
                confirmationModal.style.display = "none";
            } else if (response.status === 400) {
                
            } else {

            }
        })
        .catch(error => {
            console.error("Fehler beim löschen:", error);
        })
        .finally(() => {
            location.reload();
        })
    }

})