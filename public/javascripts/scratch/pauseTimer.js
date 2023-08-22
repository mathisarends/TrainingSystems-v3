document.addEventListener("DOMContentLoaded", () => {

    console.log("tets")
    
    const moreInfoButton = document.getElementsByClassName("more-info-button")[0];
    const pauseTimer = document.getElementsByClassName("rest-pause-timer")[0]; 

    let timerInterval;
    let timerRunning = false;
    
    moreInfoButton.addEventListener("click", e => {
        e.preventDefault();
        if (pauseTimer.style.display === "none") {
            pauseTimer.style.display = "block";
        } else {
            clearInterval(timerInterval);
            pauseTimer.style.display = "none"; 
            pauseTimer.textContent = "00:00";
            timerRunning = false;
        }
    })
    
     

    const weightInputs = document.getElementsByClassName("weight");

    for (let i = 0; i < weightInputs.length; i++) {
        weightInputs[i].addEventListener("change", () => {

            if (timerRunning) {
                clearInterval(timerInterval); // Timer stoppen
            }

            startTimer(pauseTimer);
        })
    }

    function startTimer(timerElement) {
        let seconds = 0;
        let minutes = 0;

        // Timer starten
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }

            const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            timerElement.textContent = formattedTime;

            timerRunning = true; // Timer läuft
        }, 1000);
    }

})