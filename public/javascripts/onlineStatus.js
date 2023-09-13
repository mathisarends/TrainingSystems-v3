    document.addEventListener("DOMContentLoaded", () => {

        console.log("neuer online status eingebunden");
        
        // ist nur bei der initialen registrierung des service workers relevant was okay ist
        if ("serviceWorker" in navigator) {
            if (navigator.serviceWorker.controller) {

                // hier wird zwar die anfrage an den service worker gestellt abre nicht unbedingt immer an den richtigen.
                // 

                navigator.serviceWorker.controller.postMessage({ type: "requestOnlineStatus" });

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
                })
            }
        }


        window.addEventListener("online", () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage("online");
            }
        })

        window.addEventListener("offline", () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage("offline");
            }

        })
    })
