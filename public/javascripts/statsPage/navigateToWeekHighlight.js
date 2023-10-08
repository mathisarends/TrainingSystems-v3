document.addEventListener("DOMContentLoaded", () => {
  const allBestSetContainers = document.querySelectorAll(
    ".alternative-stats-container"
  );

  const squatPerformanceStatsCards =
    allBestSetContainers[0].querySelectorAll(".stats-container");
  const benchPerformanceStatsCards =
    allBestSetContainers[1].querySelectorAll(".stats-container");
  const deadliftPerformanceStatsCards =
    allBestSetContainers[2].querySelectorAll(".stats-container");

  // Variablen zur Verfolgung des zuletzt ausgewählten Index für jede Kategorie
  let lastSelectedSquatIndex = 0;
  let lastSelectedBenchIndex = 0;
  let lastSelectedDeadliftIndex = 0;

  const pathName = window.location.pathname;
  const trainingType = pathName.substring(0, pathName.lastIndexOf("-"));

  const selectedBorderStyle = "4px solid rgba(255, 255, 255, 0.85)";

  function updateSelectedCard(cards, selectedIndex) {
    // Setze alle Karten auf den ursprünglichen Zustand
    cards.forEach((card, index) => {
      if (index === selectedIndex) {
        card.style.border = selectedBorderStyle;
      } else {
        card.style.border = "none";
      }
    });
  }

  function addClickEventListener(
    cards,
    trainingType,
    lastSelectedIndex,
    category
  ) {
    cards.forEach((statsCard, index) => {
      statsCard.addEventListener("click", () => {
        const computedStyle = window.getComputedStyle(statsCard);

        if (computedStyle.border === selectedBorderStyle) {
          const dayIndex = statsCard.querySelector(
            "input[type='hidden']"
          ).value;
          window.location.href = `${trainingType}${index + 1}#${dayIndex}`;
        }

        // Setze alle Karten auf den ursprünglichen Zustand für diese Kategorie
        updateSelectedCard(cards, index);

        // Aktualisiere den zuletzt ausgewählten Index für diese Kategorie
        if (category === "Squat") {
          lastSelectedSquatIndex = index;
        } else if (category === "Bench") {
          lastSelectedBenchIndex = index;
        } else if (category === "Deadlift") {
          lastSelectedDeadliftIndex = index;
        }
      });
    });
  }

  // Füge Event-Listener für jede Kategorie hinzu
  addClickEventListener(
    squatPerformanceStatsCards,
    trainingType,
    lastSelectedSquatIndex,
    "Squat"
  );
  addClickEventListener(
    benchPerformanceStatsCards,
    trainingType,
    lastSelectedBenchIndex,
    "Bench"
  );
  addClickEventListener(
    deadliftPerformanceStatsCards,
    trainingType,
    lastSelectedDeadliftIndex,
    "Deadlift"
  );
});
