import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set up OpenAI API
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_learning_style_text(ar_pref, si_pref, vv_pref, sg_pref):
    """
    Generate synthetic text describing learning style based on preferences
    """
    prompt = f"""Based on these learning style preferences, write a casual, student-like description of how someone with these preferences learns:

Active/Reflective: {ar_pref}
Sensing/Intuitive: {si_pref}
Visual/Verbal: {vv_pref}
Sequential/Global: {sg_pref}

Write a natural, conversational description like a student would write about their learning preferences. Keep it under 100 words and make it sound authentic."""

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates natural, student-like descriptions of learning preferences."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating text: {e}")
        return "I prefer learning in my own way based on my style preferences."

def create_binary_labels(row):
    """
    Create binary labels based on preference values
    Handle 'Moderate' values by assigning them to the more common category
    """
    labels = {}
    
    # AR_label: Active if 'AR_pref' == 'High', Reflective if 'Low' or 'Moderate'
    # Based on distribution: Low (464) > Moderate (212) > High (46)
    if row['AR_pref'] == 'High':
        labels['AR_label'] = 'Active'
    else:  # 'Low' or 'Moderate' -> Reflective (more common)
        labels['AR_label'] = 'Reflective'
    
    # SI_label: Sensing if 'SI_pref' == 'High', Intuitive if 'Low' or 'Moderate'
    # Based on distribution: Low (340) > Moderate (311) > High (71)
    if row['SI_pref'] == 'High':
        labels['SI_label'] = 'Sensing'
    else:  # 'Low' or 'Moderate' -> Intuitive (more common)
        labels['SI_label'] = 'Intuitive'
    
    # VV_label: Visual if 'VV_pref' == 'High', Verbal if 'Low' or 'Moderate'
    # Based on distribution: Low (317) > Moderate (280) > High (125)
    if row['VV_pref'] == 'High':
        labels['VV_label'] = 'Visual'
    else:  # 'Low' or 'Moderate' -> Verbal (more common)
        labels['VV_label'] = 'Verbal'
    
    # SG_label: Sequential if 'SG_pref' == 'High', Global if 'Low' or 'Moderate'
    # Based on distribution: Low (501) > Moderate (189) > High (32)
    if row['SG_pref'] == 'High':
        labels['SG_label'] = 'Sequential'
    else:  # 'Low' or 'Moderate' -> Global (more common)
        labels['SG_label'] = 'Global'
    
    return pd.Series(labels)

def main():
    # Load the CSV file
    print("Loading dataset...")
    df = pd.read_csv('dataset/data_ils733_v2_ML3.csv')
    print(f"Loaded {len(df)} rows")
    
    # Check for required columns
    required_columns = ['AR_pref', 'SI_pref', 'VV_pref', 'SG_pref']
    for col in required_columns:
        if col not in df.columns:
            print(f"Error: Required column '{col}' not found in dataset")
            return
    
    # No longer filtering out 'Moderate' values - we'll handle them in create_binary_labels
    print("Processing all rows (including 'Moderate' values)...")
    df_filtered = df.copy()
    print(f"Processing {len(df_filtered)} rows")
    
    # Generate synthetic text for each row
    print("Generating synthetic text using OpenAI API...")
    text_inputs = []
    
    for idx, row in df_filtered.iterrows():
        print(f"Processing row {idx + 1}/{len(df_filtered)}")
        text = generate_learning_style_text(
            row['AR_pref'], 
            row['SI_pref'], 
            row['VV_pref'], 
            row['SG_pref']
        )
        text_inputs.append(text)
    
    # Add text_input column
    df_filtered['text_input'] = text_inputs
    
    # Create binary labels
    print("Creating binary labels...")
    labels_df = df_filtered.apply(create_binary_labels, axis=1)
    
    # Combine the data
    result_df = pd.DataFrame({
        'text_input': df_filtered['text_input'],
        'AR_label': labels_df['AR_label'],
        'SI_label': labels_df['SI_label'],
        'VV_label': labels_df['VV_label'],
        'SG_label': labels_df['SG_label']
    })
    
    # Save the cleaned dataset
    print("Saving cleaned dataset...")
    result_df.to_csv('cleaned_ils_dataset.csv', index=False)
    print(f"Saved {len(result_df)} rows to 'cleaned_ils_dataset.csv'")
    
    # Print summary
    print("\nDataset Summary:")
    print(f"Total rows processed: {len(result_df)}")
    print("\nLabel distributions:")
    for col in ['AR_label', 'SI_label', 'VV_label', 'SG_label']:
        print(f"{col}:")
        print(result_df[col].value_counts())
        print()

if __name__ == "__main__":
    main() 