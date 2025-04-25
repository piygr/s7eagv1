document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  const resultContainer = document.getElementById("results");
  const spinner = document.getElementById("spinner");

  input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const q = input.value.trim();
    if (!q) return;

    resultContainer.innerHTML = "";
    spinner.style.display = "flex";

    try {
      const res = await fetch("http://localhost:5005/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });

      const results = await res.json();
      spinner.style.display = "none";

      chrome.storage.local.get("url_indexed_at", (store) => {
        if (!results || results.length === 0) {
          const msg = document.createElement("div");
          msg.className = "no-results";
          msg.textContent = "😕 No results found.";
          resultContainer.appendChild(msg);
          return;
        }

        results.forEach(r => {
          const lastVisit = store.url_indexed_at?.[r.url];
          const daysAgo = lastVisit ? Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24)) : null;

          const card = document.createElement("div");
          card.className = "card";

          const link = document.createElement("a");
          link.href = r.url;
          link.textContent = r.url;
          link.target = "_blank";
          link.addEventListener("click", () => {
            chrome.storage.local.set({ highlight_text: r.text });
          });

          const snippet = document.createElement("p");
          snippet.textContent = r.text.slice(0, 160) + "...";

          const meta = document.createElement("div");
          meta.className = "meta";
          meta.textContent = daysAgo !== null ? `Last visited: ${daysAgo === 0 ? "today" : `${daysAgo} day(s) ago`}` : "Never visited";

          card.appendChild(link);
          card.appendChild(snippet);
          card.appendChild(meta);
          resultContainer.appendChild(card);
        });
      });
    } catch (err) {
      console.error("Search failed:", err);
      spinner.style.display = "none";
    }
  });
});
