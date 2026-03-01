"""
Integrated Medical Diagnostic System
Connects NLP symptom detection with Bayesian prediction engine
"""

import json
import pandas as pd
import re
from main_engine import run_engine


class SimpleNLPEngine:
    """Simple NLP engine that extracts symptoms from user input based on dataset"""
    
    def __init__(self, dataset_path):
        # Load all valid symptoms from dataset
        df = pd.read_csv(dataset_path)
        self.valid_symptoms = set(df['trigger_symptom'].str.lower().unique())
        
        # Red flag keywords
        self.red_flag_keywords = {
            'chest pain', 'crushing', 'radiating', 'severe', 'sudden', 
            'breathlessness', 'shortness of breath', 'difficulty breathing',
            'seizure', 'fainting', 'syncope', 'blood', 'bleeding'
        }
    
    def extract_symptoms(self, text):
        """Extract symptoms from user text"""
        text_lower = text.lower()
        found_symptoms = []
        negated_symptoms = []
        
        # Check for negations
        neg_patterns = [r'\bno\s+', r'\bnot\s+', r'\bwithout\s+', r'\bno\b']
        
        for symptom in self.valid_symptoms:
            # Check if symptom is in text
            if symptom in text_lower:
                # Check if it's negated
                is_negated = False
                for neg_pattern in neg_patterns:
                    if re.search(neg_pattern + re.escape(symptom), text_lower):
                        is_negated = True
                        negated_symptoms.append(symptom)
                        break
                
                if not is_negated:
                    found_symptoms.append(symptom)
        
        return found_symptoms, negated_symptoms
    
    def detect_red_flags(self, text):
        """Detect red flag symptoms"""
        text_lower = text.lower()
        flags = []
        
        for flag in self.red_flag_keywords:
            if flag in text_lower:
                flags.append(flag)
        
        return flags
    
    def assess_triage(self, symptoms, red_flags):
        """Simple triage assessment"""
        if len(red_flags) > 0:
            return "High"
        elif len(symptoms) >= 3:
            return "Moderate"
        else:
            return "Low"


def run_integrated_system(user_input_text, dataset_path="dataset_with_priority.csv"):
    """
    Main function that connects NLP processing with Bayesian engine
    """
    
    print("="*60)
    print("MEDICAL DIAGNOSTIC SYSTEM")
    print("="*60)
    print(f"\nYour input: {user_input_text}\n")
    
    # ========================================
    # PHASE 1: NLP PROCESSING
    # ========================================
    print("Phase 1: Processing your symptoms with NLP...")
    
    nlp = SimpleNLPEngine(dataset_path)
    
    # Extract symptoms from text
    found_symptoms, negated_symptoms = nlp.extract_symptoms(user_input_text)
    red_flags = nlp.detect_red_flags(user_input_text)
    triage_level = nlp.assess_triage(found_symptoms, red_flags)
    
    if not found_symptoms:
        print("\n⚠ No recognized symptoms found in your input.")
        print("Please describe your symptoms more clearly.")
        print("\nExamples:")
        print("  - 'I have a cough and fever'")
        print("  - 'I'm experiencing chest pain and shortness of breath'")
        print("  - 'I have abdominal pain and nausea'")
        return None
    
    print(f"✓ Detected {len(found_symptoms)} symptom(s): {', '.join(found_symptoms)}")
    if negated_symptoms:
        print(f"✓ Negated symptoms: {', '.join(negated_symptoms)}")
    if red_flags:
        print(f"⚠ Red flags detected: {', '.join(red_flags)}")
    print(f"✓ Triage Level: {triage_level}")
    
    # ========================================
    # PHASE 2: CREATE JSON FOR BAYESIAN ENGINE
    # ========================================
    print("\nPhase 2: Preparing data for diagnostic engine...")
    
    # Convert to format expected by main_engine.py
    symptoms_list = []
    for symptom in found_symptoms:
        symptoms_list.append({
            "user_term": symptom,
            "clinical_term": symptom,
            "negated": False,
            "red_flag": symptom in red_flags or any(rf in symptom for rf in red_flags)
        })
    
    # Add negated symptoms
    for symptom in negated_symptoms:
        symptoms_list.append({
            "user_term": symptom,
            "clinical_term": symptom,
            "negated": True,
            "red_flag": False
        })
    
    # Get patient name from input or use default
    patient_name = input("\nPlease enter patient name: ").strip()
    if not patient_name:
        patient_name = "Unknown Patient"
    
    user_json = {
        "patient_name": patient_name,
        "symptoms": symptoms_list,
        "triage_level": triage_level
    }
    
    # Save intermediate JSON (optional, for debugging)
    with open("generated_input.json", "w") as f:
        json.dump(user_json, indent=4, fp=f)
    
    print(f"✓ Generated structured JSON")
    print(f"✓ Active symptoms for diagnosis: {[s for s in found_symptoms]}")
    
    # ========================================
    # PHASE 3: RUN BAYESIAN DIAGNOSTIC ENGINE
    # ========================================
    print("\n" + "="*60)
    print("Phase 3: Starting Bayesian Diagnostic Engine...")
    print("="*60 + "\n")
    
    # Run the Bayesian engine with the generated JSON
    final_probabilities = run_engine(user_json, dataset_path)
    
    return {
        "detected_symptoms": found_symptoms,
        "negated_symptoms": negated_symptoms,
        "red_flags": red_flags,
        "triage_level": triage_level,
        "diagnostic_probabilities": final_probabilities
    }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("INTEGRATED MEDICAL DIAGNOSTIC SYSTEM")
    print("="*60)
    print("\nThis system will:")
    print("1. Process your symptoms using NLP")
    print("2. Generate structured medical data")
    print("3. Ask follow-up questions")
    print("4. Provide diagnostic predictions")
    print("\n" + "="*60 + "\n")
    
    # Get user input
    user_text = input("Please describe your symptoms: ").strip()
    
    if not user_text:
        print("No input provided. Exiting.")
        exit()
    
    # Run the integrated system
    result = run_integrated_system(user_text)
    
    if result:
        print("\n" + "="*60)
        print("SYSTEM COMPLETE")
        print("="*60)

