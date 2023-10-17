document.addEventListener("DOMContentLoaded", () => {



    // function to set a given theme/color-scheme
    function setTheme(themeName) {
        localStorage.setItem("theme", themeName); //erst nach der patch request
        document.documentElement.className = themeName; //changes the class of the html-element and overwrites css variables
        adjustBackground(themeName);
    }

    // function to toggle between light and dark theme
    function toggleTheme() {
        if (localStorage.getItem('theme') === 'theme-dark') {
            setTheme('theme-light');
        } else {
            setTheme('theme-dark');
        }
    }

    function adjustBackground(themeName) {
        const body = document.body;

        if (themeName === 'theme-dark') {
            //home-alt nur für bestimmte urls adden
            body.classList.remove('home-white', /* 'home-alt-white' */);
        } else {
            body.classList.add('home-white', /* 'home-alt-white' */);
        }

    }

    // Immediately invoked function to set the theme on initial load
    (function () {
        if (localStorage.getItem('theme') === 'theme-dark') {
            setTheme('theme-dark');
        } else {
            setTheme('theme-light');
        }
    })();

    const themeSwitcher = document.getElementById("light-mode-switcher");
    console.log(themeSwitcher);
    themeSwitcher.addEventListener("click", toggleTheme);

    // mit dem system synchronisieren


})