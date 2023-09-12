document.addEventListener("DOMContentLoaded", () => {

  //einfach hier nach der pauseTimer.js einbinden:

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
      //is sw ready?
      if (registration.active) {
        // Nachricht an den Service Worker senden
        registration.active.postMessage({
          command: "getOfflineData", // Ein benutzerdefinierter Befehl oder ein Datenobjekt
          data: `${window.location.href}`, // aktuelle url an den sw senden, da diese als schlüssel in der indexDB verwendet wird:
        });
      }
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.command === "offlineData") {
        const offlineData = message.data;

        console.log("Offline-Daten empfangen:", offlineData);

        if (offlineData) {
          
            for (const key in offlineData) {
                if (offlineData.hasOwnProperty(key)) {
                  // Suchen Sie das Input-Element anhand des "name"-Attributs
                  const inputElement = document.querySelector(`[name="${key}"]`);
              
                  // Überprüfen Sie, ob das Input-Element gefunden wurde
                  if (inputElement) {
                    // Setzen Sie den Wert des Input-Elements auf den Wert aus den Offline-Daten
                    inputElement.value = offlineData[key];
                  }
                }
              }

        } else {
          // Keine Offline-Daten verfügbar
          console.log("Keine Offline-Daten verfügbar");
        }
      }
    });
  }
});
