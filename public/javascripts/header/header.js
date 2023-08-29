document.addEventListener("DOMContentLoaded", () => {
  const primaryNav = document.querySelector(".primary-navigation");
  const navToggle = document.querySelector(".mobile-nav-toggle");
  const showMobileNav = document.querySelectorAll(".mobile-nav-toggle svg")[0];
  const closeMobileNav = document.querySelectorAll(".mobile-nav-toggle svg")[1];

  navToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const visibility = primaryNav.getAttribute("data-visible");

    if (visibility === "false") {
      primaryNav.setAttribute("data-visible", true);
      navToggle.setAttribute("aria-expanded", true);

      showMobileNav.style.display = "none";
      closeMobileNav.style.display = "block";
    } else if (visibility === "true") {
      primaryNav.setAttribute("data-visible", false);
      navToggle.setAttribute("aria-expanded", false);

      showMobileNav.style.display = "block";
      closeMobileNav.style.display = "none";
    }
  });

  const navOptions = primaryNav.querySelectorAll("li");
  const currentPath = window.location.pathname;

  if (currentPath === "/") {
    navOptions[0].classList.add("active");
  } else if (currentPath.startsWith("/training")) {
    navOptions[1].classList.add("active");
  } else if (currentPath === "/tools/volume") {
    navOptions[2].classList.add("active");
  } else if (currentPath === "/exercises") {
    navOptions[3].classList.add("active");
  }
});
