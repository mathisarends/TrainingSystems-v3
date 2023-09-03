document.addEventListener("DOMContentLoaded", () => {


    const indexViews = document.querySelectorAll(".index-view");

    function switchViews() {
        if (indexViews[0].style.display === "block") {
            console.log("1");
            indexViews[0].style.display = "none";
            indexViews[1].style.display = "block"
        } else {
            console.log("2");
            indexViews[0].style.display = "block";
            indexViews[1].style.display = "none"
        }
    }


    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();         // Verhindern Sie, dass das Browser-interne Installations-Popup angezeigt wird

        deferredPrompt = e;         // Speichern Sie das Ereignis-Objekt für spätere Verwendung

        if (window.innerWidth <= 768 && !pwaInstalled()) { // wennn der nutzer sich auf einem mobile gerät befindet und die app nocht nicht installiert hat

            switchViews(); //trotzdem wird hier nicht das richtige angezeigt: 

            const installButton = document.getElementById("install-button");

            installButton.addEventListener("click", () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {

                    if (choiceResult.outcome === 'accepted') {
                        console.log('Benutzer hat die Installation akzeptiert');
                        localStorage.setItem("pwaInstalled", true);
                    } else {
                        console.log('Benutzer hat die Installation abgelehnt');
                    }             

                    deferredPrompt = null; // Setzen Sie das Ereignis-Objekt zurück
                });
            })


        }
    });

    function pwaInstalled() {
        return localStorage.getItem("pwaInstalled") === "true";
    }

})