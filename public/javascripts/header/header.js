document.addEventListener("DOMContentLoaded", () => {
  const primaryNav = document.querySelector(".primary-navigation");
  const navToggle = document.querySelector(".mobile-nav-toggle");
  const showMobileNav = document.querySelectorAll(".mobile-nav-toggle svg")[0]; //inline svg
  const closeMobileNav = document.querySelectorAll(".mobile-nav-toggle svg")[1]; //inline svg

  navToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const visibility = primaryNav.getAttribute("data-visible");

    if (visibility === "false") { //make it visibile if currently not 
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

  //css property is added after the page is loaded to prevent weird backsnapping behaviour
  setTimeout(() => {
    primaryNav.style.transition = "transform 500ms ease-in-out"; 
  }, 100); 
});
