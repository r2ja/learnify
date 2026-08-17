# Provenance

This repo consolidates nine source repositories. Where a source mapped cleanly to
one directory, history was preserved with `git subtree`. Where content had to be
extracted out of a monorepo, `git filter-repo` was used to carry that
subdirectory's history across.

## Mapping

| Directory | Source repo | History | Method |
|---|---|---|---|
| `agent/` | `Learnify-Agent-0.85` | preserved | `git subtree add` |
| `frontend/` | `learnify-frontend` | preserved (36 commits) | `git subtree add` |
| `data-generation/` | `FLSMGen` | preserved | `git subtree add` |
| `notebooks/` | `Learnify` → `LSC/` | preserved | `filter-repo` extract → `subtree` |
| `rag/` | `Learnify` → `RAG-Dataset/` | preserved | `filter-repo` extract → `subtree` |
| `docs/` | — | new | authored here |

## Which agent implementation was chosen, and why

Four repos claimed to be "the agent." They were compared on evidence rather than
on name or assumption:

| | `agent-v0.76` | `agent-v076` | `learnify-agent` | **`Learnify-Agent-0.85`** |
|---|---|---|---|---|
| Last commit | — | 2025-04-23 | 2025-04-25 | **2025-05-22** |
| Commits | **0** | 2 | 1 | 3 |
| Structure | empty | `src/` — 5 agents, UI, `schema.sql` | `agent/` + `docs/` | `agent/` + `tests/` |
| Streaming + reasoning | — | no | partial | **yes** |
| README | — | 2 lines | moderate | **171 lines** |

**`Learnify-Agent-0.85` was selected** — newest by roughly a month, self-identifies
as the later version, and the only one with streaming, reasoning traces, and an
organised test suite.

It was **not a clean superset**, so three items were grafted back from
`learnify-agent`, which would otherwise have been lost:

1. `agent/tools/quiz_gen.py` — the modular quiz tool (0.85 kept only a root-level
   test script)
2. `docs/AGENT_TOOLS.md` and `docs/API_INTEGRATION.md`
3. `LICENSE`

## Sources not merged

- **`agent-v0.76`** — empty repository, 0 commits. Dropped.
- **`agent-v076`** — an earlier, wider prototype (multimodal agent, supervisor
  graph, Streamlit UI) on an incompatible `src/` layout that the later line moved
  away from. Retained upstream as reference rather than merged.
- **`EduApp` / `EduAppPOC_RAG`** — despite sitting alongside the Learnify repos,
  these are a **different project**: an AQA Physics assistant and an exam
  question-paper/mark-scheme scraper. Neither concerns learning styles. Excluded
  deliberately.

## Content removed

The original `Learnify` repo carried two commercial C++ textbooks under
`RAG-Dataset/cs101-pdfs/` (~30 MB), plus `embeddings_progress.json`, which stored
**verbatim extracted book text** in ~11 KB chunks rather than vectors alone. All
three were purged from history — they are copyrighted and not redistributable.
`rag/dataset.ipynb` retains the ingestion pipeline; the corpus itself must be
supplied by the user.

## Source repositories

All under [`github.com/r2ja`](https://github.com/r2ja): `Learnify`,
`learnify-agent`, `Learnify-Agent-0.85`, `learnify-frontend`, `agent-v076`,
`agent-v0.76`, `FLSMGen`. Source repos were **not** deleted.
