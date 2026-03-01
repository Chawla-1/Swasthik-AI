from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import pandas as pd
import json
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from integrated_system import SimpleNLPEngine
from main_engine import (
    load_dataset, safety_check, extract_triggers, 
    compute_initial_probabilities, select_best_question,
    select_differentiation_question, update_probabilities,
    check_stop_condition, parse_question_metadata
)

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'
CORS(app)

DATASET_PATH = "dataset_with_priority.csv"
USERS_FILE = "users.json"

# Initialize users file if it doesn't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

def load_users():
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    users = load_users()
    user = users.get(session['user_id'], {})
    return render_template('dashboard.html', user=user)

@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    users = load_users()
    user = users.get(session['user_id'], {})
    return render_template('profile.html', user=user)

@app.route('/diagnosis')
def diagnosis():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('diagnosis.html')

@app.route('/report')
def report():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('report.html')

# API Routes
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    users = load_users()
    
    if data['email'] in users:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    users[data['email']] = {
        'name': data['name'],
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'profile': {
            'blood_group': '',
            'allergies': '',
            'past_medical_history': '',
            'past_surgical_history': '',
            'current_medications': '',
            'alcohol_tobacco': ''
        },
        'consultations': []
    }
    
    save_users(users)
    return jsonify({'success': True})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    users = load_users()
    
    user = users.get(data['email'])
    if user and check_password_hash(user['password'], data['password']):
        session['user_id'] = data['email']
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

@app.route('/api/profile', methods=['GET', 'POST'])
def api_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    users = load_users()
    user = users[session['user_id']]
    
    if request.method == 'POST':
        data = request.json
        user['profile'].update(data)
        save_users(users)
        return jsonify({'success': True})
    
    return jsonify({'success': True, 'profile': user['profile']})

@app.route('/api/start-diagnosis', methods=['POST'])
def start_diagnosis():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    symptom_text = data.get('symptoms', '')
    
    # Get patient name from logged-in user
    users = load_users()
    user = users.get(session['user_id'], {})
    patient_name = user.get('name', 'Unknown Patient')
    
    # Process with NLP
    nlp = SimpleNLPEngine(DATASET_PATH)
    found_symptoms, negated_symptoms = nlp.extract_symptoms(symptom_text)
    red_flags = nlp.detect_red_flags(symptom_text)
    triage_level = nlp.assess_triage(found_symptoms, red_flags)
    
    if not found_symptoms:
        return jsonify({
            'success': False,
            'message': 'No recognized symptoms found. Please describe your symptoms more clearly.'
        })
    
    # Create symptom list
    symptoms_list = []
    for symptom in found_symptoms:
        symptoms_list.append({
            "user_term": symptom,
            "clinical_term": symptom,
            "negated": False,
            "red_flag": symptom in red_flags or any(rf in symptom for rf in red_flags)
        })
    
    user_json = {
        "patient_name": patient_name,
        "symptoms": symptoms_list,
        "triage_level": triage_level
    }
    
    # Safety check - but don't stop, just flag it
    emergency_flag = safety_check(user_json)
    emergency_message = None
    if emergency_flag:
        emergency_message = '⚠ EMERGENCY ALERT: Red flag symptoms detected. Immediate medical attention is strongly advised.'
    
    # Initialize diagnosis session
    df = load_dataset(DATASET_PATH)
    triggers = extract_triggers(user_json)
    probs = compute_initial_probabilities(df, triggers)
    
    if not probs:
        return jsonify({
            'success': False,
            'message': 'No matching diseases found for your symptoms.'
        })
    
    # Store in session
    session['diagnosis'] = {
        'patient_name': patient_name,
        'triggers': triggers,
        'confirmed_triggers': triggers.copy(),
        'probs': probs,
        'asked_qcols': [],
        'asked_diff_symptoms': [],
        'question_count': 0,
        'phase1_limit': 3,
        'detected_symptoms': found_symptoms,
        'triage_level': triage_level,
        'answers': [],
        'emergency_flag': emergency_flag
    }
    
    return jsonify({
        'success': True,
        'detected_symptoms': found_symptoms,
        'triage_level': triage_level,
        'emergency_message': emergency_message
    })

