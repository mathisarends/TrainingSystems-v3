const storageKey = "theme";

const onclick = () => {
  console.log("hey friend");
  //flip current value
  theme.value = theme.value === "light" ? "dark" : "light";

  setPreference();
};

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  } else {
    return window.matchMedia("(prefers-color-schema: dark)").matches
      ? "dark"
      : "light";
  }
};

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};

const updateManifest = (theme) => {
  const manifestLink = document.getElementById("manifest-theme-link");
  const manifest = {
    ...manifestLink,
    href: theme === "light" ? "/manifest/manifest.webmanifest" : "/manifest/manifest_light.webmanifest"
  }
  Object.keys(manifest).forEach((key) => {
    manifestLink.setAttribute(key, manifest[key]);
  })
}

const reflectPreference = () => {
  document.firstElementChild.setAttribute("data-theme", theme.value);

  if (theme.value === "dark") {
    document.firstElementChild.classList.remove("home-white");
    document.firstElementChild.classList.add("home");
  } else if (theme.value === "light") {
    document.firstElementChild.classList.remove("home");
    document.firstElementChild.classList.add("home-white");
  }

  updateManifest(theme.value);

  document
    .querySelector("#theme-toggle")
    ?.setAttribute("aria-label", theme.value);
};

const theme = {
  value: getColorPreference(),
};

// **New code:**
reflectPreference(); // Update the browser history with the current theme value.
/* history.pushState({ theme: theme.value }, document.title); */

window.onload = () => {
  // set onload so screen readers can see latest value on the button
  reflectPreference();

  // now this script cam ind and listen for clicks on the control

  document
    .querySelector("#theme-toggle")
    ?.addEventListener("click", onclick);

  // sync with system cahnges
  window
    .matchMedia("(prefers-color-schema: dark)")
    .addEventListener("change", ({ matches: isLight }) => {
      theme.value = isLight ? "light" : "dark";
      setPreference();
    });
};