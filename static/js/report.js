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
    
    console.log('Diagnosis Data:', diagnosisData); // Debug log
    
    // Get user profile
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (result.success) {
            const profile = result.profile;
            
            // Use patient name from diagnosisData
            const userName = diagnosisData.patientName || 'Unknown Patient';
            
            // Fill in patient information (header row)
            document.getElementById('patientName').textContent = userName;
            document.getElementById('consultationDate').textContent = new Date().toLocaleDateString();
            document.getElementById('bloodGroup').textContent = profile.blood_group || 'Not specified';
            document.getElementById('triageLevelReport').textContent = diagnosisData.triageLevel || 'Not assessed';
            
            // Fill in medical history (compact grid)
            document.getElementById('activeProblems').innerHTML = 
                profile.past_medical_history || 'None reported';
            document.getElementById('surgicalHistory').innerHTML = 
                profile.past_surgical_history || 'None reported';
            document.getElementById('allergies').innerHTML = 
                profile.allergies || 'None reported';
            document.getElementById('medications').innerHTML = 
                profile.current_medications || 'None reported';
            document.getElementById('substanceUse').innerHTML = 
                profile.alcohol_tobacco || 'None reported';
            
            // Fill in diagnostic assessment
            fillDiagnosticAssessment(diagnosisData);
            
            // Fill in clinical summary
            fillClinicalSummary(diagnosisData, profile, userName);
        }
    } catch (error) {
        console.error('Error loading report:', error);
        alert('Error loading report. Please try again.');
    }
}

function fillDiagnosticAssessment(diagnosisData) {
    const results = diagnosisData.results || [];
    const symptoms = diagnosisData.detectedSymptoms || [];
    
    let html = '';
    
    // Show emergency alert if present - use new design
    if (diagnosisData.emergencyMessage) {
        html += `
            <div class="alert alert-error" style="margin-bottom: 1rem; padding: .875rem; font-weight: 600; font-size: 9.5pt;">
                <div style="font-size: 10pt; margin-bottom: 0.375rem;">⚠️ EMERGENCY ALERT</div>
                <div>${diagnosisData.emergencyMessage}</div>
            </div>
        `;
    }
    
    // Chief Complaint
    if (symptoms.length > 0) {
        html += `<p style="margin-bottom: .625rem;"><strong>Chief Complaint:</strong> ${symptoms.join(', ')}</p>`;
    }
    
    if (results.length > 0) {
        html += '<p style="margin-bottom: .5rem;"><strong>Differential Diagnosis:</strong></p><ol style="margin: 0 0 .625rem 1.25rem; padding: 0;">';
        results.forEach(result => {
            html += `<li style="font-size: 9.5pt; margin-bottom: .25rem;"><strong>${result.disease}</strong> - ${result.probability}%</li>`;
        });
        html += '</ol>';
        
        html += `<p style="margin-top: .5rem; font-size: 9.5pt;"><strong>Primary Diagnosis:</strong> ${results[0].disease} (${results[0].probability}% probability)</p>`;
    } else {
        html += '<p style="font-size: 9.5pt;">Diagnostic assessment pending further evaluation.</p>';
    }
    
    document.getElementById('diagnosticResults').innerHTML = html;
}

function fillClinicalSummary(diagnosisData, profile, userName) {
    const results = diagnosisData.results || [];
    
    let summary = '';
    
    if (results.length > 0) {
        summary += `
            <p style="font-size: 9.5pt; line-height: 1.6; margin-bottom: .625rem;">
            Patient presents with symptoms consistent with <strong>${results[0].disease}</strong> 
            (${results[0].probability}% probability based on symptom analysis).
            </p>
        `;
    }
    
    // Add emergency note if applicable
    if (diagnosisData.emergencyMessage) {
        summary += `
            <p style="color: var(--red); font-weight: 600; font-size: 9.5pt; margin-bottom: .625rem;">
            <strong>⚠ URGENT:</strong> Red flag symptoms detected. Immediate medical attention is strongly advised.
            </p>
        `;
    }
    
    summary += `
        <p style="font-size: 9pt; margin-bottom: .375rem;"><strong>Recommendations:</strong></p>
        <ul style="margin: 0 0 .625rem 1.25rem; padding: 0; font-size: 9.5pt;">
            <li style="margin-bottom: .25rem;">Clinical examination by physician</li>
            <li style="margin-bottom: .25rem;">Laboratory tests as indicated</li>
            <li style="margin-bottom: .25rem;">Imaging studies if required</li>
            <li>Follow-up consultation</li>
        </ul>
        
        <p style="margin-top: .875rem; font-size: 8.5pt; color: #7b90ae; line-height: 1.5;">
        <strong>Note:</strong> This is a preliminary assessment based on symptom analysis. 
        Final diagnosis should be made by a qualified healthcare professional after thorough 
        clinical examination and appropriate diagnostic tests.
        </p>
    `;
    
    document.getElementById('clinicalSummary').innerHTML = summary;
}

function downloadPDF() {
    alert('PDF download functionality would be implemented here using a library like jsPDF or html2pdf.js');
}

// Load report on page load
loadReport();
