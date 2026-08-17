# data-generation/

**FLSMGen** — synthetic generation of Felder–Silverman learning-style
self-descriptions, used to augment the classifier's training corpus.

| File | What it is |
|---|---|
| `dataset_generation.py` | Generates student-style paragraphs for all 16 FSLSM label combinations via GPT-4-turbo |
| `process_dataset.py` | Cleaning / reshaping into training format |
| `test_generation.py` | Generation smoke tests |

## How it works

The four FSLSM dimensions are binary, giving **16 label combinations**
(Active/Reflective × Sensing/Intuitive × Visual/Verbal × Sequential/Global).
For each combination the generator prompts for a casual 60–90 word paragraph
written as a student would describe their own learning, explicitly instructed
*not* to list the preferences — so the label stays implicit in the prose rather
than lexically leaked.

At `TOTAL_SAMPLES_PER_COMBO = 50` that's **800 synthetic samples**, balanced by
construction across all 16 classes.

## Synthetic vs. collected data

Be precise about which corpus is which:

- **This directory produces synthetic data** — LLM-authored, balanced, 800 samples.
- **The FYP report describes 1,200 responses collected from GIK Institute students**
  via a Felder–Silverman survey, split 960/240 for the reported 91.4% accuracy.

These are two different corpora. The source repos do not record which mixture the
finalized classifier was trained on, so no claim is made here about the balance.
If you are reproducing the result, treat `notebooks/Finalized_Model.ipynb` as the
authority on what was actually fed in.

**Why synthetic augmentation is a real risk here:** a classifier trained partly on
GPT-4-authored descriptions of a label can learn the generator's phrasing habits
rather than genuine signal, which inflates held-out accuracy if the test split
shares that provenance. Class balance by construction has the same effect. Worth
stating plainly rather than folding into a single headline number.
