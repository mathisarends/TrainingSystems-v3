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
    
    
    
    });