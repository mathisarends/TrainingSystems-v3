document.addEventListener("DOMContentLoaded", () => {

    // showStatsTab.js
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
    
          localStorage.setItem("statsTab", tabs[i].id);
          sections[i].removeAttribute("hidden");
          tabs[i].setAttribute("aria-selected", true);
    
        });
      }
    
    
      /*show right button from start from showStats.js*/ 
      function triggerClick(selectedTab) {
                    const clickEvent = new Event('click', {
                        bubbles: true,
                        cancelable: true,
                    });
                    selectedTab.dispatchEvent(clickEvent);
                }
    
        const lastSelectedTab = localStorage.getItem("statsTab");
        if (lastSelectedTab) {
            const tabToSelect = document.getElementById(lastSelectedTab);
            if (tabToSelect) {
                tabToSelect.setAttribute("aria-selected", true);
                triggerClick(tabToSelect);
            }
        } else {
            tabButtons[0].setAttribute("aria-selected", true);
            triggerClick(tabButtons[0]);
        }

        //logic for swiping
        let startX;
        let endX;

        const totalPage = document.getElementById("main");

        totalPage.addEventListener("touchstart", e => {
          startX = e.touches[0].clientX;
        })

        totalPage.addEventListener("touchend", e => {
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
        
    });