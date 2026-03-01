import pandas as pd
import json
import numpy as np


def load_user_json(json_path):
    with open(json_path, "r") as f:
        return json.load(f)
    
# ==============================
# LOAD DATASET
# ==============================

def load_dataset(path):
    df = pd.read_csv(path)
    df["trigger_symptom"] = df["trigger_symptom"].str.lower()
    
    if "answer_likelihood_map" in df.columns:
        df["answer_likelihood_map"] = df["answer_likelihood_map"].apply(
            lambda x: json.loads(x) if pd.notnull(x) else {}
        )

    return df


# ==============================
# SAFETY CHECK
# ==============================

def safety_check(user_json):
    if user_json.get("triage_level") == "High":
        return True

    for symptom in user_json.get("symptoms", []):
        if symptom.get("red_flag", False):
            return True

    return False


# ==============================
# EXTRACT TRIGGERS
# ==============================

def extract_triggers(user_json):
    triggers = []

    for symptom in user_json["symptoms"]:
        if not symptom.get("negated", False):
            term = symptom.get("clinical_term") or symptom.get("user_term")
            triggers.append(term.lower())

    return triggers


# ==============================
# INITIAL PROBABILITY
# ==============================

def compute_initial_probabilities(df, triggers):

    candidate_df = df[df["trigger_symptom"].isin(triggers)]

    probs = {}

    max_priority = df["priority"].max()

    for _, row in candidate_df.iterrows():

        disease = row["disease_name"]
        prior = row["prior_probability_div2"]
        priority_weight = row["priority"] / max_priority

        score = prior * priority_weight

        if disease not in probs:
            probs[disease] = score
        else:
            probs[disease] += score

    # Normalize
    total = sum(probs.values())
    for d in probs:
        probs[d] /= total

    return probs


# ==============================
# QUESTION SELECTION
# ==============================

def parse_question_metadata(question_text):
    """Extract answer type and options from question text"""
    import re
    
    metadata = {
        'question': question_text,
        'answer_type': 'yes_no',
        'options': []
    }
    
    # Extract answer_type
    answer_type_match = re.search(r'\[answer_type:\s*([^\]|]+)', question_text)
    if answer_type_match:
        metadata['answer_type'] = answer_type_match.group(1).strip()
    
    # Extract options
    options_match = re.search(r'options:\s*([^\]]+)\]', question_text)
    if options_match:
        options_str = options_match.group(1).strip()
        metadata['options'] = [opt.strip() for opt in options_str.split(',')]
    
    # Clean question text (remove metadata)
    clean_question = re.sub(r'\s*\[answer_type:.*?\]', '', question_text)
    metadata['question'] = clean_question.strip()
    
    return metadata


def select_best_question(df, probs, asked_qcols, triggers):

    # Sort diseases by probability
    sorted_diseases = sorted(probs.items(), key=lambda x: x[1], reverse=True)

    if not sorted_diseases:
        return None, None, None

    top_diseases = [d[0] for d in sorted_diseases[:2]]

    candidate_df = df[
        (df["disease_name"].isin(top_diseases)) &
        (df["trigger_symptom"].isin(triggers))
    ]

    question_columns = [col for col in df.columns if col.startswith("Q")]

    best_row = None
    best_priority = -1

    # Choose highest priority row first
    for _, row in candidate_df.iterrows():
        if row["priority"] > best_priority:
            best_priority = row["priority"]
            best_row = row

    if best_row is None:
        return None, None, None

    # Now select first unasked Q-column
    for col in question_columns:
        if col not in asked_qcols:
            question_text = best_row[col]
            if pd.notna(question_text):
                metadata = parse_question_metadata(question_text.strip())
                return col, metadata['question'], metadata

    return None, None, None


def select_differentiation_question(df, probs, confirmed_triggers, asked_diff_symptoms):

    sorted_diseases = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    top_diseases = [d[0] for d in sorted_diseases[:3]]

    candidate_symptoms = []

    for disease in top_diseases:

        disease_rows = df[df["disease_name"] == disease]

        for _, row in disease_rows.iterrows():

            symptom = row["trigger_symptom"]
            priority = row["priority"]

            if symptom not in confirmed_triggers and symptom not in asked_diff_symptoms:
                candidate_symptoms.append((symptom, priority))

    if not candidate_symptoms:
        return None

    candidate_symptoms.sort(key=lambda x: x[1], reverse=True)

    return candidate_symptoms[0][0]

# ==============================
# UPDATE PROBABILITIES
# ==============================

