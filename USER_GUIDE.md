# Medical Diagnostic System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Registration & Login](#registration--login)
3. [Medical Profile](#medical-profile)
4. [Starting a Diagnosis](#starting-a-diagnosis)
5. [Understanding Results](#understanding-results)
6. [Medical Reports](#medical-reports)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation
1. Ensure Python 3.8+ is installed
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the application:
   ```bash
   python app.py
   ```
4. Open browser to: `http://localhost:5000`

---

## Registration & Login

### Creating an Account
1. Click "Register here" on the login page
2. Fill in:
   - Full Name
   - Email address
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Register"
4. You'll be redirected to login page

### Logging In
1. Enter your email and password
2. Click "Login"
3. You'll be taken to your dashboard

---

## Medical Profile

### Why Complete Your Profile?
Your medical profile information is included in generated reports and helps provide context for diagnoses.

### Profile Information

**Blood Group**
- Select from: A+, A-, B+, B-, AB+, AB-, O+, O-
- Important for emergency situations

**Allergies**
- List all known allergies
- Include: medications, latex, food allergies
- Example: "Penicillin, latex gloves, shellfish"

**Past Medical History - Active Problems**
- Current ongoing medical conditions
- Example: "Type 2 Diabetes, Hypertension"

**Past Surgical History**
- Previous surgeries with dates
- Example: "Appendectomy (2020), Knee surgery (2022)"

**Current Medications**
- All medications you're taking
- Include OTC drugs and herbal supplements
- Example: "Metformin 500mg twice daily, Vitamin D 1000 IU"

**Alcohol/Tobacco/Substance Use**
- Describe usage patterns
- Example: "Social drinker, non-smoker"

### Saving Your Profile
1. Fill in all relevant fields
2. Click "Save Profile"
3. Confirmation message will appear

---

## Starting a Diagnosis

### Step 1: Describe Your Symptoms
Navigate to Dashboard → Click "Start Now" under "New Diagnosis"

**Tips for describing symptoms:**
- Be specific and detailed
- Include duration ("for 3 days")
- Mention severity ("severe", "mild")
- Describe location ("chest pain", "left arm")
- Note any patterns ("worse at night")

**Good Examples:**
- ✓ "I have a severe cough and fever for 3 days with chest pain"
- ✓ "Experiencing sharp abdominal pain in lower right side since yesterday"
- ✓ "Persistent headache and dizziness for a week, worse in the morning"

**Poor Examples:**
- ✗ "Not feeling well"
- ✗ "Something is wrong"
- ✗ "Pain"

### Step 2: Review Detected Symptoms
The system will show:
- List of detected symptoms
- Triage level (Low/Moderate/High)

**Triage Levels:**
- **Low**: 1-2 symptoms, no red flags
- **Moderate**: 3+ symptoms
- **High**: Red flag symptoms detected (chest pain, bleeding, etc.)

### Step 3: Answer Follow-up Questions

**Question Types:**

**1. Severity Scale (1-10)**
- 1-3: Mild
- 4-6: Moderate
- 7-10: Severe

**2. Yes/No Questions**
- "Are you experiencing [symptom]?"
- Answer honestly

**3. Categorical Questions**
- "Did it start suddenly or gradually?"
- Choose the option that best fits

**4. Free Text**
- "Does anything make it better or worse?"
- Provide relevant details

### Step 4: View Results
After answering questions, you'll see:
- Top 5 probable diagnoses
- Probability percentages
- Confidence level
- Option to generate report

---

## Understanding Results

### Probability Percentages
- Shows likelihood of each disease
- Based on your symptoms and answers
- Higher percentage = more likely

### Confidence Levels

**High Confidence (>70%)**
- Strong match with symptom pattern
- Clear leading diagnosis

**Moderate Confidence (40-70%)**
- Good match but some uncertainty
- May need additional tests

**Low Confidence (<40%)**
- Multiple possible diagnoses
- Further clinical evaluation required

### Important Notes
- Results are preliminary assessments
- NOT a final diagnosis
- Always consult a healthcare professional
- Use results to inform discussion with doctor

---

## Medical Reports

### Generating a Report
1. Complete the diagnosis process
2. Click "Generate Medical Report"
3. Report opens in new page

### Report Contents

**Header Section**
- Hospital information
- Patient identification
- Date of consultation

**Medical History**
- Past medical history (from your profile)
- Past surgical history
- Allergies
- Current medications
- Substance use

**Review of Systems**
- Respiratory findings
- Cardiovascular findings
- Recommended tests

**Diagnostic Assessment**
- Differential diagnosis list
- Probability rankings
- Primary diagnosis

**Clinical Summary**
- Chief complaint
- Triage level
- Assessment
- Recommendations

### Using the Report

**Print Report**
- Click "Print Report" button
- Use browser print dialog
- Select printer or save as PDF

**Download PDF**
- Click "Download PDF" button
- Save to your computer
- Share with healthcare provider

**Sharing with Doctor**
- Print and bring to appointment
- Email PDF to doctor's office
- Upload to patient portal

---

## Troubleshooting

### "No recognized symptoms found"
**Problem**: System couldn't identify symptoms in your text

**Solutions:**
- Use more specific medical terms
- Describe symptoms more clearly
- Try: "cough" instead of "throat problem"
- Include multiple symptoms

### Questions seem repetitive
**Problem**: System asks similar questions

**Explanation:**
- Different questions refine the diagnosis
- Each answer updates probabilities
- Helps distinguish between similar diseases

### Low confidence results
**Problem**: All diagnoses show low probability

**Reasons:**
- Symptoms match multiple diseases
- Uncommon symptom combination
- Need more information

**What to do:**
- Seek professional medical evaluation
- Mention all symptoms to doctor
- Bring generated report

### Can't save profile
**Problem**: Profile doesn't save

**Solutions:**
- Check internet connection
- Ensure all required fields filled
- Try logging out and back in
- Clear browser cache

### Report doesn't print correctly
**Problem**: Report formatting issues

**Solutions:**
- Use Chrome or Firefox browser
- Check print preview
- Adjust print settings
- Try "Download PDF" instead

---

## Best Practices

### For Accurate Diagnosis
1. Be thorough in symptom description
2. Answer all questions honestly
3. Include symptom duration
4. Mention severity levels
5. Note any patterns or triggers

### For Medical Reports
1. Complete your profile first
2. Keep profile information updated
3. Generate report after each diagnosis
4. Save reports for your records
5. Share with healthcare providers

### Privacy & Security
1. Use strong passwords
2. Don't share login credentials
3. Log out after use on shared computers
4. Keep profile information current
5. Store reports securely

---

## Support

### Common Questions

**Q: Is this a replacement for seeing a doctor?**
A: No. This is a diagnostic support tool. Always consult healthcare professionals for medical advice.

**Q: How accurate are the diagnoses?**
A: The system uses Bayesian probability based on 862 symptoms. Accuracy depends on symptom description quality and completeness.

**Q: Can I use this for emergencies?**
A: No. For emergencies, call emergency services immediately.

**Q: Is my data secure?**
A: Yes. Passwords are hashed, and data is stored locally on the server.

**Q: Can I delete my account?**
A: Contact system administrator for account deletion.

---

## Medical Disclaimer

This system is designed as a diagnostic support tool and educational resource. It is NOT intended to:
- Replace professional medical advice
- Provide definitive diagnoses
- Recommend specific treatments
- Handle medical emergencies

Always seek the advice of qualified healthcare professionals for:
- Medical diagnosis
- Treatment decisions
- Medication management
- Emergency situations

The generated reports are preliminary assessments based on symptom analysis and should be reviewed by licensed medical professionals.

---

## Version Information

- Version: 1.0
- Last Updated: March 2026
- Dataset: 862 symptoms, multiple diseases
- Engine: Bayesian probability with NLP
