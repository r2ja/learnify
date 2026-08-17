# notebooks/

Training and evaluation for the **learning-style classifier** — the component
behind the 91.4% figure in the top-level README.

| File | What it is |
|---|---|
| `Finalized_Model.ipynb` | End-to-end training run: data load, tokenization, `bert-base-uncased` fine-tune, confusion matrices per FSLSM dimension |
| `model.py` | Extracted model/label-encoder code — `LabelEncoder`s for question, style, and disability fields |

**Task.** Four independent binary classifications over the Felder–Silverman
dimensions (Active/Reflective, Sensing/Intuitive, Visual/Verbal,
Sequential/Global) from a student's free-text survey answers.

**Data.** 1,200 responses collected from GIK Institute students, 960 train / 240
test. The corpus is not included here.

**Training.** ~2.7 h on a free-tier Colab T4 (HuggingFace Transformers, PyTorch,
scikit-learn, Unsloth).

Results and the caveat about single-institution sampling are in the
[top-level README](../README.md#status-and-limitations).
