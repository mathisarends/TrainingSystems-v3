// Ereignislistener, um den anfänglichen Online-Status zu ermitteln
window.addEventListener("DOMContentLoaded", () => {
  console.log("neuer neuer online status eingebunden");

  function sendOnlineStatusToServiceWorker(onlineOrOfflineString) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(onlineOrOfflineString);
    }
  }

  // Initialen Online-Status ermitteln
  const initialOnlineStatus = navigator.onLine ? "online" : "offline";

  // Den anfänglichen Online-Status an den Service Worker senden

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "requestOnlineStatus",
      url: window.location.href,
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      if (data.type === "requestedOnlineStatus") {
        const isOnline = data.isOnline;

        // schickt die nachricht wieder zurück - etwas umständlich:
        if (isOnline) {
          navigator.serviceWorker.controller.postMessage("online");
        } else if (!isOnline) {
          navigator.serviceWorker.controller.postMessage("offline");
        }
      }
    });
  }

  // Weitere Ereignislistener für Online- und Offline-Änderungen hinzufügen
  window.addEventListener("online", () => {
    sendOnlineStatusToServiceWorker("online"); // Online
  });

  window.addEventListener("offline", () => {
    sendOnlineStatusToServiceWorker("offline"); // Offline
  });
});
