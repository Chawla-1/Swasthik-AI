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
        
        // Show emergency alert if present - make it persistent
        if (result.emergency_message) {
            const alertDiv = document.createElement('div');
            alertDiv.id = 'emergencyAlert';
            alertDiv.className = 'emergency-alert';
            alertDiv.style.cssText = 'background: #ff4444; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold; text-align: center; font-size: 16px;';
            alertDiv.innerHTML = `<strong>⚠️ ${result.emergency_message}</strong><br><small style="font-size: 14px; font-weight: normal;">Continuing with diagnostic assessment...</small>`;
            
            // Insert at the top of the page
            const container = document.querySelector('.container');
            container.insertBefore(alertDiv, container.firstChild);
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
            
            // Render answer UI dynamically
            renderAnswerUI(result);
        }
    } catch (error) {
        alert('Error getting question: ' + error.message);
    }
}

function renderAnswerUI(q) {
    const area = document.getElementById('answerArea');
    const badge = document.getElementById('qTypeBadge');

    // Backend sends these directly - no parsing needed
    const answerType = q.answer_type || 'yes_no';
    const options = q.options || [];
    const qcol = (q.qcol || '').toLowerCase();

    // CATEGORICAL - options from backend e.g. ['sudden', 'gradual']
    if (answerType === 'categorical' || options.length >= 2) {
        badge.textContent = 'Choose One';
        let html = '<div class="mc-options">';
        for (let i = 0; i < options.length; i++) {
            const val = options[i];
            const label = val.charAt(0).toUpperCase() + val.slice(1);
            html += `<label class="mc-option" onclick="selectMC(this)">
                <input type="radio" name="mcAnswer" value="${val}"> ${label}
            </label>`;
        }
        html += '</div>';
        html += '<div style="margin-top:1rem">'
            + '<button onclick="submitMC()" class="btn btn-primary">Submit Answer</button>'
            + '</div>';
        area.innerHTML = html;

    // SCALE / SEVERITY
    } else if (answerType === 'scale' || qcol.indexOf('severity') !== -1) {
        badge.textContent = 'Severity Scale';
        area.innerHTML = '<div class="severity-area">'
            + '<div class="severity-display" id="severityDisplay">5</div>'
            + '<div class="severity-track">'
            + '<input type="range" id="severitySlider" min="1" max="10" value="5" '
            + 'oninput="document.getElementById(\'severityDisplay\').textContent=this.value">'
            + '</div>'
            + '<div class="severity-labels">'
            + '<span>1 - Mild</span><span>5 - Moderate</span><span>10 - Severe</span>'
            + '</div>'
            + '<button onclick="submitSeverity()" class="btn btn-primary btn-lg" style="margin-top:.5rem">Submit</button>'
            + '</div>';

    // DURATION
    } else if (answerType === 'duration' || qcol.indexOf('duration') !== -1) {
        badge.textContent = 'Duration';
        const dOpts = ['Less than 24 hours', '1-3 days', '4-7 days', '1-2 weeks', 'More than 2 weeks', 'More than a month'];
        let dHtml = '<div class="mc-options">';
        for (let j = 0; j < dOpts.length; j++) {
            dHtml += `<label class="mc-option" onclick="selectMC(this)">
                <input type="radio" name="mcAnswer" value="${dOpts[j]}"> ${dOpts[j]}
            </label>`;
        }
        dHtml += '</div><div style="margin-top:1rem">'
            + '<button onclick="submitMC()" class="btn btn-primary">Submit</button></div>';
        area.innerHTML = dHtml;

    // FREE TEXT
    } else if (answerType === 'text' || qcol.indexOf('free_text') !== -1) {
        badge.textContent = 'Open Answer';
        area.innerHTML = '<div style="display:flex;gap:.875rem;align-items:center">'
            + '<input type="text" id="textAnswer" placeholder="Type your answer..." style="flex:1" '
            + 'onkeypress="if(event.key===\'Enter\') submitText()">'
            + '<button onclick="submitText()" class="btn btn-primary">Submit</button>'
            + '</div>';

    // DEFAULT: YES / NO (phase 2 differentiation questions)
    } else {
        badge.textContent = 'Yes / No';
        area.innerHTML = '<div class="yesno-buttons">'
            + '<button onclick="submitAnswer(\'yes\')" class="btn btn-success btn-lg">Yes</button>'
            + '<button onclick="submitAnswer(\'no\')" class="btn btn-danger btn-lg">No</button>'
            + '</div>';
    }
}

function selectMC(label) {
    const all = document.querySelectorAll('.mc-option');
    for (let i = 0; i < all.length; i++) {
        all[i].classList.remove('selected');
    }
    label.classList.add('selected');
    label.querySelector('input').checked = true;
}

function submitMC() {
    const selected = document.querySelector('input[name="mcAnswer"]:checked');
    if (!selected) {
        alert('Please select an option');
        return;
    }
    submitAnswer(selected.value);
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
    const severity = document.getElementById('severitySlider').value;
    submitAnswer(severity);
}

async function submitText() {
    const textAnswer = document.getElementById('textAnswer').value.trim();
    
    if (!textAnswer) {
        alert('Please enter your answer');
        return;
    }
    
    submitAnswer(textAnswer);
}

function showResults(result) {
    document.getElementById('questionSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    diagnosisData.results = result.results || [];
    diagnosisData.patientName = result.patient_name || 'Unknown Patient';
    
    let html = '';
    
    // Show emergency alert if present - make it prominent
    if (result.emergency_message || diagnosisData.emergencyMessage) {
        const emergencyMsg = result.emergency_message || diagnosisData.emergencyMessage;
        html += `
            <div class="alert alert-error" style="margin-bottom: 1.75rem; padding: 1.5rem; font-size: 1rem;">
                <div style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem;">⚠️ EMERGENCY ALERT ⚠️</div>
                <div>${emergencyMsg}</div>
                <div style="margin-top: 0.75rem; font-size: 0.875rem; font-weight: normal;">The diagnostic assessment below is provided for informational purposes only.</div>
            </div>
        `;
    }
    
    if (result.results && result.results.length > 0) {
        result.results.forEach((item, index) => {
            const topClass = index === 0 ? 'top' : '';
            const rank = index === 0 ? '★' : (index + 1);
            html += `
                <div class="result-item ${topClass}">
                    <div class="result-item-inner">
                        <div class="result-rank">${rank}</div>
                        <div class="disease-name">${item.disease}</div>
                    </div>
                    <div class="probability">${item.probability}%</div>
                </div>
            `;
        });
        
        const conf = result.confidence || 'Moderate';
        const confColor = conf === 'High' ? 'var(--green)' : conf === 'Low' ? 'var(--red)' : 'var(--amber)';
        html += `
            <div class="confidence">
                <strong>Primary Diagnosis:</strong> ${result.top_diagnosis}<br>
                <strong>Confidence:</strong> <span style="color:${confColor}">${conf}</span>
            </div>
        `;
    } else {
        html = '<div class="alert alert-warn">No definitive diagnosis could be determined. Please consult a physician.</div>';
    }
    
    document.getElementById('resultsContent').innerHTML = html;
}

async function generateReport() {
    // Debug: Log the data being saved
    console.log('Generating report with data:', diagnosisData);
    
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
    console.log('Data saved to sessionStorage');
    
    // Navigate to report page
    window.location.href = '/report';
}
