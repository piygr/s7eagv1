const skipDomains = ["mail.google.com", "web.whatsapp.com", "youtube.com", "docs.google.com", "drive.google.com"];
const currentDomain = window.location.hostname;

/*function chunkText(text, chunkSize = 50, overlap = 10) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 20) chunks.push(chunk);
  }

  return chunks;
}*/

function normalize(text) {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokenize(text) {
  return normalize(text).split(/\s+/);
}

function jaccardScore(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

function highlightBestApproxMatch(targetText, windowSize = 20) {
  const fullText = document.body.innerText;
  const normalizedFullText = normalize(fullText);
  const fullTokens = tokenize(normalizedFullText);
  const targetTokens = tokenize(targetText);

  let bestScore = 0;
  let bestStartIndex = 0;
  for (let i = 0; i <= fullTokens.length - windowSize; i++) {
    const window = fullTokens.slice(i, i + windowSize);
    const score = jaccardScore(window, targetTokens);
    if (score > bestScore) {
      bestScore = score;
      bestStartIndex = i;
    }
  }

  if (bestScore < 0.3) {
    console.warn("No sufficiently close match found.");
    return;
  }

  const anchor = fullTokens.slice(bestStartIndex, bestStartIndex + 5).join(" ");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;

  while ((node = walker.nextNode())) {
    const normalizedNode = normalize(node.nodeValue);
    if (normalizedNode.includes(anchor)) {
      const rawText = node.nodeValue;
      const matchStart = rawText.toLowerCase().indexOf(anchor.split(" ")[0]);
      const before = rawText.slice(0, matchStart);
      const match = rawText.slice(matchStart, matchStart + targetText.length);
      const after = rawText.slice(matchStart + targetText.length);

      const mark = document.createElement("mark");
      mark.textContent = match;
      mark.style.background = "#fffb91";

      const afterNode = node.splitText(matchStart);
      afterNode.nodeValue = after;
      node.parentNode.insertBefore(mark, afterNode);
      mark.scrollIntoView({ behavior: "smooth", block: "center" });

      break;
    }
  }
}



// Main block
if (!skipDomains.some(domain => currentDomain.includes(domain))) {
  chrome.storage.local.get(["highlight_text", "url_indexed_at"], (result) => {
    const url = window.location.href;
    const lastIndexed = result.url_indexed_at?.[url];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    console.log("retrieving highlight_text in local storage");
    console.log(result.highlight_text);
    // Highlight if match found
    if (result.highlight_text) {
      highlightBestApproxMatch(result.highlight_text);
      chrome.storage.local.remove("highlight_text");
    }


    // Index if needed
    if (lastIndexed && lastIndexed > sevenDaysAgo) {
      console.log("Skipping indexing (already indexed recently)");
      return;
    }

    const fullText = document.body.innerText;
    /*const chunks = chunkText(fullText);

    chunks.forEach(chunk => {
      fetch("http://localhost:5005/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          text: chunk
        })
      }).catch(err => console.error("Embedding failed:", err));
    });*/

    fetch("http://localhost:5005/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          text: fullText
        })
    }).catch(err => console.error("Embedding failed:", err));

    // Store index timestamp
    const updated = result.url_indexed_at || {};
    updated[url] = Date.now();
    chrome.storage.local.set({ url_indexed_at: updated });
  });
}
