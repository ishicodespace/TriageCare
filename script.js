document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const startTriageBtn = document.getElementById('start-triage-btn');

    // Smooth scroll for hero button
    startTriageBtn.addEventListener('click', () => {
        document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
    });

    // Chat functionality
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.textContent = sender === 'bot' ? 'AI' : 'You';

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = text;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textDiv);

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        userInput.value = '';

        // Simulate AI thinking and response
        setTimeout(() => {
            const responses = [
                "I understand. Could you please tell me how long you've been experiencing this?",
                "Noted. On a scale of 1 to 10, how severe is the pain?",
                "I see. Do you have any existing medical conditions I should be aware of?",
                "Based on your description, I recommend scheduling a consultation with a General Physician. Shall I check availability?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, 'bot');
        }, 1000);
    }

    sendBtn.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    // Mouse tracking for card glow effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.onmousemove = e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };
    });
});