def update_probabilities(df, probs, user_answer, new_symptom=None, qcol=None):

    new_probs = {}

    for disease in probs:

        likelihood = 1.0  # neutral default

        # ✅ Phase 2: Differentiation logic
        if new_symptom is not None:

            disease_rows = df[df["disease_name"] == disease]
            disease_symptoms = disease_rows["trigger_symptom"].values

            if user_answer == "yes":
                if new_symptom in disease_symptoms:
                    likelihood = 1.7
                else:
                    likelihood = 0.4
            elif user_answer == "no":
                if new_symptom in disease_symptoms:
                    likelihood = 0.4
                else:
                    likelihood = 1.0

        # ✅ Phase 1: Severity logic
        elif qcol == "Q3_severity_scale":

            try:
                severity = int(user_answer)
            except:
                severity = 5

            if severity >= 7:
                likelihood = 1.4
            elif severity <= 3:
                likelihood = 0.8
            else:
                likelihood = 1.0

        new_probs[disease] = probs[disease] * likelihood

    # Normalize
    total = sum(new_probs.values())
    for d in new_probs:
        new_probs[d] /= total

    return new_probs


# ==============================
# STOP CONDITION
# ==============================

def check_stop_condition(probs, question_count, phase1_limit, max_questions=10):

    sorted_probs = sorted(probs.values(), reverse=True)

    if not sorted_probs:
        return True

    # Never stop during Phase 1
    if question_count < phase1_limit:
        return False

    # Stop if too many questions
    if question_count >= max_questions:
        return True

    # Stop if strong lead
    if len(sorted_probs) > 1 and (sorted_probs[0] - sorted_probs[1]) > 0.30:
        return True

    return False


# ==============================
# REPORT
# ==============================

def generate_report(probs, user_json, emergency_flag):

    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)

    patient_name = user_json.get("patient_name", "Unknown Patient")

    print("\n======================================")
    print("AI TRIAGE CLINICAL REPORT")
    print("======================================\n")

    print(f"Patient Name: {patient_name}\n")

    print("Reported Symptoms:")
    for symptom in user_json["symptoms"]:
        print(f"- {symptom.get('clinical_term')}")

    print("\nTop 5 Possible Diagnoses:\n")

    top_5 = sorted_probs[:5]

    for i, (disease, prob) in enumerate(top_5, start=1):
        print(f"{i}. {disease}: {round(prob * 100, 2)}%")

    if top_5:
        print("\nMost Probable Diagnosis:", top_5[0][0])

        confidence = top_5[0][1] * 100

        if confidence < 40:
            print("Confidence Level: Low – Further clinical evaluation required.")
        elif confidence < 70:
            print("Confidence Level: Moderate.")
        else:
            print("Confidence Level: High.")

    # ✅ Emergency Section
    if emergency_flag:
        print("\n⚠ EMERGENCY ALERT:")
        print("Red flag symptoms detected. Immediate medical attention is strongly advised.")

    print("\n======================================\n")


# ==============================
# MAIN ENGINE
# ==============================

def run_engine(user_json, dataset_path):

    emergency_flag = safety_check(user_json)

    if emergency_flag:
        print("\n⚠ RED FLAG DETECTED – Emergency evaluation recommended.\n")

    df = load_dataset(dataset_path)

    triggers = extract_triggers(user_json)
    confirmed_triggers = set(triggers)
    phase1_limit = 3
    asked_diff_symptoms = set()
    probs = compute_initial_probabilities(df, triggers)

    if not probs:
        print("No matching diseases found.")
        return

    asked_qcols = set()
    question_count = 0

    while True:
        new_symptom = None
        metadata = None

        if question_count < phase1_limit:
            qcol, question, metadata = select_best_question(df, probs, asked_qcols, triggers)
            if qcol is None:
                break

        else:
            new_symptom = select_differentiation_question(
                df, probs, confirmed_triggers, asked_diff_symptoms
            )
            if new_symptom is None:
                break

            question = f"Are you experiencing {new_symptom}? (yes/no)"
            qcol = None

        print("\nQuestion:", question)
        
        # Show options if available
        if metadata and metadata.get('options'):
            print("Options:", ", ".join(metadata['options']))

        user_answer = input("Answer: ").strip().lower()

        probs = update_probabilities(df, probs, user_answer, new_symptom, qcol)
        # If we are in differentiation phase
        if new_symptom is not None:
            asked_diff_symptoms.add(new_symptom)

        if user_answer == "yes":
            confirmed_triggers.add(new_symptom)

        if qcol:
            asked_qcols.add(qcol)

        question_count += 1
        print("Checking stop condition...")
        if check_stop_condition(probs, question_count, phase1_limit):
            print("Inside stop condition, question_count =", question_count)
            break
    generate_report(probs, user_json, emergency_flag)
    return probs

if __name__ == "__main__":

    user_json = load_user_json("input.json")

    run_engine(user_json, "dataset_with_priority.csv")