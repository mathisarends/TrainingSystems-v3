document.addEventListener("DOMContentLoaded", () => {
    const createTrainingButton = document.getElementById("create-training-btn");
    const scratchTrainingContainers = document.querySelectorAll("section:nth-of-type(2) .training-plan-container .custom-training-container");
    const deleteTrainingForms = document.getElementsByClassName("delete-form-training");
    const sessionTrainingPlanContainer = document.querySelectorAll(".training-plan-container")[1];

    const startSessionButton = document.getElementById("start-session");
    const editSessionButton = document.getElementById("edit-session");

    let lastSelectedTrainingIndex = null;

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

      function navigateToSessionPage(pageType) {
        if (lastSelectedTrainingIndex !== null) {
          const customPlanPage = `/training/${pageType}-${lastSelectedTrainingIndex + 1}`;
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

      startSessionButton.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToSessionPage("session-train");
      });
    
      editSessionButton.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToSessionPage("session-edit");
    
      });
    
      createTrainingButton.addEventListener("click", (e) => {
        e.preventDefault();
        handleCreateTrainingButtonEventListener("createTraining");
    
      });

      function pulseEffect(element) {
        element.classList.add("pulsate-effect");
    
        setTimeout(() => {
          element.classList.remove("pulsate-effect");
        }, 2000);
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

})