document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const startTriageBtn = document.getElementById('start-triage-btn');

    // System prompt for Gemini AI - Medical Triage Assistant
    const SYSTEM_PROMPT = `You are TriageCare AI, a helpful medical intake assistant for a hospital. Your role is to:

1. COLLECT INFORMATION (NOT DIAGNOSE):
   - Ask about symptoms, duration, severity
   - Inquire about medical history if relevant
   - Ask about current medications
   - Determine urgency level

2. TRIAGE CATEGORIES:
   - Emergency (life-threatening): Chest pain, difficulty breathing, severe bleeding, stroke symptoms
   - Urgent (same day): High fever, severe pain, persistent vomiting
   - Standard (1-3 days): Mild symptoms, routine concerns
   - Non-urgent (scheduled): Follow-ups, routine checkups

3. IMPORTANT RULES:
   - NEVER provide medical diagnoses
   - NEVER recommend specific treatments or medications
   - Always recommend seeing a healthcare provider
   - For emergencies, immediately advise calling emergency services
   - Be empathetic and professional
   - Keep responses concise (2-3 sentences)

4. SUGGEST DEPARTMENTS:
   - General Medicine, Cardiology, Orthopedics, Pediatrics, Emergency, etc.

5. OFFER TO:
   - Schedule appointments
   - Provide preparation instructions
   - Send reminders

Always start by greeting warmly and asking how you can help.`;

    let conversationHistory = [];
    let useAI = false;

    // Check if API is configured
    if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
        useAI = true;
        console.log('✅ Gemini AI enabled');
    } else {
        console.log('⚠️ Using fallback mode - Add API key to enable AI');
    }

    // Smooth scroll for hero button
    startTriageBtn.addEventListener('click', () => {
        document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            userInput.focus();
        }, 500);
    });

    // Add message to chat
    function addMessage(text, sender, isLoading = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.textContent = sender === 'bot' ? 'AI' : 'You';

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');

        if (isLoading) {
            textDiv.innerHTML = '<span class="typing-indicator">●●●</span>';
        } else {
            textDiv.textContent = text;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textDiv);

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        return messageDiv;
    }

    // Enhanced fallback triage logic (rule-based)
    function getFallbackResponse(userMessage) {
        const msg = userMessage.toLowerCase();

        // Emergency keywords - HIGHEST PRIORITY
        if (msg.includes('chest pain') || msg.includes('heart attack') ||
            msg.includes('can\'t breathe') || msg.includes('cannot breathe') ||
            msg.includes('difficulty breathing') || msg.includes('choking') ||
            msg.includes('severe bleeding') || msg.includes('unconscious') ||
            msg.includes('stroke') || msg.includes('seizure') ||
            msg.includes('suicide') || msg.includes('overdose')) {
            return "🚨 EMERGENCY: These symptoms require immediate attention. Please call 911 or go to the nearest emergency room right away. Do not wait.";
        }

        // Respiratory symptoms (cough, cold, flu)
        if (msg.includes('cough') || msg.includes('caugh') || msg.includes('coff')) {
            if (msg.includes('severe') || msg.includes('blood') || msg.includes('can\'t breathe')) {
                return "A severe cough with these symptoms needs urgent attention. I recommend seeing a doctor today. This could require examination by a General Physician or Pulmonologist. Would you like me to help schedule an appointment?";
            }
            return "I understand you have a cough. How long have you had it? Do you have any other symptoms like fever, body pain, or difficulty breathing? This will help me recommend the right department.";
        }

        if (msg.includes('cold') || msg.includes('runny nose') || msg.includes('sneezing') || msg.includes('sore throat')) {
            return "These sound like common cold symptoms. How long have you been experiencing this? Do you have fever or body pain? For mild cases, rest and fluids help, but I can connect you with a General Physician if symptoms persist beyond 3-4 days.";
        }

        if (msg.includes('flu') || msg.includes('influenza')) {
            return "Flu symptoms can be serious. Do you have high fever, body aches, or severe fatigue? I recommend seeing a General Physician, especially if symptoms are severe or you're in a high-risk group.";
        }

        // Fever
        if (msg.includes('fever') || msg.includes('temperature') || msg.includes('hot')) {
            if (msg.includes('high') || msg.includes('103') || msg.includes('104') || msg.includes('severe')) {
                return "High fever requires prompt attention. I recommend seeing a doctor today. Please visit our General Medicine department. In the meantime, stay hydrated and monitor your temperature.";
            }
            return "I see you have a fever. How high is your temperature? How long have you had it? Any other symptoms like cough, body pain, or headache? This will help determine if you need urgent care.";
        }

        // Pain symptoms
        if (msg.includes('body pain') || msg.includes('body ache') || msg.includes('muscle pain')) {
            return "Body pain can have various causes. Is it accompanied by fever, cough, or other symptoms? How long have you had this pain? For pain with fever and cough, this could be flu-like symptoms - I'd recommend a General Physician consultation.";
        }

        if (msg.includes('headache') || msg.includes('head pain')) {
            if (msg.includes('severe') || msg.includes('worst') || msg.includes('sudden')) {
                return "Severe or sudden headaches need urgent evaluation. Please see a doctor today or visit the emergency room if it's the worst headache you've ever had. I recommend our Neurology or Emergency department.";
            }
            return "I understand you have a headache. On a scale of 1-10, how severe is it? Do you have any other symptoms like fever, nausea, vision changes, or dizziness? This will help me guide you to the right care.";
        }

        if (msg.includes('stomach pain') || msg.includes('abdominal pain') || msg.includes('belly pain')) {
            return "Stomach pain needs evaluation. Is it sharp or dull? Where exactly is the pain? Do you have nausea, vomiting, or fever? I recommend seeing a Gastroenterologist or General Physician depending on severity.";
        }

        if (msg.includes('back pain') || msg.includes('spine pain')) {
            return "Back pain can range from mild to severe. Is it recent or chronic? Any numbness or tingling? I can connect you with an Orthopedic specialist or Physical Therapy depending on your needs.";
        }

        // Digestive issues
        if (msg.includes('vomit') || msg.includes('nausea') || msg.includes('throw up')) {
            if (msg.includes('blood') || msg.includes('severe') || msg.includes('can\'t keep')) {
                return "Severe vomiting or vomiting blood requires urgent care. Please see a doctor today or visit the emergency room. I recommend our Gastroenterology or Emergency department.";
            }
            return "Nausea and vomiting can be concerning. How long has this been happening? Any fever, abdominal pain, or diarrhea? I can help you schedule with a Gastroenterologist or General Physician.";
        }

        if (msg.includes('diarrhea') || msg.includes('loose motion')) {
            return "Diarrhea needs attention, especially if severe. How long have you had this? Any fever or blood in stool? Stay hydrated and I can connect you with a Gastroenterologist if it persists.";
        }

        // Injury/Trauma
        if (msg.includes('broken') || msg.includes('fracture') || msg.includes('sprain') || msg.includes('injury')) {
            return "Injuries need proper evaluation. Is there severe pain, swelling, or inability to move the affected area? I recommend seeing an Orthopedic specialist or visiting our Emergency department for immediate care.";
        }

        // Skin issues
        if (msg.includes('rash') || msg.includes('itching') || msg.includes('skin')) {
            return "Skin conditions should be examined. How long have you had this? Is it spreading or very itchy? I can connect you with a Dermatologist for proper diagnosis and treatment.";
        }

        // Mental health
        if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('depressed') || msg.includes('depression') || msg.includes('stress')) {
            return "Mental health is very important. I'm here to help connect you with support. Would you like to speak with a Psychiatrist or Counselor? We have professionals who can help you.";
        }

        // Appointment/scheduling
        if (msg.includes('appointment') || msg.includes('schedule') || msg.includes('book')) {
            return "I can help you schedule an appointment. Based on your symptoms, which department would you like to see? We have General Medicine, Cardiology, Orthopedics, Pediatrics, and more. What works best for you - morning or afternoon?";
        }

        // Greetings
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('helo')) {
            return "Hello! I'm TriageCare AI. I'm here to help you with your health concerns. Please describe your symptoms and I'll guide you to the right department. What brings you here today?";
        }

        // Thank you
        if (msg.includes('thank') || msg.includes('thanks')) {
            return "You're welcome! Is there anything else I can help you with? Remember, if you have any emergency symptoms, please call 911 or visit the ER immediately.";
        }

        // Default response - ask for more details
        return "I'm here to help. Can you describe your symptoms in more detail? For example, what are you experiencing, when did it start, and how severe is it? This will help me guide you to the right care.";
    }

    // Call Gemini AI API
    async function callGeminiAPI(userMessage) {
        try {
            conversationHistory.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const contents = [];
            if (conversationHistory.length === 1) {
                contents.push({
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + userMessage }]
                });
            } else {
                conversationHistory.forEach(msg => {
                    contents.push(msg);
                });
            }

            const requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 300,
                }
            };

            console.log('Calling Gemini API...');
            const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            const aiResponse = data.candidates[0].content.parts[0].text;

            conversationHistory.push({
                role: 'model',
                parts: [{ text: aiResponse }]
            });

            return aiResponse;

        } catch (error) {
            console.error('Gemini API Error:', error);
            useAI = false;
            return getFallbackResponse(userMessage);
        }
    }

    // Handle user message
    async function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;

        const loadingMessage = addMessage('', 'bot', true);
        await new Promise(resolve => setTimeout(resolve, 500));

        let aiResponse;
        if (useAI) {
            aiResponse = await callGeminiAPI(text);
        } else {
            aiResponse = getFallbackResponse(text);
        }

        loadingMessage.remove();
        addMessage(aiResponse, 'bot');

        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }

    sendBtn.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    // Mouse tracking for card glow effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.onmousemove = e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (msg.includes('diarrhea') || msg.includes('loose motion')) {
                return "Diarrhea needs attention, especially if severe. How long have you had this? Any fever or blood in stool? Stay hydrated and I can connect you with a Gastroenterologist if it persists.";
            }

            // Injury/Trauma
            if (msg.includes('broken') || msg.includes('fracture') || msg.includes('sprain') || msg.includes('injury')) {
                return "Injuries need proper evaluation. Is there severe pain, swelling, or inability to move the affected area? I recommend seeing an Orthopedic specialist or visiting our Emergency department for immediate care.";
            }

            // Skin issues
            if (msg.includes('rash') || msg.includes('itching') || msg.includes('skin')) {
                return "Skin conditions should be examined. How long have you had this? Is it spreading or very itchy? I can connect you with a Dermatologist for proper diagnosis and treatment.";
            }

            // Mental health
            if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('depressed') || msg.includes('depression') || msg.includes('stress')) {
                return "Mental health is very important. I'm here to help connect you with support. Would you like to speak with a Psychiatrist or Counselor? We have professionals who can help you.";
            }

            // Appointment/scheduling
            if (msg.includes('appointment') || msg.includes('schedule') || msg.includes('book')) {
                return "I can help you schedule an appointment. Based on your symptoms, which department would you like to see? We have General Medicine, Cardiology, Orthopedics, Pediatrics, and more. What works best for you - morning or afternoon?";
            }

            // Greetings
            if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('helo')) {
                return "Hello! I'm TriageCare AI. I'm here to help you with your health concerns. Please describe your symptoms and I'll guide you to the right department. What brings you here today?";
            }

            // Thank you
            if (msg.includes('thank') || msg.includes('thanks')) {
                return "You're welcome! Is there anything else I can help you with? Remember, if you have any emergency symptoms, please call 911 or visit the ER immediately.";
            }

            // Default response - ask for more details
            return "I'm here to help. Can you describe your symptoms in more detail? For example, what are you experiencing, when did it start, and how severe is it? This will help me guide you to the right care.";
        }

        // Call Gemini AI API
        async function callGeminiAPI(userMessage) {
            try {
                conversationHistory.push({
                    role: 'user',
                    parts: [{ text: userMessage }]
                });

                const contents = [];
                if (conversationHistory.length === 1) {
                    contents.push({
                        role: 'user',
                        parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + userMessage }]
                    });
                } else {
                    conversationHistory.forEach(msg => {
                        contents.push(msg);
                    });
                }

                const requestBody = {
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300,
                    }
                };

                console.log('Calling Gemini API...');
                const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('API Response:', data);

                const aiResponse = data.candidates[0].content.parts[0].text;

                conversationHistory.push({
                    role: 'model',
                    parts: [{ text: aiResponse }]
                });

                return aiResponse;

            } catch (error) {
                console.error('Gemini API Error:', error);
                useAI = false;
                return getFallbackResponse(userMessage);
            }
        }

        // Handle user message
        async function handleUserMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            userInput.value = '';
            userInput.disabled = true;
            sendBtn.disabled = true;

            const loadingMessage = addMessage('', 'bot', true);
            await new Promise(resolve => setTimeout(resolve, 500));

            let aiResponse;
            if (useAI) {
                aiResponse = await callGeminiAPI(text);
            } else {
                aiResponse = getFallbackResponse(text);
            }

            loadingMessage.remove();
            addMessage(aiResponse, 'bot');

            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }

        sendBtn.addEventListener('click', handleUserMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserMessage();
            }
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

        // Scroll-based background color transitions
        let ticking = false;

        function updateBackgroundOnScroll() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Calculate scroll percentage
            const scrollPercentage = scrollPosition / (documentHeight - windowHeight);

            // Define color stops for different sections
            if (scrollPosition < windowHeight * 0.5) {
                // Hero section - deep dark blue with purple tint
                document.body.style.backgroundColor = '#030712';
            } else if (scrollPosition < windowHeight * 1.5) {
                // Features section - slightly lighter with blue tint
                const progress = (scrollPosition - windowHeight * 0.5) / windowHeight;
                const r = Math.floor(3 + progress * 2);
                const g = Math.floor(7 + progress * 5);
                const b = Math.floor(18 + progress * 10);
                document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            } else if (scrollPosition < windowHeight * 2.5) {
                // Demo section - subtle purple-blue gradient
                const progress = (scrollPosition - windowHeight * 1.5) / windowHeight;
                const r = Math.floor(5 + progress * 3);
                const g = Math.floor(12 + progress * 8);
                const b = Math.floor(28 + progress * 12);
                document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            } else {
                // Footer area - return to original dark
                document.body.style.backgroundColor = '#030712';
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateBackgroundOnScroll);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);

        // Initial call
        updateBackgroundOnScroll();

        // Initial greeting
        setTimeout(() => {
            const greeting = useAI
                ? "Hello! I'm TriageCare AI powered by Gemini. I'm here to help you describe your symptoms and connect you with the right department. How can I assist you today?"
                : "Hello! I'm TriageCare AI. I'm here to help you describe your symptoms and connect you with the right department. How can I assist you today?";
            addMessage(greeting, 'bot');
        }, 500);
    });
