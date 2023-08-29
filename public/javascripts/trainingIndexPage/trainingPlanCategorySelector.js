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
      }
    });
  }
});
