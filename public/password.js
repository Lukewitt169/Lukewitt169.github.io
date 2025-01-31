document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('accessPassword').value;
    const response = await fetch('/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (response.ok) {
        window.location.href = '/login.html';
    } else {
        alert('Incorrect password');
    }
});
