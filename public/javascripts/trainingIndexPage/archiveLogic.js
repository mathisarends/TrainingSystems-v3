document.addEventListener("DOMContentLoaded", () => {

    // context: custom plans for retrieving title
    const customTrainingContainers = document.querySelectorAll(
        "section:nth-of-type(1) .custom-training-container"
      );

      const templateTrainingContainers = document.querySelectorAll( //for retrieving title
        "section:nth-of-type(3) .custom-training-container"
      );

    const archiveCustomForms = document.querySelectorAll(".archive-custom-form");
    const archiveCustomButtons = document.querySelectorAll(".archive-training-plan-button");

    const archiveTemplateForms = document.querySelectorAll(".archive-template-form");
    const archiveTemplateButtons = document.querySelectorAll(".archive-template-training-plan-button");

    archiveTemplateButtons.forEach((archiveTemplateButton, index) => {
      archiveTemplateButton.addEventListener("click", e => {
        e.preventDefault();
        setUpConfirmationModalForArchive(index, false); //2nd paramter isCustomPlan
      })
    })


    const allArchiveForms = [...archiveCustomForms, ...archiveTemplateForms];

    archiveCustomButtons.forEach((button, index) =>  {
        button.addEventListener("click", e => {
          e.preventDefault();
          setUpConfirmationModalForArchive(index, true); //2nd paramter isCustomPlan
        })
      })

      allArchiveForms.forEach((archiveForm) => {
        archiveForm.addEventListener("submit", async (event) => {
          event.preventDefault();
    
          const formData = new FormData(event.target);
          const formDataObject = {};
          formData.forEach((value, key) => {
            formDataObject[key] = value;
          });
    
          formDataObject.url = archiveForm.action;
          formData.userIdentification = userIdentification;
    
          console.log(archiveForm.action);
          try {
            await fetch(archiveForm.action, {
              method: "POST",
              body: JSON.stringify(formDataObject),
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.error(error);
            console.log(archiveForm.action);
          } finally {
            location.reload();
          }
    
        })
      })

      function setUpConfirmationModalForArchive(index, isCustomPlan) {
        const confirmationModal = document.getElementById("confirmationModal");
    
        let title;
        if (isCustomPlan) {
          title = customTrainingContainers[index].querySelector(".training-plan-title").textContent.trim();
        } else {
          title = templateTrainingContainers[index].querySelector(".training-plan-title").textContent.trim();
        }
    
        confirmationModal.querySelector("input").value = `"${title}" wirklich archivieren?`;
    
        const confirmBTN = document.getElementById("confirmResetButton");
        confirmBTN.textContent = "ARCHIVE";
        confirmBTN.addEventListener("click", e => {
          e.preventDefault();
          
          if (isCustomPlan) {
            archiveCustomForms[index].dispatchEvent(new Event("submit"));
          } else {
            archiveTemplateForms[index].dispatchEvent(new Event("submit"));
          }

          
        })
    
        const cancelResetButton = document.getElementById("cancelResetButton");
        cancelResetButton.addEventListener("click", e => {
          e.preventDefault();
          confirmationModal.style.display = "none";
        })
    
        confirmationModal.style.display = "block";
      }

})