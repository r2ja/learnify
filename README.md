# Learnify 🎓

An AI tutoring system that **diagnoses how a student learns**, then conditions
retrieval-grounded generation on that profile. Final-year project, GIK Institute.

The interesting claim here is not "LLM answers questions about a course." It's
that a **learning-style profile inferred from free-text survey answers** is a
useful conditioning signal for tutoring content — and that the gain from
**retrieval + explicit reasoning** is measurable and additive.

## The problem

Course content is authored once and delivered identically to everyone. A student
who learns best from worked examples and a student who learns best from abstract
principles get the same paragraph. Human tutors adapt; static material can't, and
generic LLM tutors don't either — they have no model of the learner.

Learnify builds that model explicitly: a four-dimension
[Felder–Silverman](https://www.engr.ncsu.edu/stem-resources/legacy-site/) profile,
inferred once at signup, then carried into every downstream generation call.

## Architecture

```
Student free-text survey
        │
        ▼
  BERT classifier ──────► 4-D FSLSM profile  (Active/Reflective, Sensing/Intuitive,
  (bert-base-uncased)                         Visual/Verbal, Sequential/Global)
        │
        ▼
  LangGraph supervisor (DAG) ──► Query Processor
                              ├─► Retrieval Agent    → Pinecone top-k, metadata-scoped
                              ├─► Generation Agent   → fine-tuned DeepSeek R1 Distill 8B
                              ├─► Personalization    → injects FSLSM profile into prompt
                              └─► Visualization      → <img_gen> / <mermaid> tool calls
        │
        ▼
  Next.js frontend (SSE streaming, reasoning traces)
```

Two things worth calling out:

- **The supervisor is a DAG, not a chain.** Nodes are selected per-turn, so a
  factual lookup doesn't pay the cost of the image pipeline.
- **Tool calls are inline in the model output** (`<img_gen>…</img_gen>`,
  `<mermaid>…</mermaid>`), parsed out of the stream by the supervisor rather than
  via a function-calling API. That was a deliberate trade for streaming.

## Results

### Learning-style classifier

`bert-base-uncased` fine-tuned on a **custom Felder–Silverman corpus collected
from GIK Institute students** — 1,200 responses, 80/20 split, ~2.7 h on a free-tier
Colab T4.

| Metric | Value |
|---|---|
| **Accuracy** | **91.4%** |
| Precision | 90.1% |
| Recall | 92.6% |
| F1 | 91.3% |

Predicted distribution across the four dimensions — no dimension collapsed to a
single class, which is the failure mode you'd expect from a small corpus:

| Dimension | Option A | Option B |
|---|---|---|
| Input | Sensing 54% | Intuitive 46% |
| Perception | Visual 61% | Verbal 39% |
| Processing | Active 50% | Reflective 50% |
| Understanding | Sequential 55% | Global 45% |

### RAG × chain-of-thought ablation

Generation used **DeepSeek R1 Distill Llama 8B**, QLoRA fine-tuned for 12 h on
Colab Pro (Math-CoT + a filtered AnumAI Kaggle subset). Retrieval was Pinecone
with `all-MiniLM-L6-v2` embeddings. Scored by BLEU (NLTK) plus 3 human reviewers.

| Setting | BLEU | Human (/5) |
|---|---|---|
| No RAG, no CoT | 17.2 | 2.8 |
| CoT only | 21.0 | 3.6 |
| RAG only | 22.4 | 3.9 |
| **RAG + CoT** | **26.5** | **4.4** |

**The two effects are additive, not redundant.** Retrieval buys factual grounding;
chain-of-thought buys logical structure. Neither alone reaches the combination —
+9.3 BLEU over baseline, and the human gap (2.8 → 4.4) is wider than BLEU suggests.

### Image generation

No custom model was trained — this was an API comparison, scored by 5 peer reviewers.

| Tool | Relevance | Clarity | Educational value |
|---|---|---|---|
| **GPT-Image-1** | **4.6** | **4.8** | **4.4** |
| Stable Diffusion (local CPU) | 3.8 | 3.5 | 3.7 |
| Craiyon | 2.8 | 2.0 | 2.5 |

## Repo layout

```
agent/              LangGraph agent — supervisor, tools, LLM + Pinecone clients
frontend/           Next.js + Prisma + Postgres app (SSE streaming chat)
rag/                Corpus ingestion + embedding notebook
data-generation/    FLSMGen — synthetic Felder–Silverman survey generation
notebooks/          Learning-style classifier training + finalized model
docs/               FYP report, provenance
```

## Reproducing

```bash
# 1. Classifier
jupyter notebook notebooks/Finalized_Model.ipynb

# 2. Index a course corpus (bring your own materials — see rag/README.md)
cd agent && pip install -r requirements.txt
python utility/setup_pinecone_index.py

# 3. Agent
cp .env.example .env      # OPENROUTER_API_KEY, PINECONE_API_KEY
python test_agent.py

# 4. Frontend
cd frontend && npm install && npm run dev
```

## Status and limitations

Honest accounting — this is a final-year project, not a deployed product.

**What is real and reproducible:**
- The classifier, its dataset methodology, and its metrics
- The RAG × CoT ablation
- The agent, tools, and streaming supervisor

**What is not:**
- **The corpus is not in this repo.** The original RAG dataset was built from
  copyrighted C++ textbooks; those were removed and are not redistributable.
  `rag/dataset.ipynb` shows the ingestion pipeline — supply your own materials.
- **Fine-tuned weights are not published.** The QLoRA run is described in the
  report but the adapter isn't in the repo.
- **`n=1,200`, single institution.** All FSLSM responses come from GIK Institute
  students. The classifier's 91.4% is on a held-out split of that same
  population — it is **not** evidence of generalization to other cohorts.
- **BLEU is a weak metric for tutoring quality**, and the human panel was 3
  reviewers. Directional, not conclusive.
- **Frontend and agent are not wired end-to-end here.** They were developed as
  separate services; this repo consolidates them but does not ship a compose file.

**One caveat that belongs in any honest write-up of this work:** the
learning-styles hypothesis — that matching instruction to a diagnosed style
improves outcomes — is [contested in the education-research literature](https://doi.org/10.1111/j.1539-6053.2009.01038.x).
This project demonstrates that a style profile can be *inferred* accurately
(91.4%) and *conditioned on*; it does **not** demonstrate improved learning
outcomes, and no claim to that effect is made here. Measuring that would need a
controlled study with learning-gain endpoints, which was out of scope.

## Provenance

Consolidated from nine repositories with git history preserved via `git subtree`.
See [`docs/PROVENANCE.md`](docs/PROVENANCE.md) for the full mapping and the
version-comparison evidence behind which agent implementation was chosen.

Full write-up: [`docs/Learnify-FYP-Report.pdf`](docs/Learnify-FYP-Report.pdf)
