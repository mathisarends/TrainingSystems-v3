document.addEventListener("DOMContentLoaded", () => {


    const indexViews = document.querySelectorAll(".index-view");

    function switchViews() {
        if (indexViews[0].style.display === "block") {
            indexViews[0].style.display = "none";
            indexViews[1].style.display = "block"
        } else {
            indexViews[0].style.display = "block";
            indexViews[1].style.display = "none"
        }
    }


    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();       

        deferredPrompt = e;         // save the event object for later use

        if (window.innerWidth <= 768 && !pwaInstalled()) { // if the user is on mobile and has not installed the app yet

            switchViews();  

            const installButton = document.getElementById("install-button");

            installButton.addEventListener("click", () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {

                    if (choiceResult.outcome === 'accepted') {
                        localStorage.setItem("pwaInstalled", true);
                    } else {
                    }             

                    deferredPrompt = null; // Setzen Sie das Ereignis-Objekt zurück
                });
            })


        }
    });

    // gives back boolean value whether the app is installed or not
    function pwaInstalled() {
        return localStorage.getItem("pwaInstalled") === "true";
    }

})