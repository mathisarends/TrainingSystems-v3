document.addEventListener("DOMContentLoaded", () => {
    //switch on/off the rest pause container
    const hidePauseTimerFields = document.querySelectorAll(".numbered-title");
    const restPauseContainers = document.querySelectorAll(".rest-pause-container");

    // Maximale Breite, bei der der Pause-Timer angezeigt wird
    const maxScreenWidthToShowTimer = 1154; // Passen Sie dies an Ihre Anforderungen an

    hidePauseTimerFields.forEach((hidePauseTimerField, index) => {
        hidePauseTimerField.addEventListener("click", () => {
            // Überprüfen Sie die Bildschirmbreite
            if (window.innerWidth <= maxScreenWidthToShowTimer) {
                // Bildschirm ist kleiner oder gleich der maximalen Breite, den Pause-Timer anzeigen
                if (restPauseContainers[index].style.display === "block") {
                    restPauseContainers[index].style.display = "none";
                } else {
                    restPauseContainers[index].style.display = "block";
                }
            } else {
                // Bildschirm ist größer als die maximale Breite, den Pause-Timer ausblenden
                restPauseContainers[index].style.display = "none";
            }
        });
    });

    // Fügen Sie ein Event-Listener hinzu, um auf Änderungen der Bildschirmgröße zu reagieren
    window.addEventListener("resize", () => {
        if (window.innerWidth > maxScreenWidthToShowTimer) {
            // Bildschirm ist größer als die maximale Breite, alle Pause-Timer ausblenden
            restPauseContainers.forEach(container => {
                container.style.display = "none";
            });
        }
    });
});