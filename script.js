// TriageCare AI Chat Interface
class TriageCareChat {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.startTriageBtn = document.getElementById('start-triage-btn');
        this.conversationHistory = [];
        this.currentSymptoms = [];
        
        this.initializeChat();
        this.bindEvents();
    }

    initializeChat() {
        this.addMessage('bot', 'AI', 'Hello! I\'m TriageCare AI, your medical intake assistant. Please describe your symptoms or health concerns, and I\'ll help guide you to the appropriate care.');
    }

    bindEvents() {
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.startTriageBtn?.addEventListener('click', () => {
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
        });
    }

    addMessage(type, sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        messageDiv.innerHTML = `
            <div class="avatar">${sender === 'AI' ? 'AI' : 'U'}</div>
            <div class="text">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        `;
        
        this.chatWindow.appendChild(messageDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', 'User', message);
        this.userInput.value = '';
        this.conversationHistory.push(`User: ${message}`);
        
        // Show typing indicator
        this.showTyping();
        
        const response = await this.getAIResponse(message);
        this.hideTyping();
        this.addMessage('bot', 'AI', response);
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.innerHTML = `
            <div class="avatar">AI</div>
            <div class="text">Analyzing your symptoms...</div>
        `;
        this.chatWindow.appendChild(typingDiv);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    hideTyping() {
        const typing = this.chatWindow.querySelector('.typing');
        if (typing) typing.remove();
    }

    async getAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        this.conversationHistory.push(userMessage);
        
        // Handle greetings
        if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return 'Hello! I\'m TriageCare AI. Please describe your symptoms and I\'ll provide appropriate recommendations based on severity.';
        }
        
        // Check for multiple symptoms in one message
        const symptoms = this.extractSymptoms(userMessage);
        if (symptoms.length > 0) {
            this.currentSymptoms = [...new Set([...this.currentSymptoms, ...symptoms])];
        }
        
        // Handle follow-up questions about existing symptoms
        if (this.isFollowUpQuestion(lowerMessage) && this.currentSymptoms.length > 0) {
            return this.handleFollowUp(lowerMessage);
        }
        
        // Get medical recommendation for new symptoms
        const recommendation = SYMPTOM_CLASSIFIER.getRecommendation(userMessage);
        
        if (recommendation) {
            let response = `**${recommendation.severity} SEVERITY**\n\n`;
            
            if (recommendation.severity === 'SEVERE') {
                response += `🚨 **${recommendation.action}**\n\n${recommendation.advice}`;
            } else {
                response += `**Condition:** ${recommendation.condition}\n\n`;
                
                if (recommendation.medicines) {
                    response += '**Recommended Medications:**\n';
                    recommendation.medicines.forEach(med => {
                        response += `• ${med.name}: ${med.dose} (Max: ${med.maxDaily}/day)\n`;
                    });
                    response += '\n';
                }
                
                response += `**Advice:** ${recommendation.advice}`;
                
                if (recommendation.severity === 'MEDIUM') {
                    response += '\n\n⚠️ Monitor symptoms closely and consult a doctor if they worsen.';
                }
            }
            
            response += '\n\nDo you have any other symptoms or questions about your current condition?';
            return response;
        }
        
        // Handle pain-related queries intelligently
        if (lowerMessage.includes('pain') || lowerMessage.includes('hurt') || lowerMessage.includes('ache')) {
            let response = '**PAIN ASSESSMENT**\n\n';
            response += 'I understand you\'re experiencing pain. ';
            
            if (lowerMessage.includes('leg') || lowerMessage.includes('running') || lowerMessage.includes('exercise')) {
                const painRec = SYMPTOM_CLASSIFIER.getRecommendation('leg pain');
                if (painRec) {
                    response = `**${painRec.severity} SEVERITY - LEG PAIN**\n\n`;
                    response += '**Recommended Medications:**\n';
                    painRec.medicines.forEach(med => {
                        response += `• ${med.name}: ${med.dose} (Max: ${med.maxDaily}/day)\n`;
                    });
                    response += `\n**Advice:** ${painRec.advice}`;
                    response += '\n\nDo you have any other symptoms or questions?';
                    return response;
                }
            }
            
            response += 'To provide better guidance:\n\n';
            response += '• **Location**: Where exactly is the pain?\n';
            response += '• **Intensity**: Rate 1-10 (10 being unbearable)\n';
            response += '• **Duration**: How long have you had this pain?\n';
            response += '• **Cause**: Any recent injury or activity?\n\n';
            response += 'Please provide more details for specific recommendations.';
            return response;
        }
        
        // Try API call for unknown symptoms
        try {
            const context = this.currentSymptoms.length > 0 ? `Current symptoms discussed: ${this.currentSymptoms.join(', ')}. ` : '';
            const prompt = `You are TriageCare AI. ${context}User says: "${userMessage}". Provide helpful medical guidance and ask follow-up questions. Keep response under 100 words.`;
            
            const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.candidates[0].content.parts[0].text + '\n\nIs there anything else you\'d like to know?';
            }
        } catch (error) {
            console.log('API unavailable, using fallback');
        }
        
        return 'I\'m here to help with your health concerns. Could you describe your symptoms in more detail? For example, mention the location, intensity, and any activities that might have caused the issue.';
    }
    
    extractSymptoms(message) {
        const symptomKeywords = ['headache', 'fever', 'cough', 'cold', 'stomach pain', 'diarrhea', 'back pain', 'sore throat', 'chest pain', 'breathing', 'nausea', 'vomiting', 'leg pain', 'muscle pain'];
        const found = [];
        const lowerMessage = message.toLowerCase();
        
        // Check for pain-related terms
        if (lowerMessage.includes('pain in leg') || lowerMessage.includes('leg pain')) {
            found.push('leg pain');
        }
        if (lowerMessage.includes('muscle') && lowerMessage.includes('pain')) {
            found.push('muscle pain');
        }
        if (lowerMessage.includes('running') || lowerMessage.includes('exercise')) {
            found.push('exercise pain');
        }
        
        symptomKeywords.forEach(symptom => {
            if (lowerMessage.includes(symptom)) {
                found.push(symptom);
            }
        });
        
        return found;
    }
    
    isFollowUpQuestion(message) {
        const followUpKeywords = ['what about', 'also', 'and', 'plus', 'additionally', 'more', 'other', 'else'];
        return followUpKeywords.some(keyword => message.includes(keyword));
    }
    
    handleFollowUp(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check if asking about a specific symptom
        if (lowerMessage.includes('cough')) {
            const coughRec = SYMPTOM_CLASSIFIER.getRecommendation('cough');
            if (coughRec) {
                let response = `**For your cough (LOW SEVERITY):**\n\n`;
                response += '**Recommended Medications:**\n';
                coughRec.medicines.forEach(med => {
                    response += `• ${med.name}: ${med.dose} (Max: ${med.maxDaily}/day)\n`;
                });
                response += `\n**Advice:** ${coughRec.advice}`;
                response += '\n\nAnything else you\'d like to know about your symptoms?';
                return response;
            }
        }
        
        if (lowerMessage.includes('cold')) {
            const coldRec = SYMPTOM_CLASSIFIER.getRecommendation('cold');
            if (coldRec) {
                let response = `**For your cold (LOW SEVERITY):**\n\n`;
                response += '**Recommended Medications:**\n';
                coldRec.medicines.forEach(med => {
                    response += `• ${med.name}: ${med.dose} (Max: ${med.maxDaily}/day)\n`;
                });
                response += `\n**Advice:** ${coldRec.advice}`;
                response += '\n\nIs there anything else about your symptoms you\'d like to discuss?';
                return response;
            }
        }
        
        return `Based on your current symptoms (${this.currentSymptoms.join(', ')}), I can provide more specific guidance. What would you like to know more about?`;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TriageCareChat();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});