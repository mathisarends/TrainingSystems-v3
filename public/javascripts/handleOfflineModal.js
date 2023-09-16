document.addEventListener("DOMContentLoaded", () => {

    //ack button - sets modal display property to none

    const ackButton = document.getElementById("ackBTN");
    const offlineModal = document.getElementById("offlineModal");

    ackButton.addEventListener("click", e => {
        e.preventDefault();

        hideModal();
    })

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", event => {
            const data = event.data;

            if (data.type === "offlineSync") {
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