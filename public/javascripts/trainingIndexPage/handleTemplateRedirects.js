document.addEventListener("DOMContentLoaded", () => {
    const templateTrainingPlanLinks = document.querySelectorAll("section:nth-of-type(3) .training-plan-container .custom-training-container");
      const startTemplateTrainingPlanBTN = document.getElementById("start-template-training-button");
      const resetTemplateTrainingForm = document.getElementsByClassName("reset-template-training-form");
      const templateNextTrainingWeeks = document.getElementsByClassName("templateNextTrainingWeek");
      const editTemplateTrainingBTN = document.getElementById("edit-template-training-button");
      const templateTrainingPlanContainer = document.querySelectorAll(".training-plan-container")[2];
      const moreTrainingOptionsTemplateTraining = document.getElementsByClassName("more-training-options")[1];
      const statsButton = document.querySelectorAll(".stats-page-button")[2];
    
      let lastSelectedTemplateIndex = null;
      let lastSelectNextTrainingWeek = null;
    
      // Event-Handler für das Starten des Template-Trainings
      startTemplateTrainingPlanBTN.addEventListener("click", () => {
        if (lastSelectedTemplateIndex !== null && lastSelectNextTrainingWeek !== null) {
          const alphaValue = String.fromCharCode(65 + lastSelectedTemplateIndex);
          const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}`;
          window.location.href = customPlanPage;
        } else {
          pulseEffect(templateTrainingPlanContainer);
        }
      });
    
      moreTrainingOptionsTemplateTraining.addEventListener("click", e => {
        e.preventDefault();
        moreTrainingOptionsTemplateTraining.style.display = "none"; // hide itself
        editTemplateTrainingBTN.style.display = "block";
        resetTemplateTrainingForm[lastSelectedTemplateIndex].style.display = "block";
      })
    
      editTemplateTrainingBTN.addEventListener("click", () => {
        if (lastSelectedTemplateIndex !== null) {
          const alphaValue = String.fromCharCode(
            65 + lastSelectedTemplateIndex
          );
          const customPlanPage = `/training/template-${alphaValue}-edit`;
          window.location.href = customPlanPage;
        } else {
          pulseEffect(templateTrainingPlanContainer);
        }
      });
    
      // Event-Handler für die Auswahl von Template-Trainingslinks
      templateTrainingPlanLinks.forEach((link, index) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const linkIndex = parseInt(
            link.querySelector(".hidden-index").textContent
          );
    
          // Zurücksetzen der vorherigen Auswahl
          templateTrainingPlanLinks.forEach((otherLink, otherIndex) => {
            otherLink.classList.remove("selected");
            resetTemplateTrainingForm[otherIndex].style.display = "none";
          });
    
          // Aktualisieren der aktuellen Auswahl
          link.classList.add("selected");
          lastSelectedTemplateIndex = linkIndex;
          editTemplateTrainingBTN.style.display = "none";
          lastSelectNextTrainingWeek = templateNextTrainingWeeks[index].value;
          moreTrainingOptionsTemplateTraining.style.display = "block"; //blende die more options ein
        });
      });
    
        statsButton.addEventListener("click", e => {
          e.preventDefault();
          if (lastSelectedTemplateIndex !== null) {
            const alphaValue = String.fromCharCode(65 + lastSelectedTemplateIndex);
            const redirectPage = `training/template-${alphaValue}-stats`;
            window.location.href = redirectPage;
          }
         })

      function pulseEffect(element) {
        element.classList.add("pulsate-effect");
    
        setTimeout(() => {
          element.classList.remove("pulsate-effect");
        }, 2000);
      }
    
})