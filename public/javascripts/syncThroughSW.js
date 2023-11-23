const offlineModal = document.getElementById("offlineModal");

// svgs for user feedback
const onlineSVG = document.getElementById("online-svg");
const offlineSVG = document.getElementById("offline-svg");
const syncSVG = document.getElementById("sync-svg");

const DESKTOP_MIN_WIDTH = 1024;

const showModal = () => {
  const offlineModal = document.getElementById("offlineModal");
  offlineModal.style.display = "block";
}

const hideModal = () => {
  const offlineModal = document.getElementById("offlineModal");
  offlineModal.style.display = "none";
  offlineModal.querySelector("input").value = "Offline Daten synchronsiert";
}

const showOnlineSVG = () => {
  onlineSVG.style.display = "block";
  syncSVG.style.display = "none";
  offlineSVG.style.display = "none";
}

const showOfflineSVG = () => {
  onlineSVG.style.display = "none";
  offlineSVG.style.display = "block";
}

const showSyncButton = () => {
  syncSVG.style.display = "block";
  onlineSVG.style.display = "none";
}


const handleStatusBarClick = (showStatusBar, statusBar) => {
  showStatusBar.style.display = "none";
  statusBar.style.transform = "translateY(0%)";
}

const handleCloseModalButton = (waitForSyncModal) => {
  e.preventDefault();
  waitForSyncModal.style.display = "none";
  waitForSyncModal.classList.remove("active");
}

const switchToOfflineMode = (registration) => {
  registration.active.postMessage("switchToOfflineMode");
  syncSVG.style.display = "none";
  localStorage.setItem("wifi", false);
  showOfflineSVG(); //switch view to offline - always display current status
}

const switchToDefaultMode = (registration, registratedUserID) => {
  registration.active.postMessage({
    command: "switchToDefaultMode",
    registratedUser: registratedUserID,
  });
  localStorage.setItem("wifi", true);
  showOnlineSVG();
}

const tryToSwitchToDefaultMode = (registration, registratedUserID) => {
  registration.active.postMessage({command: "getOnlineStatus"}); //get actual online status of serviceWorker

  navigator.serviceWorker.addEventListener("message", (event) => { //react to online status
    const data = event.data;

    if (data.type === "swOnlineStatus") {
      if (data.onlineStatus === true) {
        switchToDefaultMode(registration, registratedUserID);
      } else {
        //show modal that the device is not online
        offlineModal.querySelector("input").value = "Keine Internetverbindung";
        showModal();
        setTimeout(hideModal, 3000);
      }
    }
  });
}

const activateServer = () => {
  const turnServerOnModal = document.getElementById("turnServerOnModal");
  turnServerOnModal.style.display = "block";

  const turnServerOnButton = document.getElementById("turn_on_server");
  const cancelButton = document.getElementById("cancel_server");

  turnServerOnButton.addEventListener("click", () => {
    localStorage.setItem("wifi", "true");
    window.location.href = "/logout";
  })

  cancelButton.addEventListener("click", () => {
    turnServerOnModal.style.display = "none";
  })
}

const syncOfflineData = (registration, registratedUserID) => {
  registration.active.postMessage({
    command: "syncOfflineData",
    registratedUser: registratedUserID,
  });

  syncSVG.style.display = "none"; //dont display the sync button anymore
  onlineSVG.style.display = "block";
}


const handleNetworkModeSelector = async (registration) => {

    const registratedUserID = document.getElementById("userIdentification").value; //used for syncing data to the right account

    const showStatusBar = document.getElementById("show-wifi-bar");
    const statusBar = document.getElementById("wifi-bar");

    if (window.innerWidth > DESKTOP_MIN_WIDTH) {
      showStatusBar.style.display = "none";
    }

    showStatusBar.addEventListener("click", () => handleStatusBarClick(showStatusBar, statusBar));

    const defaultNetworkMode = JSON.parse(localStorage.getItem("wifi"));     // check inital status wheter offline mode is on or not

    await navigator.serviceWorker.ready;
    
    if (defaultNetworkMode) {
      registration.active.postMessage({
        command: "getOnlineStatus",
      });
    } else {
      switchToOfflineMode(registration);
    }

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      if (data.type === "swOnlineStatus") {

        const onlineStatus = data.onlineStatus;

        // if the device is only check for localstorage value | if offline then always set it to offline
        if (onlineStatus) {
          
          if (!defaultNetworkMode) {
            switchToOfflineMode(registration);
          } else {
            switchToDefaultMode(registration, registratedUserID);
          }
        }
      }
    });

    // bei auswahl neune status an den service worker senden und im localstorage für initiales laden speichern
    onlineSVG.addEventListener("click", () => switchToOfflineMode(registration));
    offlineSVG.addEventListener("click", () => tryToSwitchToDefaultMode(registration, registratedUserID));


    const toggleServerButton = document.getElementById("toggle-server");
    toggleServerButton.addEventListener("click", () => activateServer());

    //wenn auf den online modus gewechselt wird und der service worker feststellt dass es ungespeicherte daten aus dem offline mode gibt dann wird dieser button angezeigt: um zu synchroniseren:
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      // if data is not synced show sync button
      if (data.type === "showSyncButton" && navigator.onLine) {
        showSyncButton();
      }
    });

    syncSVG.addEventListener("click", () => syncOfflineData(registration, registratedUserID));

    //ack button - sets modal display property to none
    const waitForSyncModal = document.getElementById("waitForSyncModal"); //to inform the user process has started

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;

        // if the data was synced show modal for 3 seconds
        if (data.type === "offlineSync") {
          waitForSyncModal.style.display = "none";
          showModal();
          setTimeout(hideModal, 2500);
        }
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;

        if (data.type === "offlineSyncFailure") {
          //do not display the loading modal anymore => instead show the new one

          waitForSyncModal.style.display = "none";

          const offlineModal = document.getElementById("offlineModal");
          offlineModal.querySelector("input").value = "Fehler beim Synchronisieren";
          showModal();

          setTimeout(hideModal, 4000);

          showOnlineSVG();
        }
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;

          if (data.type === "showWaitForSyncModal") {
            waitForSyncModal.style.display = "block";
          }
        });
      }

    const closeModalButton = document.getElementById("close-modal-button");
    closeModalButton.addEventListener("click", () => handleCloseModalButton(waitForSyncModal));
}


document.addEventListener("DOMContentLoaded", () => {
  // check whether there is a service worker already installed
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.active) {
        handleNetworkModeSelector(registration);
      } else {
        navigator.serviceWorker
          .register("/register-service-worker", {
            scope: "/", 
          })
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            handleNetworkModeSelector(registration);
          })
          .catch((error) => {
            console.log("Fehler bei der Registrierung des Service Workers:", error);
          });
      }
    });
  } else {
    document.getElementById("wifi-bar").style.display = "none"; //if there is no service worker dont show the bar @all
  }
});
