const form = document.querySelector("form");
const searchInput = document.getElementById("Search");
const resultBox = document.getElementById("result");

const myHeaders = new Headers();
myHeaders.append("X-API-KEY", "25eebc1810a1c4c92ad09dd1d5ef7499ca216576");
myHeaders.append("Content-Type", "application/json");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) {
        resultBox.textContent = "Please enter search text.";
        return;
    }

    resultBox.textContent = "Searching...";

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ q: query }),
        redirect: "follow"
    };

    try {
        const response = await fetch("https://google.serper.dev/search", requestOptions);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();
        resultBox.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error(error);
        resultBox.textContent = "Search failed. Check the console for details.";
    }
});
