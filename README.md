# Swasthik-AI - Medical Diagnostic System

An integrated web-based system that combines NLP symptom detection with Bayesian diagnostic prediction and generates structured medical reports.

## Features

- **User Authentication** - Secure login and registration
- **User Profiles** - Store blood group, allergies, medical history, medications
- **Symptom Analysis** - NLP-powered symptom extraction from natural language
- **Interactive Diagnosis** - Follow-up questions for accurate assessment
- **Medical Reports** - Generate structured pre-surgery consultation form
- **Consultation History** - Track past diagnoses and assessments

## Files Structure

```
├── app.py                          # Flask web application
├── integrated_system.py            # NLP + Bayesian integration
├── main_engine.py                  # Bayesian diagnostic engine
├── dataset_with_priority.csv       # Medical knowledge base (862 symptoms)
├── templates/
│   ├── login.html                  # Login page
│   ├── register.html               # Registration page
│   ├── dashboard.html              # User dashboard
│   ├── profile.html                # Medical profile management
│   ├── diagnosis.html              # Symptom assessment interface
│   └── report.html                 # Medical report generator
├── static/
│   ├── css/
│   │   ├── style.css              # Main styles
│   │   └── report.css             # Report-specific styles
│   └── js/
│       ├── auth.js                # Authentication logic
│       ├── dashboard.js           # Dashboard functionality
│       ├── profile.js             # Profile management
│       ├── diagnosis.js           # Diagnosis workflow
│       └── report.js              # Report generation
└── users.json                      # User database (auto-generated)
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser to:
```
http://localhost:5000
```

## How to Use

### 1. Register/Login
- Create a new account or login with existing credentials
- Secure password hashing for user safety

### 2. Complete Your Profile
- Navigate to Profile page
- Enter your blood group
- Add allergies (medications, latex, food)
- Document past medical history
- List past surgeries
- Record current medications
- Note alcohol/tobacco use

### 3. Start Diagnosis
- Go to Dashboard → New Diagnosis
- Describe your symptoms in natural language
- Example: "I have a severe cough and fever for 3 days with chest pain"

### 4. Answer Questions
- System asks follow-up questions
- Answer severity scales (1-10)
- Confirm/deny additional symptoms
- Provide relevant details

### 5. View Results
- See top 5 probable diagnoses
- Review confidence levels
- Generate medical report

### 6. Medical Report
- Structured pre-surgery consultation format
- Includes all profile information
- Lists detected symptoms
- Shows diagnostic assessment
- Provides clinical summary
- Print or download PDF

## Report Format

The system generates reports in the format of:
**THE VALLEY HOSPITAL - PRE-SURGERY MEDICAL CONSULTATION FORM**

Includes:
- Patient identification
- Past medical history (active/inactive)
- Past surgical history
- Allergies
- Current medications
- Substance use
- Review of systems (Respiratory, Cardiovascular, etc.)
- Diagnostic assessment
- Clinical summary

## Example Workflow

```
1. User Input: "I have a cough and fever"

2. NLP Processing:
   ✓ Detected 2 symptoms: cough, fever
   ✓ Triage Level: Low

3. Follow-up Questions:
   Q: "On a scale of 1-10, how severe is the cough?"
   A: 7
   
   Q: "Are you experiencing shortness of breath?"
   A: No

4. Results:
   1. Common Cold: 45.23%
   2. Influenza: 32.15%
   3. Bronchitis: 15.67%
   
   Confidence: Moderate

5. Generate Report:
   → Structured medical consultation form
   → Ready for doctor review
```

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **NLP**: Custom symptom extraction
- **Diagnosis**: Bayesian probability engine
- **Data**: 862 symptoms, multiple diseases
- **Storage**: JSON-based user database

## Security Features

- Password hashing with Werkzeug
- Session-based authentication
- Secure user data storage
- CORS protection

## Requirements

```
Python 3.8+
Flask 3.0.0
Pandas 2.1.4
NumPy 1.26.2
```

## Notes

- This is a diagnostic support tool, not a replacement for professional medical advice
- All diagnoses should be confirmed by qualified healthcare professionals
- Reports are preliminary assessments based on symptom analysis
- System uses dataset of 862 symptoms for accurate detection
