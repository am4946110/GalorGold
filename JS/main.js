const form = document.getElementById("searchForm");
const searchInput = document.getElementById("Search");
const resultBox = document.getElementById("result");

if (!form || !searchInput || !resultBox) {
    throw new Error("Missing search app elements.");
}

const myHeaders = new Headers();
myHeaders.append("X-API-KEY", "25eebc1810a1c4c92ad09dd1d5ef7499ca216576");
myHeaders.append("Content-Type", "application/json");

function clearResults() {
    resultBox.innerHTML = "";
}

function showMessage(message) {
    clearResults();
    const paragraph = document.createElement("p");
    paragraph.className = "result-message";
    paragraph.textContent = message;
    resultBox.appendChild(paragraph);
}

function createExternalLink(href, text, className) {
    const link = document.createElement("a");
    link.href = href || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text || href || "Open result";

    if (className) {
        link.className = className;
    }

    return link;
}

function renderKnowledgeGraph(knowledgeGraph) {
    if (!knowledgeGraph) {
        return;
    }

    const card = document.createElement("article");
    card.className = "knowledge-card";

    const title = document.createElement("h2");
    title.textContent = knowledgeGraph.title || "Overview";

    const type = document.createElement("p");
    type.className = "knowledge-type";
    type.textContent = knowledgeGraph.type || "";

    const description = document.createElement("p");
    description.className = "knowledge-description";
    description.textContent = knowledgeGraph.description || "";

    card.append(title);

    if (type.textContent) {
        card.appendChild(type);
    }

    if (description.textContent) {
        card.appendChild(description);
    }

    if (knowledgeGraph.descriptionLink) {
        card.appendChild(
            createExternalLink(
                knowledgeGraph.descriptionLink,
                knowledgeGraph.descriptionSource || "Read more",
                "source-link"
            )
        );
    }

    if (knowledgeGraph.attributes) {
        const list = document.createElement("dl");
        list.className = "attribute-list";

        Object.entries(knowledgeGraph.attributes).forEach(([name, value]) => {
            const term = document.createElement("dt");
            term.textContent = name;

            const detail = document.createElement("dd");
            detail.textContent = value;

            list.append(term, detail);
        });

        card.appendChild(list);
    }

    resultBox.appendChild(card);
}

function renderOrganicResults(results) {
    if (!results || results.length === 0) {
        return;
    }

    const group = document.createElement("section");
    group.className = "result-group";

    const heading = document.createElement("h2");
    heading.textContent = "Web results";
    group.appendChild(heading);

    results.forEach((item) => {
        const article = document.createElement("article");
        article.className = "result-item";

        const title = createExternalLink(item.link, item.title || "Untitled result", "result-title");

        const link = document.createElement("p");
        link.className = "result-link";
        link.textContent = item.link || "";

        const snippet = document.createElement("p");
        snippet.className = "result-snippet";
        snippet.textContent = item.snippet || "No description available.";

        article.append(title, link, snippet);

        if (item.sitelinks && item.sitelinks.length > 0) {
            const sitelinks = document.createElement("div");
            sitelinks.className = "sitelinks";

            item.sitelinks.forEach((site) => {
                sitelinks.appendChild(createExternalLink(site.link, site.title, "sitelink"));
            });

            article.appendChild(sitelinks);
        }

        group.appendChild(article);
    });

    resultBox.appendChild(group);
}

function renderPeopleAlsoAsk(questions) {
    if (!questions || questions.length === 0) {
        return;
    }

    const group = document.createElement("section");
    group.className = "result-group";

    const heading = document.createElement("h2");
    heading.textContent = "People also ask";
    group.appendChild(heading);

    questions.forEach((item) => {
        const article = document.createElement("article");
        article.className = "question-item";

        const question = document.createElement("h3");
        question.textContent = item.question || "Question";

        const snippet = document.createElement("p");
        snippet.textContent = item.snippet || "";

        article.append(question, snippet);

        if (item.link) {
            article.appendChild(createExternalLink(item.link, item.title || "Source", "source-link"));
        }

        group.appendChild(article);
    });

    resultBox.appendChild(group);
}

function renderRelatedSearches(searches) {
    if (!searches || searches.length === 0) {
        return;
    }

    const group = document.createElement("section");
    group.className = "result-group";

    const heading = document.createElement("h2");
    heading.textContent = "Related searches";

    const chips = document.createElement("div");
    chips.className = "related-searches";

    searches.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "related-search";
        button.textContent = item.query;
        button.addEventListener("click", () => {
            searchInput.value = item.query;
            form.requestSubmit();
        });

        chips.appendChild(button);
    });

    group.append(heading, chips);
    resultBox.appendChild(group);
}

function renderSearchResults(data)
{
    clearResults();

    if (!data || (!data.knowledgeGraph && (!data.organic || data.organic.length === 0))) {
        showMessage("No results found.");
        return;
    }

    renderKnowledgeGraph(data.knowledgeGraph);
    renderOrganicResults(data.organic);
    renderPeopleAlsoAsk(data.peopleAlsoAsk);
    renderRelatedSearches(data.relatedSearches);
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
        const response = await fetch("https://google.serper.dev/search", requestOptions);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();
        renderSearchResults(result);
    } catch (error) {
        console.error(error);
        showMessage("Search failed. Check the console for details.");
    }
});
