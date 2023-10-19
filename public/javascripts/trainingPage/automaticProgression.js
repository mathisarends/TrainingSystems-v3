document.addEventListener("DOMContentLoaded", () => {

    const showAutoProgressionButton = document.getElementById("show-autoprogression");
    if (showAutoProgressionButton) {
        showAutoProgressionButton.addEventListener("click", e => {
            e.preventDefault();

            showAutoProgressionButton.style.display = "none";
            document.getElementById("auto-progression-container").style.display = "flex";
        })
    }


    const handleAutomaticProgressionButton = document.querySelector(".plan-automatic-progression-button");

    handleAutomaticProgressionButton?.addEventListener("click", e => {
        e.preventDefault();
        
        const confirmationModal = document.getElementById("deloadModal");
        confirmationModal.querySelector("input").value = "Progression planen?";
        confirmationModal.querySelectorAll("input")[1].value = "Grundübungen kriegen +0.5 RPE/Woche"
        confirmationModal.querySelectorAll("input")[2].value = "Dein Plan sollte fertig aufgesetzt sein!";


        const confirmButtom = document.getElementById("handle-deload-button");
        const hideModalButton = document.getElementById("hide-modal-button");

        confirmButtom.addEventListener("click", e => {
            e.preventDefault();


            // diese route schickt speichert zunächst alle änderungen auf der aktuellen page, dann werden für jede woche die targetRPEs erhöht
            const currentUrl = window.location.href;
            const modifiedUrl = currentUrl.substring(0, currentUrl.length - 1);
            const newUrl = modifiedUrl + "-progression" + "?_method=PATCH";

            const form = document.querySelector("form");
            const originalAction = form.action;

            form.action = newUrl;
            form.dispatchEvent(new Event("submit"));
            form.action = originalAction;

            confirmationModal.style.display = "none";
            window.scrollTo(0, 0);
        })

        hideModalButton.addEventListener("click", (e) => {
            e.preventDefault();
            deloadModal.style.display = "none";
          });

          deloadModal.style.display = "block";
    })
})