@app.route('/api/next-question', methods=['GET'])
def next_question():
    if 'user_id' not in session or 'diagnosis' not in session:
        return jsonify({'success': False, 'message': 'No active diagnosis'})
    
    df = load_dataset(DATASET_PATH)
    diag = session['diagnosis']
    
    # Check stop condition
    if check_stop_condition(diag['probs'], diag['question_count'], diag['phase1_limit']):
        sorted_probs = sorted(diag['probs'].items(), key=lambda x: x[1], reverse=True)
        top_5 = sorted_probs[:5]
        
        results = []
        for disease, prob in top_5:
            results.append({
                'disease': disease,
                'probability': round(prob * 100, 2)
            })
        
        confidence = top_5[0][1] * 100 if top_5 else 0
        if confidence < 40:
            confidence_level = "Low"
        elif confidence < 70:
            confidence_level = "Moderate"
        else:
            confidence_level = "High"
        
        # Include emergency flag and patient name in results
        emergency_message = None
        if diag.get('emergency_flag', False):
            emergency_message = '⚠ EMERGENCY ALERT: Red flag symptoms detected. Immediate medical attention is strongly advised.'
        
        return jsonify({
            'status': 'complete',
            'results': results,
            'top_diagnosis': top_5[0][0] if top_5 else None,
            'confidence': confidence_level,
            'emergency_message': emergency_message,
            'patient_name': diag.get('patient_name', 'Unknown Patient')
        })
    
    # Get next question
    if diag['question_count'] < diag['phase1_limit']:
        qcol, question, metadata = select_best_question(
            df, diag['probs'], diag['asked_qcols'], diag['triggers']
        )
        if qcol is None:
            return jsonify({'status': 'complete'})
        
        return jsonify({
            'status': 'question',
            'question': question,
            'qcol': qcol,
            'type': 'phase1',
            'answer_type': metadata.get('answer_type', 'yes_no'),
            'options': metadata.get('options', [])
        })
    else:
        new_symptom = select_differentiation_question(
            df, diag['probs'], diag['confirmed_triggers'], diag['asked_diff_symptoms']
        )
        if new_symptom is None:
            return jsonify({'status': 'complete'})
        
        question = f"Are you experiencing {new_symptom}?"
        
        return jsonify({
            'status': 'question',
            'question': question,
            'symptom': new_symptom,
            'type': 'phase2',
            'answer_type': 'yes_no',
            'options': ['yes', 'no']
        })

@app.route('/api/answer', methods=['POST'])
def submit_answer():
    if 'user_id' not in session or 'diagnosis' not in session:
        return jsonify({'success': False, 'message': 'No active diagnosis'})
    
    data = request.json
    answer = data.get('answer', '').strip().lower()
    qcol = data.get('qcol')
    symptom = data.get('symptom')
    
    df = load_dataset(DATASET_PATH)
    diag = session['diagnosis']
    
    # Update probabilities
    diag['probs'] = update_probabilities(df, diag['probs'], answer, symptom, qcol)
    
    # Store answer
    diag['answers'].append({
        'question': data.get('question', ''),
        'answer': answer,
        'qcol': qcol,
        'symptom': symptom
    })
    
    # Update session
    diag['question_count'] += 1
    
    if symptom:
        diag['asked_diff_symptoms'].append(symptom)
        if answer == 'yes':
            diag['confirmed_triggers'].append(symptom)
    
    if qcol:
        diag['asked_qcols'].append(qcol)
    
    session['diagnosis'] = diag
    session.modified = True
    
    return jsonify({'success': True})

@app.route('/api/save-consultation', methods=['POST'])
def save_consultation():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    users = load_users()
    user = users[session['user_id']]
    
    consultation = {
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'symptoms': data.get('symptoms', []),
        'triage_level': data.get('triage_level', ''),
        'diagnosis': data.get('diagnosis', []),
        'answers': data.get('answers', [])
    }
    
    user['consultations'].append(consultation)
    save_users(users)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
