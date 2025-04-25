# 🔍 Smart History – AI-Powered Chrome History Search

Smart History is a local-first Chrome extension that lets you **search your web browsing history by content**, not just URLs or titles. It captures the **actual text** of visited pages (excluding private ones), generates semantic embeddings using AI, and allows you to search and highlight results directly on the original page — all while running privately on your own machine. [Plugin Demo](https://youtu.be/zYwhe-P0C48)

---

## ✨ Features

- ✅ Automatically extracts and indexes visited page content (excludes Gmail, Docs, YouTube, etc.)
- 🧠 Embeds content into vector space using local [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
- 📚 Searches using FAISS and semantic similarity
- 🔦 Reopens matched pages and highlights relevant snippets
- 🔁 Skips re-indexing pages already visited in the past 7 days (unless forced)
- 🔍 Beautiful popup UI with loading spinners, "no results" feedback, and last-visited timestamps

---

## 🛠 How It Works

1. **Chrome extension** extracts text from each webpage and sends it to a local Flask backend.
2. **Backend** chunks the text (50 words, 10-word overlap), embeds each chunk, and indexes with FAISS.
3. **Search** from the popup UI: query is embedded, matched against FAISS, results are shown.
4. **Clicking a result** opens the matching URL and highlights the content using approximate match + scroll.

---

## 📦 Tech Stack

- 🔗 Chrome Extension (Manifest v3)
- 🐍 Python + Flask backend
- 🤖 [nomic-embed-text-v1](https://huggingface.co/nomic-ai/nomic-embed-text-v1) (via `sentence-transformers`)
- 🧠 FAISS for vector search
- 🧩 Local `chrome.storage.local` for timestamp caching
- 🎨 Vanilla JS + CSS for modern UI

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/piygr/s7eagv1.git
cd s7eagv1
```

## Setup the backed

```
pip install -r requirements.txt
python server.py
```

## Load the Chrome extension

- Go to chrome://extensions/
- Enable Developer Mode
- Click Load unpacked
- Select the chrome-extension/ folder inside this repo
