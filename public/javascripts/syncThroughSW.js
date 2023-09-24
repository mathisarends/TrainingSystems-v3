document.addEventListener("DOMContentLoaded", () => {
  // check whether there is a service worker already installed
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.active) {
        handleNetworkModeSelector(registration);
      } else {
        navigator.serviceWorker
          .register("/register-service-worker", {
            scope: "/", // global scope
          })
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            handleNetworkModeSelector(registration);
          })
          .catch((error) => {
            console.log(
              "Fehler bei der Registrierung des Service Workers:",
              error
            );
          });
      }
    });
  } else {
    // if there is no service worker there is no sync process so dont show bar at all
    document.getElementById("wifi-bar").style.display = "none";
  }

  async function handleNetworkModeSelector(registration) {
    const registratedUserID =
      document.getElementById("userIdentification").value; //used for syncing data to the right account

    // wifi bar is initially toggled and only shown through user interaction
    const showWifiBar = document.getElementById("show-wifi-bar");
    const wifiBar = document.getElementById("wifi-bar");

    // assumption desktop pcs or big tablets always have a network connection
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    if (screenWidth > 1024) {
      showWifiBar.style.display = "none";
    }

    // wifi bar is animated in through css translate animation
    showWifiBar.addEventListener("click", () => {
      showWifiBar.style.display = "none";
      wifiBar.style.transform = "translateY(0%)";
    });

    // switch modes and sync data
    const onlineSVG = document.getElementById("online-svg");
    const offlineSVG = document.getElementById("offline-svg");
    const syncSVG = document.getElementById("sync-svg");

    // check inital status wheter offline mode is on or not
    const isOnlineModeOn = localStorage.getItem("wifi");

    // wait for service worker activation
    async function waitForServiceWorkerActivation() {
      while (!registration.active) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    await waitForServiceWorkerActivation();

    //get online status first => if !online then set the wifi to offline automatically
    // if online set the custom wifi
    registration.active.postMessage({
      command: "getOnlineStatus",
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      if (data.type === "swOnlineStatus") {

        const onlineStatus = data.onlineStatus;

        // if the device is only check for localstorage value | if offline then always set it to offline
        if (onlineStatus) {
          // set initial status and send it to service worker => value from localstorage
          if (isOnlineModeOn === "true") {
            registration.active.postMessage({
              command: "switchToDefaultMode",
              registratedUser: registratedUserID,
            });

            showOnlineSVG();
          } else if (isOnlineModeOn === "false") {
            registration.active.postMessage("switchToOfflineMode");

            showOfflineSVG();
          } else {
            //inital the default mode is selected

            registration.active.postMessage({
              command: "switchToDefaultMode",
              registratedUser: registratedUserID,
            });

            showOnlineSVG();
          }
        } else if (!onlineStatus) {

          // if the device is not online always set network mode to false;
          registration.active.postMessage("switchToOfflineMode");
          showOfflineSVG();
        }
      }
    });

    // bei auswahl neune status an den service worker senden und im localstorage für initiales laden speichern
    onlineSVG.addEventListener("click", () => {
      registration.active.postMessage("switchToOfflineMode");
      syncSVG.style.display = "none";
      localStorage.setItem("wifi", false);
      showOfflineSVG(); //switch view to offline - always display current status
    });

    // the user is not allowed to switch to online mode when the device itself is offline
    offlineSVG.addEventListener("click", () => {
      registration.active.postMessage({
        command: "getOnlineStatus",
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;

        if (data.type === "swOnlineStatus") {
          if (data.onlineStatus === true) {
            registration.active.postMessage({
              command: "switchToDefaultMode",
              registratedUser: registratedUserID,
            });
            localStorage.setItem("wifi", true);
            showOnlineSVG();
          } else {
            //show modal that the device is not online

            offlineModal.querySelector("input").value =
              "Keine Internetverbindung";

            showModal();
            setTimeout(hideModal, 3000);
          }
        }
      });
    });

    //wenn auf den online modus gewechselt wird und der service worker feststellt dass es ungespeicherte daten aus dem offline mode gibt dann wird dieser button angezeigt: um zu synchroniseren:
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      // if the sw decides that the data isnt synced and we are online show the showSyncButton
      if (data.type === "showSyncButton" && navigator.onLine) {
        syncSVG.style.display = "block";
        onlineSVG.style.display = "none";
      }
    });

    syncSVG.addEventListener("click", () => {
      registration.active.postMessage({
        command: "syncOfflineData",
        registratedUser: registratedUserID,
      });

      syncSVG.style.display = "none"; //dont display the sync button anymore
      onlineSVG.style.display = "block";
    });

    //ack button - sets modal display property to none
    const ackButton = document.getElementById("ackBTN");
    const offlineModal = document.getElementById("offlineModal");

    const waitForSyncModal = document.getElementById("waitForSyncModal"); //to inform the user process has started

    ackButton.addEventListener("click", (e) => {
      e.preventDefault();

      hideModal();
    });

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

          offlineModal.querySelector("input").value =
            "Fehler beim Synchronisieren";
          showModal();

          setTimeout(hideModal, 4000);

          syncSVG.style.display = "none";
          onlineSVG.style.display = "block";
        }
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;

        if (data.type === "showWaitForSyncModal") {
          waitForSyncModal.style.display = "block";
        }
      });
    }

    // Funktion zum Einblenden des Modals
    function showModal() {
      offlineModal.style.display = "block";

      ackButton.addEventListener("click", (e) => {
        e.preventDefault();

        hideModal();
      });
    }

    // Funktion zum Ausblenden des Modals
    function hideModal() {
      offlineModal.style.display = "none";
      offlineModal.querySelector("input").value = "Offline Daten synchronsiert";
    }

    function showOnlineSVG() {
      onlineSVG.style.display = "block";
      offlineSVG.style.display = "none";
    }

    function showOfflineSVG() {
      onlineSVG.style.display = "none";
      offlineSVG.style.display = "block";
    }
  }
});