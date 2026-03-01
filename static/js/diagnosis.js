let currentQuestion = null;
let diagnosisData = {
    symptoms: '',
    detectedSymptoms: [],
    triageLevel: '',
    answers: [],
    results: []
};

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        alert('Error logging out');
    }
}

async function startDiagnosis() {
    const symptoms = document.getElementById('symptoms').value.trim();
    
    if (!symptoms) {
        alert('Please describe your symptoms');
        return;
    }
    
    diagnosisData.symptoms = symptoms;
    
    try {
        const response = await fetch('/api/start-diagnosis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            alert(result.message);
            return;
        }
        
        diagnosisData.detectedSymptoms = result.detected_symptoms;
        diagnosisData.triageLevel = result.triage_level;
        diagnosisData.emergencyMessage = result.emergency_message || null;
        
        // Show emergency alert if present
        if (result.emergency_message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'emergency-alert';
            alertDiv.style.cssText = 'background: #ff4444; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold;';
            alertDiv.textContent = result.emergency_message;
            document.getElementById('symptomInput').parentNode.insertBefore(alertDiv, document.getElementById('symptomInput').nextSibling);
        }
        
        // Show detected symptoms
        document.getElementById('symptomInput').style.display = 'none';
        document.getElementById('detectedSymptoms').style.display = 'block';
        
        const symptomsList = document.getElementById('symptomsList');
        symptomsList.innerHTML = '<ul class="symptom-list">' + 
            result.detected_symptoms.map(s => `<li>${s}</li>`).join('') +
            '</ul>';
        
        const triageLevel = document.getElementById('triageLevel');
        const triageClass = result.triage_level.toLowerCase();
        triageLevel.innerHTML = `<div class="triage-badge triage-${triageClass}">Triage Level: ${result.triage_level}</div>`;
        
        // Get first question
        getNextQuestion();
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function getNextQuestion() {
    try {
        const response = await fetch('/api/next-question');
        const result = await response.json();
        
        if (result.status === 'complete') {
            showResults(result);
            return;
        }
        
        if (result.status === 'question') {
            currentQuestion = result;
            document.getElementById('questionSection').style.display = 'block';
            document.getElementById('questionText').textContent = result.question;
            
            // Hide all input types first
            document.getElementById('answerButtons').style.display = 'none';
            document.getElementById('categoricalButtons').style.display = 'none';
            document.getElementById('severityInput').style.display = 'none';
            document.getElementById('textInput').style.display = 'none';
            
            // Determine which input type to show based on answer_type
            const answerType = result.answer_type || 'yes_no';
            
            if (answerType === 'numeric_scale' || answerType.includes('severity')) {
                // Show severity scale input
                document.getElementById('severityInput').style.display = 'flex';
            } else if (answerType === 'free_text') {
                // Show text input
                document.getElementById('textInput').style.display = 'flex';
            } else if (answerType === 'categorical' || answerType === 'categorical_multi') {
                // Show categorical buttons
                const categoricalDiv = document.getElementById('categoricalButtons');
                categoricalDiv.innerHTML = '';
                categoricalDiv.style.display = 'flex';
                
                if (result.options && result.options.length > 0) {
                    result.options.forEach(option => {
                        const button = document.createElement('button');
                        button.className = 'btn btn-primary';
                        button.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                        button.onclick = () => submitAnswer(option);
                        categoricalDiv.appendChild(button);
                    });
                }
            } else {
                // Default: yes/no buttons
                document.getElementById('answerButtons').style.display = 'flex';
            }
        }
    } catch (error) {
        alert('Error getting question: ' + error.message);
    }
}

async function submitAnswer(answer) {
    const data = {
        answer: answer,
        qcol: currentQuestion.qcol || null,
        symptom: currentQuestion.symptom || null,
        question: currentQuestion.question
    };
    
    diagnosisData.answers.push(data);
    
    try {
        await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        getNextQuestion();
    } catch (error) {
        alert('Error submitting answer: ' + error.message);
    }
}

async function submitSeverity() {
    const severity = document.getElementById('severity').value;
    
    if (!severity || severity < 1 || severity > 10) {
        alert('Please enter a severity level between 1 and 10');
        return;
    }
    
    const data = {
        answer: severity,
        qcol: currentQuestion.qcol || null,
        symptom: currentQuestion.symptom || null,
        question: currentQuestion.question
    };
    
    diagnosisData.answers.push(data);
    
    try {
        await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        document.getElementById('severity').value = '';
        getNextQuestion();
    } catch (error) {
        alert('Error submitting severity: ' + error.message);
    }
}

async function submitText() {
    const textAnswer = document.getElementById('textAnswer').value.trim();
    
    if (!textAnswer) {
        alert('Please enter your answer');
        return;
    }
    
    const data = {
        answer: textAnswer,
        qcol: currentQuestion.qcol || null,
        symptom: currentQuestion.symptom || null,
        question: currentQuestion.question
    };
    
    diagnosisData.answers.push(data);
    
    try {
        await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        document.getElementById('textAnswer').value = '';
        getNextQuestion();
    } catch (error) {
        alert('Error submitting answer: ' + error.message);
    }
}

function showResults(result) {
    document.getElementById('questionSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    diagnosisData.results = result.results || [];
    diagnosisData.patientName = result.patient_name || 'Unknown Patient';
    
    let html = '';
    
    // Show emergency alert if present
    if (result.emergency_message) {
        html += `
            <div class="emergency-alert" style="background: #ff4444; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px; font-weight: bold;">
                ${result.emergency_message}
            </div>
        `;
    }
    
    if (result.results && result.results.length > 0) {
        result.results.forEach((item, index) => {
            const topClass = index === 0 ? 'top' : '';
            html += `
                <div class="result-item ${topClass}">
                    <div class="disease-name">${index + 1}. ${item.disease}</div>
                    <div class="probability">${item.probability}%</div>
                </div>
            `;
        });
        
        html += `
            <div class="confidence">
                <strong>Most Probable Diagnosis:</strong> ${result.top_diagnosis}<br>
                <strong>Confidence Level:</strong> ${result.confidence}
            </div>
        `;
    } else {
        html = '<p>No diagnosis could be determined.</p>';
    }
    
    document.getElementById('resultsContent').innerHTML = html;
}

async function generateReport() {
    // Save consultation
    try {
        await fetch('/api/save-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symptoms: diagnosisData.detectedSymptoms,
                triage_level: diagnosisData.triageLevel,
                diagnosis: diagnosisData.results,
                answers: diagnosisData.answers
            })
        });
    } catch (error) {
        console.error('Error saving consultation:', error);
    }
    
    // Store data in sessionStorage for report page
    sessionStorage.setItem('diagnosisData', JSON.stringify(diagnosisData));
    
    // Navigate to report page
    window.location.href = '/report';
}
