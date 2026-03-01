async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        alert('Error logging out');
    }
}

// Load profile data
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (result.success) {
            const profile = result.profile;
            document.getElementById('blood_group').value = profile.blood_group || '';
            document.getElementById('allergies').value = profile.allergies || '';
            document.getElementById('past_medical_history').value = profile.past_medical_history || '';
            document.getElementById('past_surgical_history').value = profile.past_surgical_history || '';
            document.getElementById('current_medications').value = profile.current_medications || '';
            document.getElementById('alcohol_tobacco').value = profile.alcohol_tobacco || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Save profile
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
        blood_group: document.getElementById('blood_group').value,
        allergies: document.getElementById('allergies').value,
        past_medical_history: document.getElementById('past_medical_history').value,
        past_surgical_history: document.getElementById('past_surgical_history').value,
        current_medications: document.getElementById('current_medications').value,
        alcohol_tobacco: document.getElementById('alcohol_tobacco').value
    };
    
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Profile saved successfully!');
        } else {
            alert('Error saving profile');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Load profile on page load
loadProfile();
