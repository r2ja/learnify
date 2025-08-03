import os
import pandas as pd
import random
import time
from openai import OpenAI
from dotenv import load_dotenv

# Load your OpenAI API key from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# All 16 label combinations
label_combinations = [
    (ar, si, vv, sg)
    for ar in ["Active", "Reflective"]
    for si in ["Sensing", "Intuitive"]
    for vv in ["Visual", "Verbal"]
    for sg in ["Sequential", "Global"]
]

# Randomly pick 5 unique combinations
test_combinations = random.sample(label_combinations, 5)

def generate_learning_description(ar, si, vv, sg):
    prompt = f"""
Based on the following learning style preferences, write a casual, student-like paragraph (60–90 words) describing how they learn best.

- Active/Reflective: {ar}
- Sensing/Intuitive: {si}
- Visual/Verbal: {vv}
- Sequential/Global: {sg}

Make it sound natural and like something a student would write. Avoid listing the preferences; describe them in an informal, flowing way.
"""
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
        print(f"Error generating description: {e}")
        return "I'm still figuring out how I learn best, but I think it depends on what I'm studying."

def generate_test_dataset():
    print("🧪 Generating 5 test samples...")
    data = []

    for combo in test_combinations:
        ar, si, vv, sg = combo
        print(f"→ Combo: {ar}, {si}, {vv}, {sg}")
        text = generate_learning_description(ar, si, vv, sg)
        data.append({
            "text_input": text,
            "AR_label": ar,
            "SI_label": si,
            "VV_label": vv,
            "SG_label": sg
        })
        time.sleep(0.5)  # Avoid rate limit

    df = pd.DataFrame(data)
    df.to_csv("test_balanced_learning_dataset_5.csv", index=False)
    print("✅ Test dataset saved as 'test_balanced_learning_dataset_5.csv'")

if __name__ == "__main__":
    generate_test_dataset()
