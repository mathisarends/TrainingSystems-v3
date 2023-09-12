document.addEventListener("DOMContentLoaded", () => {


    /*Modal vor dem Löschen: ------------------------- */
    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");

    //gets called by all delete or reset buttons
    function setupConfirmationModal(button, form, titleSelector, defaultTitle) {
        button.addEventListener("click", e => {
            e.preventDefault();
    
            const modalContent = confirmationModal.querySelector('.modal-content input[type="text"]');
            const deleteTitle = form.querySelector(titleSelector)?.value || defaultTitle;
            console.log(deleteTitle);
            modalContent.value = `"${deleteTitle}" löschen?`;
            confirmResetButton.textContent = "BESTÄTIGEN";
            confirmationModal.style.display = "block";
    
            confirmResetButton.addEventListener("click", () => {
                form.submit();
                confirmationModal.style.display = "none";
            });
        });
    }

    function pulseEffect(element) {
        element.classList.add("pulsate-effect");

            setTimeout(() => {
                element.classList.remove("pulsate-effect");
            }, 2000);
    }


    /*COSTUM ------------------------------------------*/
    const customTrainingContainers = document.querySelectorAll("section:nth-of-type(1) .custom-training-container");
    const deleteCustomTrainingForms = document.getElementsByClassName("delete-custom-form");
    const deleteCustomTrainingButtons = document.querySelectorAll(".delete-custom-form button");
    const startCustomTrainingButton = document.getElementById("start-custom-training-button");
    const createCustomTrainingPlanBTN = document.getElementById("createCustomTrainingPlanBTN");
    const customNextTrainingWeeks = document.getElementsByClassName("customNextTrainingWeek");
    const editCustomTrainingBTN = document.getElementById("edit-custom-training-button");

    const customTrainingPlanContainer = document.querySelectorAll(".training-plan-container")[0];

    let customCurrentSelectedTrainingWeek;
    let lastSelectedLinkIndex = null;

    function selectCustomTraining(index) {
        for (let i = 0; i < customTrainingContainers.length; i++) {
            customTrainingContainers[i].classList.remove("selected");
            deleteCustomTrainingForms[i].style.display = "none";
        }
        deleteCustomTrainingForms[index].style.display = "block";
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
        } else {
            pulseEffect(customTrainingPlanContainer);
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
            const customPlanPage = `/training/custom-${alphaValue}-edit`;
            window.location.href = customPlanPage;
        } else {
            pulseEffect(customTrainingPlanContainer);
        }
    })

    //deletes CustomTrainings
    deleteCustomTrainingButtons.forEach((button, index) => {
        setupConfirmationModal(button, deleteCustomTrainingForms[index], ".deleteTitle", "");
    });
    
    /* TEMPLATE ------------------------------------------*/
    const templateTrainingPlanLinks = document.querySelectorAll("section:nth-of-type(3) .training-plan-container .custom-training-container");
    const startTemplateTrainingPlanBTN = document.getElementById("start-template-training-button");
    const resetTemplateTrainingForm = document.getElementsByClassName("reset-template-training-form");
    const templateNextTrainingWeeks = document.getElementsByClassName("templateNextTrainingWeek");
    const editTemplateTrainingBTN = document.getElementById("edit-template-training-button");

    const templateTrainingPlanContainer = document.querySelectorAll(".training-plan-container")[2];

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
        } else {
            pulseEffect(templateTrainingPlanContainer);
        }
    });

    editTemplateTrainingBTN.addEventListener("click", () => {

        if (lastSelectedLinkIndexTemplate !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexTemplate);
            const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}-edit`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
        } else {
            pulseEffect(templateTrainingPlanContainer);
        }

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
    const resetTemplateTrainingBTNs = document.querySelectorAll(".reset-template-training-form button");

    resetTemplateTrainingBTNs.forEach((resetButton, index) => {
        setupConfirmationModal(resetButton, resetTemplateTrainingForm[index], null, "Template Training");
    });    

    /*SCRATCH TRAINING ------------------------------------------*/
    const createTrainingButton = document.getElementById("create-training-btn");
    const scratchTrainingContainers = document.querySelectorAll("section:nth-of-type(2) .training-plan-container .custom-training-container");
    const deleteTrainingForms = document.getElementsByClassName("delete-form-training");
    const deleteTrainingButtons = document.querySelectorAll(".delete-form-training button");
    let lastSelectedTrainingIndex = null;

    const sessionTrainingPlanContainer = document.querySelectorAll(".training-plan-container")[1];

    function selectTraining(index) {
        if (lastSelectedTrainingIndex !== null) {
            scratchTrainingContainers[lastSelectedTrainingIndex].classList.remove("selected");
            deleteTrainingForms[lastSelectedTrainingIndex].style.display = "none";
        }
        
        scratchTrainingContainers[index].classList.add("selected");
        deleteTrainingForms[index].style.display = "block";
        lastSelectedTrainingIndex = index;
    }

    function navigateToTrainingPage(pageType) {
        if (lastSelectedTrainingIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
            const customPlanPage = `/training/${pageType}-${lastSelectedTrainingIndex + 1}`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
        } else {
            pulseEffect(sessionTrainingPlanContainer);
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
        navigateToTrainingPage("session-edit");
/*         if (lastSelectedTrainingIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
            const customPlanEditPage = `/training/$`
        } */
        /* window.location.href = "https://www.google.com/"; */
    });

    createTrainingButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/training/createTraining";
    });

    deleteTrainingButtons.forEach((button, index) => {
        setupConfirmationModal(button, deleteTrainingForms[index], ".deleteTitle", "Workout 1");
    });

})