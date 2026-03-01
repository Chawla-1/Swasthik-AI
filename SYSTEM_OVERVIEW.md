# System Overview

## Architecture

```
User Input (Natural Language)
        ↓
[NLP Engine] - Extracts symptoms from text using dataset
        ↓
[JSON Generator] - Creates structured data
        ↓
[Bayesian Engine] - Asks follow-up questions & calculates probabilities
        ↓
[Diagnostic Report] - Top 5 diseases with confidence levels
```

## Key Features

### 1. Dataset-Driven NLP
- Loads all 862 symptoms directly from `dataset_with_priority.csv`
- No hardcoded symptom lists - always in sync with your data
- Detects negations ("no cough", "not experiencing fever")
- Identifies red flags (chest pain, bleeding, severe symptoms)

### 2. Automatic Triage
- **High**: Red flag symptoms detected
- **Moderate**: 3+ symptoms
- **Low**: 1-2 symptoms

### 3. Bayesian Diagnostic Engine
- **Phase 1**: Asks severity/onset questions (first 3 questions)
- **Phase 2**: Asks differentiation questions (symptom presence)
- Updates probabilities after each answer
- Stops when confident or max questions reached

### 4. Smart Question Selection
- Prioritizes high-priority diseases
- Asks most relevant questions first
- Avoids redundant questions

## Data Flow

1. **Input**: "I have a cough and fever"
2. **NLP Output**: 
   ```json
   {
     "symptoms": [
       {"user_term": "cough", "negated": false, "red_flag": false},
       {"user_term": "fever", "negated": false, "red_flag": false}
     ],
     "triage_level": "Low"
   }
   ```
3. **Bayesian Processing**: Matches symptoms to diseases, asks questions
4. **Output**: Disease probabilities with confidence

## Files Removed (Unnecessary)

- `clinical_mapper.py` - Not needed, symptoms used directly
- `nlp_engine.py` - Integrated into main system
- `symptom_extractor.py` - Simplified approach
- `risk_engine.py` - Triage handled in integrated system
- `triage_engine.py` - Integrated into main system
- `report_generator.py` - Reports handled by main_engine
- `medical_vocab.py` - Using dataset symptoms directly
- `main.py` - Replaced by integrated_system.py

## Current Files (Essential)

- `integrated_system.py` - **RUN THIS FILE**
- `main_engine.py` - Bayesian logic
- `dataset_with_priority.csv` - Knowledge base
- `README.md` - User guide
