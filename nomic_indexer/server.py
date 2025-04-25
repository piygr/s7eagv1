from flask import Flask, request, jsonify
from flask_cors import CORS
from embedder import embed_texts
from indexer import add_to_index, search, was_recently_indexed, update_index_timestamp, url_last_indexed
from utils import chunk_text

app = Flask(__name__)
CORS(app)

@app.route("/embed", methods=["POST"])
def embed_route():
    data = request.json
    url = data["url"]
    full_text = data["text"]
    force = data.get("force", False)

    index_status = "indexed"

    if not force:
        if was_recently_indexed(url):
            return jsonify({"status": "skipped", "reason": "recently indexed"})
        elif url in url_last_indexed:
            index_status = "reindexed"

    chunks = chunk_text(full_text)
    for chunk in chunks:
        embedding = embed_texts([chunk])[0]
        add_to_index(embedding, url, chunk)

    update_index_timestamp(url)
    return jsonify({"status": index_status, "chunks": len(chunks)})


@app.route("/search", methods=["POST"])
def search_route():
    query = request.json["query"]
    embedding = embed_texts([query])[0]
    results = search(embedding)
    return jsonify(results)

app.run(port=5005)
