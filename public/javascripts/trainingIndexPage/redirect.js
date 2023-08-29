document.addEventListener("DOMContentLoaded", () => {

    /*COSTUM ------------------------------------------*/
    const customTrainingContainers = document.querySelectorAll("section:nth-of-type(1) .custom-training-container");
    const deleteForms = document.getElementsByClassName("delete-form");
    const startCustomTrainingButton = document.getElementById("start-custom-training-button");
    const createCustomTrainingPlanBTN = document.getElementById("createCustomTrainingPlanBTN");
    const customNextTrainingWeeks = document.getElementsByClassName("customNextTrainingWeek");
    const editCustomTrainingBTN = document.getElementById("edit-custom-training-button");

    let customCurrentSelectedTrainingWeek;
    let lastSelectedLinkIndex = null;

    function selectCustomTraining(index) {
        for (let i = 0; i < customTrainingContainers.length; i++) {
            customTrainingContainers[i].classList.remove("selected");
            deleteForms[i].style.display = "none";
        }
        deleteForms[index].style.display = "block";
        customTrainingContainers[index].classList.add("selected");
        lastSelectedLinkIndex = index;
        customCurrentSelectedTrainingWeek = customNextTrainingWeeks[index].value;
    }

    customTrainingContainers.forEach((container, index) => {
        container.addEventListener("click", (e) => {
            e.preventDefault();
            selectCustomTraining(index);
        });
    });

    startCustomTrainingButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (lastSelectedLinkIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndex);
            const customPlanPage = `/training/custom-${alphaValue}${customCurrentSelectedTrainingWeek}`;
            window.location.href = customPlanPage;
        }
    });
    
    createCustomTrainingPlanBTN.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `${window.location.origin}/training/create-training-plan`;
    });

    editCustomTrainingBTN.addEventListener("click", (e) => {
        e.preventDefault();
        if (lastSelectedLinkIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndex);
            const customPlanPage = `/training/custom-${alphaValue}${customCurrentSelectedTrainingWeek}-edit`;
            window.location.href = customPlanPage;
        }
    })
    
    //TEMPLATE
    // Selektoren für Template-Trainingselemente
    const templateTrainingPlanLinks = document.querySelectorAll("section:nth-of-type(3) .training-plan-container .custom-training-container");
    const startTemplateTrainingPlanBTN = document.getElementById("start-template-training-button");
    const resetTemplateTrainingForm = document.getElementsByClassName("reset-template-training-form");
    const templateNextTrainingWeeks = document.getElementsByClassName("templateNextTrainingWeek");
    const editTemplateTrainingBTN = document.getElementById("edit-template-training-button");

    // Variablen zur Verfolgung der Auswahl
    let lastSelectedLinkIndexTemplate = null;
    let lastSelectNextTrainingWeek = null;

    // Event-Handler für das Starten des Template-Trainings
    startTemplateTrainingPlanBTN.addEventListener("click", () => {
        if (lastSelectedLinkIndexTemplate !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexTemplate);
            const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
        }
    });

    editTemplateTrainingBTN.addEventListener("click", () => {
        const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexTemplate);
            const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}-edit`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
    })

    // Event-Handler für die Auswahl von Template-Trainingslinks
    templateTrainingPlanLinks.forEach((link, index) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const linkIndex = parseInt(link.querySelector(".hidden-index").textContent);

            // Zurücksetzen der vorherigen Auswahl
            templateTrainingPlanLinks.forEach((otherLink, otherIndex) => {
                otherLink.classList.remove("selected");
                resetTemplateTrainingForm[otherIndex].style.display = "none";
            });

            // Aktualisieren der aktuellen Auswahl
            link.classList.add("selected");
            resetTemplateTrainingForm[index].style.display = "block";
            lastSelectedLinkIndexTemplate = linkIndex;
            lastSelectNextTrainingWeek = templateNextTrainingWeeks[index].value;
        });
    });

    // Event-Handler für das Zurücksetzen des Template-Trainings
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelResetButton = document.getElementById("cancelResetButton");
    const resetTemplateTrainingBTNs = document.getElementsByClassName("reset-template-training-button");

    Array.from(resetTemplateTrainingBTNs).forEach((resetButton, index) => {
        resetButton.addEventListener("click", (e) => {
            e.preventDefault();
            
            const modalContent = confirmationModal.querySelector(".modal-content p");
            modalContent.textContent = "Bist du sicher, dass du das Template Training zurücksetzen möchtest?";
            confirmResetButton.textContent = "RESET";
            confirmationModal.style.display = "block";

            confirmResetButton.addEventListener("click", () => {
                resetTemplateTrainingForm[index].submit();
                confirmationModal.style.display = "none"; // Verbergen des Modal nach der Bestätigung
            });
        });
    });

    cancelResetButton.addEventListener("click", () => {
        confirmationModal.style.display = "none"; // Verbergen des Modal bei Abbrechen
    });

    

    //TRAINING
    const createTrainingButton = document.getElementById("create-training-btn");
    const scratchTrainingContainers = document.querySelectorAll("section:nth-of-type(2) .training-plan-container .custom-training-container");
    const deleteFormsTraining = document.getElementsByClassName("delete-form-training");
    let lastSelectedTrainingIndex = null;

    function selectTraining(index) {
        if (lastSelectedTrainingIndex !== null) {
            scratchTrainingContainers[lastSelectedTrainingIndex].classList.remove("selected");
            deleteFormsTraining[lastSelectedTrainingIndex].style.display = "none";
        }
        
        scratchTrainingContainers[index].classList.add("selected");
        deleteFormsTraining[index].style.display = "block";
        lastSelectedTrainingIndex = index;
    }

    function navigateToTrainingPage(pageType) {
        if (lastSelectedTrainingIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
            const customPlanPage = `/training/${pageType}-${lastSelectedTrainingIndex + 1}`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
        }
    }

    scratchTrainingContainers.forEach((container, index) => {
        container.addEventListener("click", (e) => {
            e.preventDefault();
            selectTraining(index);
        });
    });

    const startSessionButton = document.getElementById("start-session");
    const editSessionButton = document.getElementById("edit-session");

    startSessionButton.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToTrainingPage("session-train");
    });

    editSessionButton.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToTrainingPage("session");
    });

    createTrainingButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/training/createTraining";
    });

})