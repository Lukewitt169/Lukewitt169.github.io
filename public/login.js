document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (response.ok) {
        window.location.href = '/chat.html';
    } else {
        alert('Login failed');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const displayName = document.getElementById('displayName').value;
    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName })
    });
    if (response.ok) {
        alert('Signup successful');
        window.location.href = '/chat.html';
    } else {
        alert('Signup failed');
    }
});

document.getElementById('guestButton').addEventListener('click', () => {
    const displayName = prompt('Enter a display name:');
    if (displayName) {
        localStorage.setItem('displayName', displayName);
        window.location.href = '/chat.html';
    }
});
