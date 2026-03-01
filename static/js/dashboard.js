async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        alert('Error logging out');
    }
}

async function viewHistory() {
    const historySection = document.getElementById('historySection');
    const consultationList = document.getElementById('consultationList');
    
    historySection.style.display = 'block';
    consultationList.innerHTML = '<p>Loading...</p>';
    
    // This would fetch from backend in a real implementation
    // For now, showing placeholder
    consultationList.innerHTML = `
        <div class="card">
            <p>No consultation history available yet.</p>
            <p>Start a new diagnosis to create your first consultation record.</p>
        </div>
    `;
}
