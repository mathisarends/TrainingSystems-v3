document.addEventListener("DOMContentLoaded", () => {
  const deleteCustomPlansPart = document.querySelectorAll(
    ".delete-custom-form"
  );
  const deleteSessionPart = document.querySelectorAll(".delete-form-training");
  const deleteTemplatePart = document.querySelectorAll(
    ".reset-template-training-form"
  );

  // in order to decide which endpoint is used
  const upperLimitForCustomTrainingPlans = deleteCustomPlansPart.length;
  const upperLimitForSession =
    parseInt(upperLimitForCustomTrainingPlans) + deleteSessionPart.length;

  // Combine all delte forms to one array
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

  const userIdentification = document.getElementById("userIdentification").value;
  console.log("userIdentification", userIdentification);

  allDeleteForms.forEach((form, index) => {
    let fetchUrl; //decide by index which route shall be used
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
      console.log(formData.userIdentification + " vs " + userIdentification);

      console.log(formDataObject);

      try {
        await fetch(fetchUrl, {
          method: "DELETE",
          body: JSON.stringify(formDataObject),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.log("Error while trying to delete", error);
      } finally {
        // either way the page has to reload in order to have congruent behaviour with the upperlimites etc
        location.reload();
      }
    });
  });

  // Confirmation modal before delete
  const confirmationModal = document.getElementById("confirmationModal");
  const confirmResetButton = document.getElementById("confirmResetButton");
  const cancelDeleteButton = document.getElementById("cancelResetButton");

  // is called by all delete or reset buttons
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

  function pulseEffect(element) {
    element.classList.add("pulsate-effect");

    setTimeout(() => {
      element.classList.remove("pulsate-effect");
    }, 2000);
  }

  /* CUSTOM PLANS --------------------------*/

  const customTrainingContainers = document.querySelectorAll(
    "section:nth-of-type(1) .custom-training-container"
  );
  const deleteCustomTrainingForms =
    document.getElementsByClassName("delete-custom-form");
  const deleteCustomTrainingButtons = document.querySelectorAll(
    ".delete-custom-form button"
  );
  const startCustomTrainingButton = document.getElementById(
    "start-custom-training-button"
  );
  const createCustomTrainingPlanBTN = document.getElementById(
    "createCustomTrainingPlanBTN"
  );
  const editCustomTrainingBTN = document.getElementById(
    "edit-custom-training-button"
  );
  const customNextTrainingWeeks = document.getElementsByClassName(
    "customNextTrainingWeek"
  ); // used in order to link directly to the latest training week

  const customTrainingPlanContainer = document.querySelectorAll(
    ".training-plan-container"
  )[0]; // for pulse effect = shows the user that there was not selected a training prior

  const moreTrainingOptionsCustom = document.getElementsByClassName("more-training-options")[0];
  const archiveCustomPlansForm = document.getElementsByClassName("archive-custom-form");

  const navToStatsButtons = document.querySelectorAll(".stats-page-button");

  let customCurrentSelectedTrainingWeek;
  let lastSelectedLinkIndex = null;

  // shows only the last selected delete form and saves the index of the lastSelected link
  function selectCustomTraining(index) {
    for (let i = 0; i < customTrainingContainers.length; i++) {
      customTrainingContainers[i].classList.remove("selected");
      deleteCustomTrainingForms[i].style.display = "none";
    }
    moreTrainingOptionsCustom.style.display = "block";
    customTrainingContainers[index].classList.add("selected");
    lastSelectedLinkIndex = index;
    customCurrentSelectedTrainingWeek = customNextTrainingWeeks[index].value;
  }


  moreTrainingOptionsCustom.addEventListener("click", e => {
    e.preventDefault();
    moreTrainingOptionsCustom.style.display = "none";
    navToStatsButtons[0].style.display = "block";
    deleteCustomTrainingForms[lastSelectedLinkIndex].style.display = "block";
  })

  customTrainingContainers.forEach((container, index) => {
    container.addEventListener("click", (e) => {
      e.preventDefault();
      selectCustomTraining(index);
    });
  });

  // the first on is for custom training plans
  navToStatsButtons[0].addEventListener("click", e => {
    e.preventDefault();
    if (lastSelectedLinkIndex !== null) {
      const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndex);
      const redirectPage = `training/custom-${alphaValue}-stats`;
      window.location.href = redirectPage;
    }
   })

  startCustomTrainingButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (lastSelectedLinkIndex !== null) {
      const alphaValue = String.fromCharCode(65 + lastSelectedLinkIndex);
      const customPlanPage = `/training/custom-${alphaValue}${customCurrentSelectedTrainingWeek}`;
      window.location.href = customPlanPage;
    } else {
      // if there was no training selected prior a animation is shown to the user
      pulseEffect(customTrainingPlanContainer);
    }
  });

  function syncOfflineDataAndReactToResponse(modal, userID, redirectURL) {
    // Event-Handler für erfolgreiche Synchronisierung
    const handleSyncSuccess = () => {
      modal.style.display = "none";
      window.location.href = `${window.location.origin}/training/${redirectURL}`;
    };
  
    // Event-Handler für fehlgeschlagene Synchronisierung
    const handleSyncFailure = () => {
      modal.style.display = "block";
      modal.querySelector("input").value = "Fehler beim Synchronisieren der Daten";
      
      const tryAgainButton = modal.querySelector("#syncNowButton");
      const cancelButton = modal.querySelector("#cancelSyncButton");
  
      tryAgainButton.textContent = "TRY AGAIN";
      tryAgainButton.style.display = "block";
      cancelButton.style.display = "block";
    };
  
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          command: "syncOfflineData",
          registratedUser: userID,
        });
      }
  
      // Event-Listener für erfolgreiche Synchronisierung
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        if (data.type === "offlineSync") {
          handleSyncSuccess();
        }
      });
  
      // Event-Listener für fehlgeschlagene Synchronisierung
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        if (data.type === "offlineSyncFailure") {
          handleSyncFailure();
        }
      });
    });
  }

  function setupSynchronizeModal(modal) {
    modal.querySelector("input").value = "Offline Daten synchronisieren";
    const syncNowButton = document.getElementById("syncNowButton");
    const cancelSyncButton = document.getElementById("cancelSyncButton");

    syncNowButton.textContent = "..."; // use this button as a loading placeholder
    modal.style.display = "block";
    cancelSyncButton.style.display = "none";
  }

  function handleCreateTrainingButtonEventListener(redirectURL) {
    const informationModal = document.getElementById("notAccesibleModal"); //used for several purposes
    const registratedUserID = document.getElementById("userIdentification").value; // as a parameter for sync method

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            command: "networkModeRequest", //send request in order to retrieve networkMode and syncStatus
          });
        }
      });

      // react to the response of the service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        const message = event.data;

        if (message.command === "networkModeResponse") {
          //received data from service worker
          const networkModeStatus = message.networkMode;
          const onlineStatus = message.onlineStatus;
          const isSynced = message.isSynced;

          // if the data is not synced but network connection is there
          if (!isSynced && networkModeStatus && onlineStatus) {

            setupSynchronizeModal(informationModal);

            syncOfflineDataAndReactToResponse(informationModal, registratedUserID, redirectURL);

          } else if (!networkModeStatus) {

            const tunrnOnOnlineModeBTN = document.getElementById("syncNowButton");
            const notAccesibleModalACK = document.getElementById("cancelSyncButton");
            tunrnOnOnlineModeBTN.textContent = "TURN OFF";

            tunrnOnOnlineModeBTN.addEventListener("click", e => {
              e.preventDefault();

              localStorage.setItem("wifi", true);

              const registratedUserID = document.getElementById("userIdentification").value; // as a parameter for sync method

              navigator.serviceWorker.ready.then((registration) => {
                if (registration.active) {
                  registration.postMessage({
                    command: "switchToDefaultMode",
                    registratedUser: registratedUserID,
                  })
                }
              })

              informationModal.querySelector("input").value = "Modus erfolgreich gewechselt!";
              tunrnOnOnlineModeBTN.textContent = "NEUER VERSUCH";
              notAccesibleModalACK.style.display = "none";

              tunrnOnOnlineModeBTN.addEventListener("click", e => {
                e.preventDefault();

                if (onlineStatus && isSynced) {
                  window.location.href = `${window.location.origin}/training/${redirectURL}`;
                } else if (onlineStatus && !isSynced) { //not synced yet - try to sync

                  setupConfirmationModal(informationModal);

                  // informationModal.querySelector("input").value = "Offline Daten synchronisieren";
                  // const syncNowButton = document.getElementById("syncNowButton");
                  // const cancelSyncButton = document.getElementById("cancelSyncButton");
      
                  // syncNowButton.textContent = "..."; // use this button as a loading placeholder
                  // informationModal.style.display = "block";
                  // cancelSyncButton.style.display = "none";

                  syncOfflineDataAndReactToResponse(informationModal, registratedUserID, redirectURL);
                } else if(!onlineStatus) {
                  informationModal.querySelector("input").value = "Dein Gerät ist nicht online!";
                  tunrnOnOnlineModeBTN.style.display = "none";
                  notAccesibleModalACK.style.display = "block";
                }
              })

            })

            informationModal.style.display = "block";

            notAccesibleModalACK.addEventListener("click", (e) => {
              e.preventDefault();
              informationModal.style.display = "none";
            });
          } else if (!onlineStatus || !navigator.onLine) {

            informationModal.querySelector("input").value = "No internet connection".toUpperCase();

            informationModal.style.display = "block";
            const tunrnOnOnlineModeBTN = document.getElementById("syncNowButton");
            const notAccesibleModalACK = document.getElementById("cancelSyncButton");
            notAccesibleModalACK.textContent = "OK";

            tunrnOnOnlineModeBTN.style.display = "none";

            notAccesibleModalACK.addEventListener("click", (e) => {
              e.preventDefault();
              informationModal.style.display = "none";
            })
          }
           else {
            window.location.href = `${window.location.origin}/training/${redirectURL}`;
          }
        }
      });
    } else {
      // there is no service worker just navigate to the page
      window.location.href = `${window.location.origin}/training/${redirectURL}`;
    }
  }

  createCustomTrainingPlanBTN.addEventListener("click", (e) => {
    e.preventDefault();

   handleCreateTrainingButtonEventListener("create-training-plan");
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
  });

  //deletes CustomTrainings
  deleteCustomTrainingButtons.forEach((button, index) => {
    setupConfirmationModal(
      button,
      deleteCustomTrainingForms[index],
      ".deleteTitle",
      ""
    );
  });

  /* TEMPLATE ------------------------------------------*/
  const templateTrainingPlanLinks = document.querySelectorAll(
    "section:nth-of-type(3) .training-plan-container .custom-training-container"
  );
  const startTemplateTrainingPlanBTN = document.getElementById(
    "start-template-training-button"
  );
  const resetTemplateTrainingForm = document.getElementsByClassName(
    "reset-template-training-form"
  );
  const templateNextTrainingWeeks = document.getElementsByClassName(
    "templateNextTrainingWeek"
  );
  const editTemplateTrainingBTN = document.getElementById(
    "edit-template-training-button"
  );

  const templateTrainingPlanContainer = document.querySelectorAll(
    ".training-plan-container"
  )[2];

  // Variablen zur Verfolgung der Auswahl
  let lastSelectedLinkIndexTemplate = null;
  let lastSelectNextTrainingWeek = null;

  // Event-Handler für das Starten des Template-Trainings
  startTemplateTrainingPlanBTN.addEventListener("click", () => {
    if (lastSelectedLinkIndexTemplate !== null) {
      const alphaValue = String.fromCharCode(
        65 + lastSelectedLinkIndexTemplate
      );
      const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}`;
      console.log(alphaValue + " alphanumeric value");
      window.location.href = customPlanPage;
    } else {
      pulseEffect(templateTrainingPlanContainer);
    }
  });

  editTemplateTrainingBTN.addEventListener("click", () => {
    if (lastSelectedLinkIndexTemplate !== null) {
      const alphaValue = String.fromCharCode(
        65 + lastSelectedLinkIndexTemplate
      );
      const customPlanPage = `/training/template-${alphaValue}${lastSelectNextTrainingWeek}-edit`;
      console.log(alphaValue + " alphanumeric value");
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
      resetTemplateTrainingForm[index].style.display = "block";
      lastSelectedLinkIndexTemplate = linkIndex;
      lastSelectNextTrainingWeek = templateNextTrainingWeeks[index].value;
    });
  });

  // Event-Handler für das Zurücksetzen des Template-Trainings
  const resetTemplateTrainingBTNs = document.querySelectorAll(
    ".reset-template-training-form button"
  );

  resetTemplateTrainingBTNs.forEach((resetButton, index) => {
    setupConfirmationModal(
      resetButton,
      resetTemplateTrainingForm[index],
      null,
      "Template Training"
    );
  });

  /*SCRATCH TRAINING ------------------------------------------*/
  const createTrainingButton = document.getElementById("create-training-btn");
  const scratchTrainingContainers = document.querySelectorAll(
    "section:nth-of-type(2) .training-plan-container .custom-training-container"
  );
  const deleteTrainingForms = document.getElementsByClassName(
    "delete-form-training"
  );
  const deleteTrainingButtons = document.querySelectorAll(
    ".delete-form-training button"
  );
  let lastSelectedTrainingIndex = null;

  const sessionTrainingPlanContainer = document.querySelectorAll(
    ".training-plan-container"
  )[1];

  function selectTraining(index) {
    if (lastSelectedTrainingIndex !== null) {
      scratchTrainingContainers[lastSelectedTrainingIndex].classList.remove(
        "selected"
      );
      deleteTrainingForms[lastSelectedTrainingIndex].style.display = "none";
    }

    scratchTrainingContainers[index].classList.add("selected");
    deleteTrainingForms[index].style.display = "block";
    lastSelectedTrainingIndex = index;
  }

  function navigateToTrainingPage(pageType) {
    if (lastSelectedTrainingIndex !== null) {
      const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
      const customPlanPage = `/training/${pageType}-${
        lastSelectedTrainingIndex + 1
      }`;
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

  });

  createTrainingButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleCreateTrainingButtonEventListener("createTraining");

  });

  deleteTrainingButtons.forEach((button, index) => {
    setupConfirmationModal(
      button,
      deleteTrainingForms[index],
      ".deleteTitle",
      "Workout 1"
    );
  });
});
