async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        alert('Error logging out');
    }
}

async function loadReport() {
    // Get diagnosis data from sessionStorage
    const diagnosisData = JSON.parse(sessionStorage.getItem('diagnosisData') || '{}');
    
    // Get user profile
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (result.success) {
            const profile = result.profile;
            
            // Get user data for patient name
            const userResponse = await fetch('/api/user-info');
            let userName = diagnosisData.patientName || 'Unknown Patient';
            
            // Fill in patient information
            document.getElementById('patientName').textContent = userName;
            document.getElementById('patientPhone').textContent = '___________________';
            document.getElementById('consultationDate').textContent = new Date().toLocaleDateString();
            document.getElementById('surgeryInfo').textContent = '___________________';
            
            // Fill in medical history
            document.getElementById('activeProblems').innerHTML = 
                profile.past_medical_history || '<p>None reported</p>';
            document.getElementById('inactiveProblems').innerHTML = '<p>None reported</p>';
            document.getElementById('surgicalHistory').innerHTML = 
                profile.past_surgical_history || '<p>None reported</p>';
            document.getElementById('allergies').innerHTML = 
                profile.allergies || '<p>None reported</p>';
            document.getElementById('medications').innerHTML = 
                profile.current_medications || '<p>None reported</p>';
            document.getElementById('substanceUse').innerHTML = 
                profile.alcohol_tobacco || '<p>None reported</p>';
            
            // Fill in system review based on symptoms
            fillSystemReview(diagnosisData);
            
            // Fill in diagnostic assessment
            fillDiagnosticAssessment(diagnosisData);
            
            // Fill in clinical summary
            fillClinicalSummary(diagnosisData, profile, userName);
        }
    } catch (error) {
        console.error('Error loading report:', error);
    }
}

function fillSystemReview(diagnosisData) {
    const symptoms = diagnosisData.detectedSymptoms || [];
    
    // Respiratory symptoms
    const respiratorySymptoms = symptoms.filter(s => 
        s.includes('cough') || s.includes('breath') || s.includes('wheez') || 
        s.includes('dyspnea') || s.includes('respiratory')
    );
    
    if (respiratorySymptoms.length > 0) {
        document.getElementById('respiratoryFindings').innerHTML = `
            <div class="checkbox-list">
                ${respiratorySymptoms.map(s => `
                    <div class="checkbox-item">
                        <input type="checkbox" checked disabled>
                        <label>${s}</label>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('respiratoryTests').innerHTML = 
            '<p>☐ Pulmonary Function Tests</p><p>☐ Chest CT Scan</p><p>☐ Cardio-Pulmonary Exercise Test</p>';
    } else {
        document.getElementById('respiratoryFindings').innerHTML = 
            '<p><input type="checkbox" checked disabled> Normal</p>';
        document.getElementById('respiratoryTests').innerHTML = '<p>No tests indicated</p>';
    }
    
    // Cardiovascular symptoms
    const cardiovascularSymptoms = symptoms.filter(s => 
        s.includes('chest pain') || s.includes('palpitation') || s.includes('heart') ||
        s.includes('cardiac') || s.includes('angina')
    );
    
    if (cardiovascularSymptoms.length > 0) {
        document.getElementById('cardiovascularFindings').innerHTML = `
            <div class="checkbox-list">
                ${cardiovascularSymptoms.map(s => `
                    <div class="checkbox-item">
                        <input type="checkbox" checked disabled>
                        <label>${s}</label>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('cardiovascularTests').innerHTML = 
            '<p>☐ EKG</p><p>☐ Stress Test</p><p>☐ Angiogram</p><p>☐ 2D Echo: Valves</p>';
    } else {
        document.getElementById('cardiovascularFindings').innerHTML = 
            '<p><input type="checkbox" checked disabled> Normal</p>';
        document.getElementById('cardiovascularTests').innerHTML = '<p>No tests indicated</p>';
    }
}

function fillDiagnosticAssessment(diagnosisData) {
    const results = diagnosisData.results || [];
    
    // Show emergency alert if present
    let html = '';
    if (diagnosisData.emergencyMessage) {
        html += `
            <div class="emergency-alert" style="background: #ff4444; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px; font-weight: bold;">
                ${diagnosisData.emergencyMessage}
            </div>
        `;
    }
    
    if (results.length > 0) {
        html += '<h4>Differential Diagnosis (by probability):</h4><ol>';
        results.forEach(result => {
            html += `<li><strong>${result.disease}</strong> - ${result.probability}% probability</li>`;
        });
        html += '</ol>';
        
        html += `<p style="margin-top: 1rem;"><strong>Primary Diagnosis:</strong> ${results[0].disease}</p>`;
        
        document.getElementById('diagnosticResults').innerHTML = html;
    } else {
        document.getElementById('diagnosticResults').innerHTML = 
            '<p>Diagnostic assessment pending further evaluation.</p>';
    }
}

function fillClinicalSummary(diagnosisData, profile, userName) {
    const symptoms = diagnosisData.detectedSymptoms || [];
    const results = diagnosisData.results || [];
    const triageLevel = diagnosisData.triageLevel || 'Not assessed';
    
    let summary = `
        <p><strong>Patient Name:</strong> ${userName}</p>
        <p><strong>Chief Complaint:</strong> ${symptoms.join(', ')}</p>
        <p><strong>Triage Level:</strong> ${triageLevel}</p>
        <p><strong>Blood Group:</strong> ${profile.blood_group || 'Not specified'}</p>
    `;
    
    if (results.length > 0) {
        summary += `
            <p><strong>Assessment:</strong> Patient presents with symptoms consistent with ${results[0].disease} 
            (${results[0].probability}% probability based on symptom analysis).</p>
        `;
    }
    
    // Add emergency note if applicable
    if (diagnosisData.emergencyMessage) {
        summary += `
            <p style="color: #ff4444; font-weight: bold;"><strong>⚠ URGENT:</strong> 
            Red flag symptoms detected. Immediate medical attention is strongly advised.</p>
        `;
    }
    
    summary += `
        <p><strong>Recommendations:</strong></p>
        <ul>
            <li>Clinical examination by physician</li>
            <li>Laboratory tests as indicated</li>
            <li>Imaging studies if required</li>
            <li>Follow-up consultation</li>
        </ul>
        
        <p style="margin-top: 2rem;"><strong>Note:</strong> This is a preliminary assessment based on 
        symptom analysis. Final diagnosis should be made by a qualified healthcare professional after 
        thorough clinical examination and appropriate diagnostic tests.</p>
    `;
    
    document.getElementById('clinicalSummary').innerHTML = summary;
}

function downloadPDF() {
    alert('PDF download functionality would be implemented here using a library like jsPDF or html2pdf.js');
}

// Load report on page load
loadReport();
