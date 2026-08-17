import os
import time
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables (API key)
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# All 16 combinations
label_combinations = [
    (ar, si, vv, sg)
    for ar in ["Active", "Reflective"]
    for si in ["Sensing", "Intuitive"]
    for vv in ["Visual", "Verbal"]
    for sg in ["Sequential", "Global"]
]

# Constants
TOTAL_SAMPLES_PER_COMBO = 50
MAX_RETRIES = 3
SLEEP_BETWEEN_CALLS = 0.6

def generate_learning_description(ar, si, vv, sg):
    prompt = f"""
Based on the following learning style preferences, write a casual, student-like paragraph (60–90 words) describing how they learn best.

- Active/Reflective: {ar}
- Sensing/Intuitive: {si}
- Visual/Verbal: {vv}
- Sequential/Global: {sg}

Make it sound natural and like something a student would write. Avoid listing the preferences; describe them in an informal, flowing way.
"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates student-like learning style reflections."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Retry {attempt}/{MAX_RETRIES}] Error: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(2)  # wait before retrying
            else:
                return "I'm still figuring out how I learn best, but I think it depends on what I'm studying."

def generate_dataset():
    dataset = []

    print(f"🚀 Generating {TOTAL_SAMPLES_PER_COMBO * 16} samples...")
    for combo_index, (ar, si, vv, sg) in enumerate(label_combinations):
        print(f"\n📦 Combo {combo_index + 1}/16 → {ar}, {si}, {vv}, {sg}")
        for sample_index in range(TOTAL_SAMPLES_PER_COMBO):
            print(f"  ⏳ Sample {sample_index + 1}/{TOTAL_SAMPLES_PER_COMBO}...", end=" ")
            text = generate_learning_description(ar, si, vv, sg)
            dataset.append({
                "text_input": text,
                "AR_label": ar,
                "SI_label": si,
                "VV_label": vv,
                "SG_label": sg
            })
            print("✅")
            time.sleep(SLEEP_BETWEEN_CALLS)

    df = pd.DataFrame(dataset)
    output_file = "balanced_learning_dataset_800.csv"
    df.to_csv(output_file, index=False)
    print(f"\n✅ Dataset complete! Saved to '{output_file}' with {len(df)} rows.")

if __name__ == "__main__":
    generate_dataset()
