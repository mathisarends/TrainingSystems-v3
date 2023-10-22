document.addEventListener("DOMContentLoaded", () => {

    // context: custom plans
    const customTrainingContainers = document.querySelectorAll(
        "section:nth-of-type(1) .custom-training-container"
      );

    const archiveCustomForms = document.querySelectorAll(".archive-custom-form");
    const archiveCustomButtons = document.querySelectorAll(".archive-training-plan-button");

    archiveCustomButtons.forEach((button, index) =>  {
        button.addEventListener("click", e => {
          e.preventDefault();
          setUpConfirmationModalForArchive(index);
        })
      })

      archiveCustomForms.forEach((archiveForm, index) => {
        archiveForm.addEventListener("submit", async (event) => {
          event.preventDefault();
    
          const formData = new FormData(event.target);
          const formDataObject = {};
          formData.forEach((value, key) => {
            formDataObject[key] = value;
          });
    
          formDataObject.url = archiveForm.action;
          formData.userIdentification = userIdentification;
    
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
          } finally {
            location.reload();
          }
    
        })
      })

      function setUpConfirmationModalForArchive(index) {
        const confirmationModal = document.getElementById("confirmationModal");
    
        const title = customTrainingContainers[index].querySelector(".training-plan-title").textContent.trim();
    
        confirmationModal.querySelector("input").value = `"${title}" wirklich archivieren?`;
    
        const confirmBTN = document.getElementById("confirmResetButton");
        confirmBTN.textContent = "ARCHIVE";
        confirmBTN.addEventListener("click", e => {
          e.preventDefault();
          archiveCustomForms[index].dispatchEvent(new Event("submit"));
        })
    
        const cancelResetButton = document.getElementById("cancelResetButton");
        cancelResetButton.addEventListener("click", e => {
          e.preventDefault();
          confirmationModal.style.display = "none";
        })
    
        confirmationModal.style.display = "block";
      }

})