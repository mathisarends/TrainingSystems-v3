document.addEventListener("DOMContentLoaded", () => {
     // TODO: container farblich anders gestalten und progress. das höchste ist hundert entsprechend anzeigen
        // außerdem dass man die container quasi drehen kann und da leistungsfähigkeit angezeigt wird
        // wöchtentliches total?

        const squatTonnageArr = parseInputArray(document.getElementById("squatTonnageArray").value);
        const benchTonnageArr = parseInputArray(document.getElementById("benchTonnageArray").value);
        const deadliftTonnageArr = parseInputArray(document.getElementById("deadliftTonnageArray").value);

        const maxSquatTonnageWeekObj = getHighestTonnageOfCategory(squatTonnageArr);
        const maxBenchTonnageWeekObj = getHighestTonnageOfCategory(benchTonnageArr);
        const maxDeadliftTonnageWeekObj = getHighestTonnageOfCategory(deadliftTonnageArr);

        const firstSection = document.querySelector("section:nth-of-type(1)");
        const secondSection = document.querySelector("section:nth-of-type(2)");
        const thirdSection = document.querySelector("section:nth-of-type(3)");

        const firstSectionContainers = firstSection.querySelectorAll(".stats-container");
        const secondSectionContainers = secondSection.querySelectorAll(".stats-container");
        const thirdSectionContainers = thirdSection.querySelectorAll(".stats-container");

        applyBackgroundGradient(firstSectionContainers, maxSquatTonnageWeekObj, squatTonnageArr);
        applyBackgroundGradient(secondSectionContainers, maxBenchTonnageWeekObj, benchTonnageArr);
        applyBackgroundGradient(thirdSectionContainers, maxDeadliftTonnageWeekObj, deadliftTonnageArr);


        function applyBackgroundGradient(containers, maxTonnageWeekObj, tonnageArr) {
            containers.forEach((container, index) => {
                const computedStyle = getComputedStyle(container);
                const backgroundColor = computedStyle.backgroundColor;

                if (index !== maxTonnageWeekObj.index) {
                const maxTonnage = maxTonnageWeekObj.max;
                const currentTonnage = tonnageArr[index];

                const percentage = (currentTonnage / maxTonnage) * 100;
                
                // Initialisiere die Container mit 0% Breite
                container.style.background = `linear-gradient(to right, ${backgroundColor} 0%, transparent 0%)`;
                animateContainer(container, percentage, backgroundColor);

                } else {
                    animateContainer(container, undefined, backgroundColor);
                }

            });
        }

        function animateContainer(container, targetPercentage, backgroundColor) {

            if (!targetPercentage) {
                targetPercentage = 100;
            }

            let currentPercentage = 0;
            const animationDuration = 350; // 1 Sekunde

            const animationInterval = setInterval(() => {
                if (currentPercentage < targetPercentage) {
                currentPercentage += 1;
                container.style.background = `linear-gradient(to right, ${backgroundColor} ${currentPercentage}%, transparent ${currentPercentage}%)`;
                } else {
                clearInterval(animationInterval);
                }
            }, animationDuration / targetPercentage); // Berechnen Sie das Intervall basierend auf der gewünschten Dauer und dem Ziel-Prozentsatz
            }
        

        function parseInputArray(input) {
            // Split the input string by comma and convert each part to a number
            return input.split(',').map(Number);
        }

        function getHighestTonnageOfCategory(tonnageArray) {
            let max = 0;
            let maxIndex = -1; // Initialize to -1 or another appropriate value

            tonnageArray.forEach((tonnage, index) => {
                if (tonnage > max) {
                max = tonnage;
                maxIndex = index; // Update maxIndex when a new maximum is found
                }
            });

            return {
                max,
                index: maxIndex // Return the index of the maximum value
            };
        }
})