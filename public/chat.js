document.getElementById('sendButton').addEventListener('click', async () => {
    const message = document.getElementById('messageInput').value;
    const displayName = localStorage.getItem('displayName') || 'Anonymous';
    await fetch('/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${displayName}: ${message}` })
    });
    document.getElementById('messageInput').value = '';
});

document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});
