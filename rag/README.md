# rag/

Corpus ingestion for the retrieval layer: PDF → chunks → embeddings → Pinecone.

| File | What it is |
|---|---|
| `dataset.ipynb` | Ingestion pipeline — PDF parsing, chunking, embedding, upsert, and index verification |

**Pipeline.** Course materials are parsed (PyMuPDF for PDFs, Pytesseract for
scanned/handwritten input), chunked, embedded with
`sentence-transformers/all-MiniLM-L6-v2`, and upserted into a Pinecone index with
metadata tags for `chapter`, `course_id`, and `difficulty`. At query time the
top-k most similar passages are retrieved and templated into the prompt with an
explicit grounding instruction.

**Runtime retrieval lives elsewhere.** This directory covers *building* the index.
The client used at inference is
[`agent/utility/pinecone_client.py`](../agent/utility/pinecone_client.py), and
index setup is scripted at `agent/utility/setup_pinecone_index.py`.

## The corpus is not included

The original index was built from commercial C++ textbooks. Those files — and an
`embeddings_progress.json` that stored verbatim extracted book text — were removed
from this repo's history because they are copyrighted and not redistributable.

Supply your own materials and point `setup_pinecone_index.py` at them. The
notebook documents the shape the pipeline expects.

Measured contribution of retrieval: **+5.2 BLEU over no-RAG baseline, and +4.1
when stacked on chain-of-thought** — see the ablation in the
[top-level README](../README.md#rag--chain-of-thought-ablation).
