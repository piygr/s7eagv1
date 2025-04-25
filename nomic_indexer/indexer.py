import faiss
import numpy as np
import json
import os
import time

index_file = "faiss.index"
meta_file = "db.json"
timestamp_file = "timestamp.json"

dimension = 768

if os.path.exists(index_file):
    index = faiss.read_index(index_file)
else:
    index = faiss.IndexFlatL2(dimension)

# Load or initialize last indexed map
if os.path.exists(timestamp_file):
    with open(timestamp_file) as f:
        url_last_indexed = json.load(f)
else:
    url_last_indexed = {}

def was_recently_indexed(url, days=7):
    last_time = url_last_indexed.get(url)
    if not last_time:
        return False
    return (time.time() - last_time) < days * 86400

def update_index_timestamp(url):
    url_last_indexed[url] = time.time()
    with open(timestamp_file, "w") as f:
        json.dump(url_last_indexed, f)

def add_to_index(embedding, url, text):
    index.add(np.array([embedding]).astype("float32"))
    with open(meta_file, "a") as f:
        f.write(json.dumps({"url": url, "text": text}) + "\n")
    faiss.write_index(index, index_file)

    # update last indexed
    url_last_indexed[url] = time.time()
    with open(timestamp_file, "w") as f:
        json.dump(url_last_indexed, f)

def search(query_embedding, top_k=5):
    D, I = index.search(np.array([query_embedding]).astype("float32"), top_k)
    results = []
    with open(meta_file) as f:
        lines = f.readlines()
        for idx in I[0]:
            try:
                results.append(json.loads(lines[idx]))
            except:
                continue
    return results
