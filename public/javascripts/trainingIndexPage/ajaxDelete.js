document.addEventListener("DOMContentLoaded", () => {
  const deleteCustomPlansPart = document.querySelectorAll(
    ".delete-custom-form"
  );
  const deleteSessionPart = document.querySelectorAll(".delete-form-training");
  const deleteTemplatePart = document.querySelectorAll(
    ".reset-template-training-form"
  );

  //in order to decide which endpoint is used:
  const upperLimitForCustomTrainingPlans = deleteCustomPlansPart.length;
  const upperLimitForSession =
    parseInt(upperLimitForCustomTrainingPlans) + deleteSessionPart.length;

  //combine all delete forms to one array
  const allDeleteForms = [
    ...deleteCustomPlansPart,
    ...deleteSessionPart,
    ...deleteTemplatePart,
  ];

  const deleleEndPoints = {
    custom: "/training/delete-training-plan",
    session: "/training/delete-training",
    template: "/training/reset-template-training",
  };

  const userIdentification =
    document.getElementById("userIdentification").value;

  allDeleteForms.forEach((form, index) => {
    let fetchUrl;
    if (index < upperLimitForCustomTrainingPlans) {
      fetchUrl = deleleEndPoints.custom;
    } else if (index < upperLimitForSession) {
      fetchUrl = deleleEndPoints.session;
    } else {
      fetchUrl = deleleEndPoints.template;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); //prevent auto-submit

      const formData = new FormData(event.target);
      const formDataObject = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });

      formDataObject.url = fetchUrl;
      formData.userIdentification = userIdentification;

      try {
        await fetch(fetchUrl, {
          method: "DELETE",
          body: JSON.stringify(formDataObject),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        location.reload(); // either way the page has to reload in order to have congruent behaviour with the upperlimites etc
      }
    })
  });

  //show confirmation modal before delete
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmResetButton = document.getElementById("confirmResetButton");
  const cancelDeleteButton = document.getElementById("cancelResetButton");

  function setupConfirmationModal(button, form, titleSelector, defaultTitle) {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      const modalContent = confirmationModal.querySelector(
        '.modal-content input[type="text"]'
      );
      const deleteTitle =
        form.querySelector(titleSelector)?.value || defaultTitle;
      modalContent.value = `"${deleteTitle}" löschen?`;
      confirmResetButton.textContent = "BESTÄTIGEN";
      confirmationModal.style.display = "block";

      confirmResetButton.addEventListener("click", () => {
        form.dispatchEvent(new Event("submit"));
        confirmationModal.style.display = "none";
      });

      cancelDeleteButton.addEventListener("click", () => {
        confirmationModal.style.display = "none";
      });
    });
  }

  //CUSTOM
  const deleteCustomTrainingForms = document.getElementsByClassName("delete-custom-form");
  const deleteCustomTrainingButtons = document.querySelectorAll(".delete-custom-form button");

  deleteCustomTrainingButtons.forEach((button, index) => {
    setupConfirmationModal(
      button,
      deleteCustomTrainingForms[index],
      ".deleteTitle",
      ""
    );
  });

  //SESSION
  const deleteTrainingButtons = document.querySelectorAll(".delete-form-training button");
  const deleteTrainingForms = document.getElementsByClassName("delete-form-training");

  deleteTrainingButtons.forEach((button, index) => {
    setupConfirmationModal(
      button,
      deleteTrainingForms[index],
      ".deleteTitle",
      "Workout 1"
    );
  });

  //TEMPLATE
  const resetTemplateTrainingForms = document.querySelectorAll(".reset-template-training-form");
  const resetTemplateTrainingBTNs = document.querySelectorAll(".reset-template-training-form button");

  resetTemplateTrainingBTNs.forEach((resetButton, index) => {
    setupConfirmationModal(
      resetButton,
      resetTemplateTrainingForms[index],
      null,
      "Template Training"
    );
  });



});
