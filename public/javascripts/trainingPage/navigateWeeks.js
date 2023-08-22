/* document.addEventListener("DOMContentLoaded", () => {
    console.log("gelande")

    const navigateButtons = document.getElementsByClassName("navigate-btn");
    const navigatePages = document.querySelectorAll(".navigate-week-button-container input[type='hidden']");

     console.log(navigatePages[0].value);

     navigateButtons[0].addEventListener("click", e => {
        e.preventDefault();
        console.log("kklick");
        const beforePageValue = navigatePages[0].value;
        window.location.href = `http://localhost:3000${beforePageValue}`;
    });


    for (let i = 0; i < navigateButtons.length; i++) {
        navigateButtons[i].addEventListener("click", e => {
            e.preventDefault();
            const beforePageValue = navigatePages[i].value;
            window.location.href = `http://localhost:3000${beforePageValue}`;
        })
    }

}) */