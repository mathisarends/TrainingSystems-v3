document.addEventListener("DOMContentLoaded", () => {
  const customTrainingContainers = document.querySelectorAll(
    "section:nth-of-type(1) .custom-training-container"
  );
  const deleteCustomTrainingForms =
    document.getElementsByClassName("delete-custom-form");
  const startCustomTrainingButton = document.getElementById(
    "start-custom-training-button"
  );
  const createCustomTrainingPlanBTN = document.getElementById(
    "createCustomTrainingPlanBTN"
  );
  const editCustomTrainingBTN = document.getElementById(
    "edit-custom-training-button"
  );
  const nextTrainingWeeksArr = document.getElementsByClassName(
    "customNextTrainingWeek"
  ); // used in order to link directly to the latest training week
  const customTrainingPlanContainer = document.querySelector(
    ".training-plan-container"
  ); // for pulse effect = shows the user that there was not selected a training prior

  const moreNavOptionsContainer = document.querySelector(
    ".more-training-options"
  );

  const archiveCustomForms = document.querySelectorAll(".archive-custom-form");
  const archiveCustomButtons = document.querySelectorAll(".archive-training-plan-button");

  const statsButton = document.querySelector(".stats-page-button");

  let latestTrainingWeekOfSelectedPlan = null;
  let lastSelectedTrainingIndex = null;

  customTrainingContainers.forEach((container, index) => {
    container.addEventListener("click", () => {
      selectCustomTraining(index);
    });
  });

  // sets up the selected trainingplan for redirecting to the latest week of the plan
  function selectCustomTraining(index) {
    customTrainingContainers.forEach((trainingContainer, i) => {
      trainingContainer.classList.remove("selected");
      deleteCustomTrainingForms[i].style.display = "none";
      editCustomTrainingBTN.style.display = "none";
      archiveCustomForms[i].style.display = "none";
    });

    moreNavOptionsContainer.style.display = "block"; //edit page, delete page etc.
    customTrainingContainers[index].classList.add("selected");
    lastSelectedTrainingIndex = index;
    latestTrainingWeekOfSelectedPlan = nextTrainingWeeksArr[index].value; //
  }

  // additionally shows the delete and edit form
  moreNavOptionsContainer.addEventListener("click", (e) => {
    e.preventDefault();
    moreNavOptionsContainer.style.display = "none"; //hide the button itself
    editCustomTrainingBTN.style.display = "block";
    archiveCustomForms[lastSelectedTrainingIndex].style.display = "block";
    deleteCustomTrainingForms[lastSelectedTrainingIndex].style.display =
      "block";
  });

  startCustomTrainingButton.addEventListener("click", () => {
    //start training
    if (
      lastSelectedTrainingIndex !== null &&
      latestTrainingWeekOfSelectedPlan !== null
    ) {
      const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
      const customPlanPage = `/training/custom-${alphaValue}${latestTrainingWeekOfSelectedPlan}`;
      window.location.href = customPlanPage;
    } else {
      pulseEffect(customTrainingPlanContainer);
    }
  });

  statsButton.addEventListener("click", () => {
    //show stats button
    if (lastSelectedTrainingIndex !== null) {
      const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex); // turns 0 into A, 1 into B...
      const redirectPage = `training/custom-${alphaValue}-stats`;
      window.location.href = redirectPage;
    } else {
      pulseEffect(customTrainingPlanContainer);
    }
  });

  editCustomTrainingBTN.addEventListener("click", (e) => {
    e.preventDefault();
    if (lastSelectedTrainingIndex !== null) {
      const alphaValue = String.fromCharCode(65 + lastSelectedTrainingIndex);
      const customPlanPage = `/training/custom-${alphaValue}-edit`;
      window.location.href = customPlanPage;
    } else {
      pulseEffect(customTrainingPlanContainer);
    }
  });

  //look at this here
  createCustomTrainingPlanBTN.addEventListener("click", (e) => {
    e.preventDefault();

    handleCreateTrainingButtonEventListener("create-training-plan");
  });

/*   archiveCustomButtons.forEach((archiveButton, index) => {
    archiveButton.addEventListener("click", e => {
      e.preventDefault();
      const form = archiveButton.closest("form");
      form
    })
  }) */

  function syncOfflineDataAndReactToResponse(modal, userID, redirectURL) {
    const handleSyncSuccess = () => {
      // Event-Handler für erfolgreiche Synchronisierung
      modal.style.display = "none";
      window.location.href = `${window.location.origin}/training/${redirectURL}`;
    };

    const handleSyncFailure = () => {
      // Event-Handler für fehlgeschlagene Synchronisierung
      modal.style.display = "block";
      modal.querySelector("input").value =
        "Fehler beim Synchronisieren der Daten";

      const tryAgainButton = modal.querySelector("#syncNowButton");
      const cancelButton = modal.querySelector("#cancelSyncButton");

      tryAgainButton.textContent = "TRY AGAIN";
      tryAgainButton.style.display = "block";
      cancelButton.style.display = "block";
    };

    navigator.serviceWorker.ready.then((registration) => {
      //sync offline request an den service-worker
      if (registration.active) {
        registration.active.postMessage({
          command: "syncOfflineData",
          registratedUser: userID,
        });
      }

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data; 
        if (data.type === "offlineSync") { //SUCESS
          handleSyncSuccess();
        }
      });

      // Event-Listener für fehlgeschlagene Synchronisierung
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        if (data.type === "offlineSyncFailure") { //FAILURE
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
    const registratedUserID =
      document.getElementById("userIdentification").value; // as a parameter for sync method

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

            syncOfflineDataAndReactToResponse(
              informationModal,
              registratedUserID,
              redirectURL
            );
          } else if (!networkModeStatus) {
            const tunrnOnOnlineModeBTN =
              document.getElementById("syncNowButton");
            const notAccesibleModalACK =
              document.getElementById("cancelSyncButton");
            tunrnOnOnlineModeBTN.textContent = "TURN OFF";

            tunrnOnOnlineModeBTN.addEventListener("click", (e) => {
              e.preventDefault();

              localStorage.setItem("wifi", true);

              const registratedUserID =
                document.getElementById("userIdentification").value; // as a parameter for sync method

              navigator.serviceWorker.ready.then((registration) => {
                if (registration.active) {
                  registration.postMessage({
                    command: "switchToDefaultMode",
                    registratedUser: registratedUserID,
                  });
                }
              });

              informationModal.querySelector("input").value =
                "Modus erfolgreich gewechselt!";
              tunrnOnOnlineModeBTN.textContent = "NEUER VERSUCH";
              notAccesibleModalACK.style.display = "none";

              tunrnOnOnlineModeBTN.addEventListener("click", (e) => {
                e.preventDefault();

                if (onlineStatus && isSynced) {
                  window.location.href = `${window.location.origin}/training/${redirectURL}`;
                } else if (onlineStatus && !isSynced) {
                  //not synced yet - try to sync

                  setupConfirmationModal(informationModal);

                  syncOfflineDataAndReactToResponse(
                    informationModal,
                    registratedUserID,
                    redirectURL
                  );
                } else if (!onlineStatus) {
                  informationModal.querySelector("input").value =
                    "Dein Gerät ist nicht online!";
                  tunrnOnOnlineModeBTN.style.display = "none";
                  notAccesibleModalACK.style.display = "block";
                }
              });
            });

            informationModal.style.display = "block";

            notAccesibleModalACK.addEventListener("click", (e) => {
              e.preventDefault();
              informationModal.style.display = "none";
            });
          } else if (!onlineStatus || !navigator.onLine) {
            informationModal.querySelector("input").value =
              "No internet connection".toUpperCase();

            informationModal.style.display = "block";
            const tunrnOnOnlineModeBTN =
              document.getElementById("syncNowButton");
            const notAccesibleModalACK =
              document.getElementById("cancelSyncButton");
            notAccesibleModalACK.textContent = "OK";

            tunrnOnOnlineModeBTN.style.display = "none";

            notAccesibleModalACK.addEventListener("click", (e) => {
              e.preventDefault();
              informationModal.style.display = "none";
            });
          } else {
            window.location.href = `${window.location.origin}/training/${redirectURL}`;
          }
        }
      });
    } else {
      // there is no service worker just navigate to the page
      window.location.href = `${window.location.origin}/training/${redirectURL}`;
    }
  }
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

  function pulseEffect(element) {
    element.classList.add("pulsate-effect");

    setTimeout(() => {
      element.classList.remove("pulsate-effect");
    }, 2000);
  }
});
