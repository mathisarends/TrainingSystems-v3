document.addEventListener("DOMContentLoaded", () => {
  //fatiqueLevelSelector.js - momentan nicht eingebunden wegen beta
  const fatiqueLevelSelectors = document.querySelectorAll(
    ".fatiqueLevelSelector"
  );
  fatiqueLevelSelectors.forEach((selector) => {
    selector.addEventListener("blur", () => {
      selector.style.display = "none";
    });
    selector.addEventListener("change", () => {
      selector.style.display = "none";
    });
  });

  function hideSelectors() {
    fatiqueLevelSelectors.forEach((selector) => {
      selector.style.display = "none";
    });
  }

  setTimeout(hideSelectors, 60000); // hide fatique selectors after one minute on the page
});
