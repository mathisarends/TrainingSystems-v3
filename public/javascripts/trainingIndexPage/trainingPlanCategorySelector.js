document.addEventListener("DOMContentLoaded", () => {
  const tabList = document.querySelector('[role="tablist"]');
  const tabs = tabList.querySelectorAll('[role="tab"]');
  const sections = document.querySelectorAll("section");

  const title = document.querySelector("h1");

  /*TODO: Oben die ÜBerschrift verändern und die active klasse entsprechend setzen ^^*/
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", (e) => {
      e.preventDefault();

      for (let j = 0; j < sections.length; j++) {
        sections[j].setAttribute("hidden", true);
        tabs[j].setAttribute("aria-selected", false);
      }

      sections[i].removeAttribute("hidden");
      tabs[i].setAttribute("aria-selected", true);

      if (i === 0) {
        title.innerHTML = `<span aria-hidden="true">01</span>CUSTOM`;
      } else if (i === 1) {
        title.innerHTML = `<span aria-hidden="true">01</span>SESSION`;
      } else if (i === 2) {
        title.innerHTML = `<span aria-hidden="true">01</span>TEMPLATE`;
      } else if (i === 3) {
        title.innerHTML = `<span aria-hidden="true">01</span>ARCHIVE`;
      }
    });
  }

  //swipe logic
  const allSections = document.querySelectorAll("section");

  allSections.forEach((section, index) => {
    
    section.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    section.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;

      const swipeThreshold = 110;

      if (startX - endX > swipeThreshold) {
          navigateToNextDay();             // Swipe left, navigate to the next day
      } else if (endX - startX > swipeThreshold) {
          navigateToPreviousDay();             // Swipe right, navigate to the previous day
      }
    })

    function navigateToNextDay() {
      const selectedButton = document.querySelector(".tab-list button[aria-selected='true']");
      const nextButton = selectedButton.nextElementSibling || tabs[0];

      if (nextButton) {
          nextButton.click();
      }
  }

  function navigateToPreviousDay() {
      const selectedButton = document.querySelector(".tab-list button[aria-selected='true']");
      const previousButton = selectedButton.previousElementSibling || tabs[tabs.length - 1];

      if (previousButton) {
          previousButton.click();
      }
  }

  })
});
