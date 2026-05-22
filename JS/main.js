const form = document.querySelector("form");
const searchInput = document.getElementById("Search");
const resultBox = document.getElementById("result");

const myHeaders = new Headers();
myHeaders.append("X-API-KEY", "25eebc1810a1c4c92ad09dd1d5ef7499ca216576");
myHeaders.append("Content-Type", "application/json");

function showMessage(message) {
    resultBox.innerHTML = "";
    resultBox.textContent = message;
}

function showResults(data) {
    resultBox.innerHTML = "";

    const results = data.organic || [];
    if (results.length === 0) {
        showMessage("No results found.");
        return;
    }

    results.forEach((item) => {
        const article = document.createElement("article");
        article.className = "result-item";

        const title = document.createElement("a");
        title.href = item.link;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
        title.textContent = item.title || "Untitled result";

        const link = document.createElement("p");
        link.className = "result-link";
        link.textContent = item.link || "";

        const snippet = document.createElement("p");
        snippet.className = "result-snippet";
        snippet.textContent = item.snippet || "No description available.";

        article.append(title, link, snippet);
        resultBox.appendChild(article);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) {
        showMessage("Please enter search text.");
        return;
    }

    showMessage("Searching...");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ q: query }),
        redirect: "follow"
    };

    try {
        const response = await fetch("https://google.serper.dev/news", requestOptions);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();
        showResults(result);
    } catch (error) {
        console.error(error);
        showMessage("Search failed. Check the console for details.");
    }
});
