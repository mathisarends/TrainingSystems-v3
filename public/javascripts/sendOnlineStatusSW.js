console.log("send online status dynamically:")

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