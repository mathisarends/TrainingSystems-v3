document.addEventListener("DOMContentLoaded", () => {
    const volumePhaseSelector = document.getElementById("volumePhasesSelector");
    const volumePhases = document.getElementsByClassName("volumePhases"); //displayed container

    const updateVolumePhases = () => {
        let phase = volumePhaseSelector.value;
        if (phase === "hypertrophie") {
        volumePhases[0].style.display = "block";
        volumePhases[1].style.display = "none";
        volumePhases[2].style.display = "none";
        } else if (phase === "kraft") {
        volumePhases[0].style.display = "none";
        volumePhases[1].style.display = "block";
        volumePhases[2].style.display = "none";
        } else if (phase === "peaking") {
        volumePhases[0].style.display = "none";
        volumePhases[1].style.display = "none";
        volumePhases[2].style.display = "block";
        } else {
        console.log("Wert ist nicht implementiert");
        }
    };

    updateVolumePhases();
    volumePhaseSelector.addEventListener("change", updateVolumePhases);
})