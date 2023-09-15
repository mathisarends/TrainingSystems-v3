document.addEventListener("DOMContentLoaded", () => {

    //ack button - sets modal display property to none

    console.log("Handle offline data like that");

    const ackButton = document.getElementById("ackBTN");
    const offlineModal = document.getElementById("offlineModal");

    ackButton.addEventListener("click", e => {
        e.preventDefault();

        hideModal
    })

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", event => {
            const data = event.data;

            if (data.type === "offlineSync") {
                console.log("service worker hat nachricht gesendet jetzt das modal einblenden");
                showModal();
                setTimeout(hideModal, 4000);
            }
        })
    }


    // Funktion zum Einblenden des Modals
  function showModal() {
    offlineModal.style.display = "block";
  }

  // Funktion zum Ausblenden des Modals
  function hideModal() {
    offlineModal.style.display = "none";
  }


})