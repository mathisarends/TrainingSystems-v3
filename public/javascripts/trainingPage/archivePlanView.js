    //makes everything readonly
    document.addEventListener("DOMContentLoaded", () => {
        const inputElements = document.querySelectorAll("input");
        const selectElements = document.querySelectorAll("select");
        const allElements = Array.from(inputElements).concat(Array.from(selectElements));

        allElements.forEach(element => {
            element.setAttribute("readonly", true);
        });

        const backToIndexButtons = document.querySelectorAll(".back-to-main-button");
        backToIndexButtons.forEach((button, index) => {
            button.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = "/training";
            })
        })
    })