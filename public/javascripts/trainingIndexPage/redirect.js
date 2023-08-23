document.addEventListener("DOMContentLoaded", () => {

    //CUSTOM
    const customTrainingPlanLinks = document.querySelectorAll(".custom-view-container .trainingPlan-container a"); //select trainingPlan
    const customTrainingPlanLinkButtons = document.getElementsByClassName("training-plan-button-grid"); //delete and edit buttons

    const customDeletePlaceholderButton = document.getElementById("custom-delete-placeholder-button");
    const customDeleteForms = document.getElementsByClassName("delete-form");

    const startCustomTrainingPlanBTN = document.getElementsByClassName("training-plan-button")[0];
    const editcustomTrainingPlanBTN = document.getElementsByClassName("edit-training-plan-button")[0];

    let lastSelectedLinkIndexCustom = null;

    const customNextTrainingWeeks = document.getElementsByClassName("customNextTrainingWeek");
    let customCurrentSelectedTrainingWeek;

    startCustomTrainingPlanBTN.addEventListener("click", e => {
        e.preventDefault();
        if (lastSelectedLinkIndexCustom !== null) { //prüfung absolet
                
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexCustom);
            const customPlanPage = `/training/custom-${alphaValue}${customCurrentSelectedTrainingWeek}`;
            window.location.href = customPlanPage;
        }
    })

    editcustomTrainingPlanBTN.addEventListener("click", e => {
        e.preventDefault();
        if (lastSelectedLinkIndexCustom !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexCustom);
            const customEditPage = `/training/custom-${alphaValue}${customCurrentSelectedTrainingWeek}-edit`;
            window.location.href = customEditPage; 
        }
    })

    for (let i = 0;  i < customTrainingPlanLinks.length; i++) { //actual navigation logic
        customTrainingPlanLinks[i].addEventListener("click", e => {
            e.preventDefault();

            const linkIndex = parseInt(customTrainingPlanLinks[i].querySelector(".hidden-index").textContent);


            customTrainingPlanLinks[i].classList.add("selected");
            customDeletePlaceholderButton.style.display = "none"; //den placeholder button ausblenden
            
            customDeleteForms[i].style.display = "block";



            for (let j = 0; j < customTrainingPlanLinks.length; j++) {
                if (j !== i) {
                    customTrainingPlanLinks[j].classList.remove("selected");
                    customDeleteForms[j].style.display = "none";
                }
            }
            lastSelectedLinkIndexCustom = linkIndex;
            customCurrentSelectedTrainingWeek = customNextTrainingWeeks[i].value;
        })
    }

    
    //TEMPLATE
    const templateTrainingPlanLinks = document.querySelectorAll(".template-view-container .trainingPlan-container a");
    const startTemplateTrainingPlanBTN = document.getElementById("start-template-training-button");

    const resetTemplateTrainingForm = document.getElementsByClassName("reset-template-training-form");

    let lastSelectedLinkIndexTemplate = null;

    const templateNextTrainingWeeks = document.getElementsByClassName("templateNextTrainingWeek");
    let lastSelectNextTrainingWeek;
    console.log("Test 1 " + templateNextTrainingWeeks.length);


    startTemplateTrainingPlanBTN.addEventListener("click", () => {
        if (lastSelectedLinkIndexTemplate !== null) {
            // Wenn ein benutzerdefinierter Link ausgewählt wurde, ermitteln wir den Buchstaben basierend auf dem Index
            const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndexTemplate);
            const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}`;
            console.log(alphaValue + " alphanumeric value");
            window.location.href = customPlanPage;
        }
    });

    for (let i = 0; i < templateTrainingPlanLinks.length; i++) {
        templateTrainingPlanLinks[i].addEventListener("click", e => {
            e.preventDefault();

            const linkIndex = parseInt(templateTrainingPlanLinks[i].querySelector(".hidden-index").textContent);

            templateTrainingPlanLinks[i].classList.add("selected");
            resetTemplateTrainingForm[i].style.display = "block";

            for (let j = 0; j < templateTrainingPlanLinks.length; j++) {
                if (j !== i) {
                    templateTrainingPlanLinks[j].classList.remove("selected");
                    resetTemplateTrainingForm[j].style.display = "none";
                }
            }
            lastSelectedLinkIndexTemplate = linkIndex;
            lastSelectNextTrainingWeek = templateNextTrainingWeeks[i].value;
        })
    }

    const confirmationModal = document.getElementById("confirmationModal");
    const confirmResetButton = document.getElementById("confirmResetButton");
    const cancelResetButton = document.getElementById("cancelResetButton");
 
    const templateTrainingResetIndex = document.getElementsByClassName("template-training-index");
    console.log(templateTrainingResetIndex + " new length");
    // reset templates to default values (or better: redirect to such route)

    const resetTemplateTrainingBTNs = document.getElementsByClassName("reset-template-training-button");
    for (let i = 0; i < resetTemplateTrainingBTNs.length; i++) {
        resetTemplateTrainingBTNs[i].addEventListener("click", e => {
            e.preventDefault();
            
            const modalContent = confirmationModal.querySelector(".modal-content p");
            modalContent.textContent = "Bist du sicher, dass du das Template Training zurücksetzen möchtest?";
            
            confirmResetButton.textContent = "RESET";

            confirmationModal.style.display = "block";

            confirmResetButton.addEventListener("click", () => {
                const resetTemplateTrainingForm = document.getElementsByClassName("reset-template-training-form");
      
                resetTemplateTrainingForm[i].submit();
                confirmationModal.style.display = "block";
            })
        })
    }

    cancelResetButton.addEventListener("click", () => {
        confirmationModal.style.display = "block";
    })

    

    //TRAINING
    const startNewTrainingBTN = document.getElementById("start-scratch-training-btn");
    const editTrainingButtons = document.getElementsByClassName("edit-training-button");
    
    const scratchTrainingLink = document.querySelectorAll(".scratch-view-container .trainingPlan-container a");
    const scratchTrainingLinkButtons = document.getElementsByClassName("training-button-inner-container");
    const trainingButtonPlaceholderContainer = document.getElementById("training-button-placeholder-container");
    const deleteFormsTraining = document.getElementsByClassName("delete-form-training");

    for (let i = 0; i < scratchTrainingLink.length; i++) {
        const scratchLink = scratchTrainingLink[i];
        scratchLink.addEventListener("click", e => {
            e.preventDefault();
    
            const linkIndex = parseInt(scratchLink.querySelector(".hidden-index").textContent);
            trainingButtonPlaceholderContainer.style.display = "none";

            // Alle Elemente ausblenden und "selected" Klasse entfernen
            for (let k = 0; k < scratchTrainingLinkButtons.length; k++) {
                scratchTrainingLinkButtons[k].style.display = "none";
                scratchTrainingLink[k].classList.remove("selected");
                deleteFormsTraining[k].style.display = "none";
            }   
    
            // Das ausgewählte Element anzeigen und "selected" Klasse hinzufügen
            scratchTrainingLinkButtons[linkIndex].style.display = "flex";
            deleteFormsTraining[linkIndex].style.display = "block";
            scratchLink.classList.add("selected");
        });
    }
    
    // scratch Training buttons per session
    const startScratchTrainingFromTemplateButtons = document.getElementsByClassName("start-training-button");
    
    for (let i = 0; i < startScratchTrainingFromTemplateButtons.length; i++) {
        startScratchTrainingFromTemplateButtons[i].addEventListener("click", e => {
            e.preventDefault();
            window.location.href = `/training/session-${i + 1}-train`;})
    }


    //redirect to the edit page
    for (let i = 0; i < editTrainingButtons.length; i++) {
        editTrainingButtons[i].addEventListener("click", e => {
            e.preventDefault();
            window.location.href = `/training/session-${i + 1}`;
        })
    }

    startNewTrainingBTN.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = `${BASE_URL}/training/createTraining`;
    })

})