// Medical Knowledge Base for TriageCare AI
const MEDICAL_KNOWLEDGE = {
    // LOW SEVERITY - Can be managed with OTC medications
    low: {
        'headache': {
            medicines: [
                { name: 'Paracetamol', dose: '500mg every 6 hours', maxDaily: '3g' },
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' }
            ],
            advice: 'Rest in a dark room, stay hydrated. If headache persists for more than 3 days, consult a doctor.'
        },
        'fever': {
            medicines: [
                { name: 'Paracetamol', dose: '500mg every 6 hours', maxDaily: '3g' },
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' }
            ],
            advice: 'Drink plenty of fluids, rest. Monitor temperature. If fever exceeds 102°F or lasts more than 3 days, see a doctor.'
        },
        'cough': {
            medicines: [
                { name: 'Dextromethorphan', dose: '15mg every 4 hours', maxDaily: '120mg' },
                { name: 'Honey', dose: '1-2 teaspoons as needed', maxDaily: 'No limit' }
            ],
            advice: 'Stay hydrated, use humidifier. Avoid smoking. If cough persists for more than 2 weeks, consult doctor.'
        },
        'cold': {
            medicines: [
                { name: 'Paracetamol', dose: '500mg every 6 hours', maxDaily: '3g' },
                { name: 'Saline nasal spray', dose: 'As needed', maxDaily: 'No limit' }
            ],
            advice: 'Rest, drink warm fluids, gargle with salt water. Symptoms should improve in 7-10 days.'
        },
        'leg pain': {
            medicines: [
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' },
                { name: 'Topical pain relief gel', dose: 'Apply 3-4 times daily', maxDaily: 'As directed' }
            ],
            advice: 'Rest the affected leg, apply ice for 15-20 minutes. Gentle stretching may help. If pain persists for more than 3 days, consult a doctor.'
        },
        'muscle pain': {
            medicines: [
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' },
                { name: 'Paracetamol', dose: '500mg every 6 hours', maxDaily: '3g' }
            ],
            advice: 'Rest, apply heat or cold therapy. Gentle massage may help. Stay hydrated and get adequate rest.'
        }
    },

    // MEDIUM SEVERITY - Requires monitoring, may need prescription
    medium: {
        'stomach pain': {
            medicines: [
                { name: 'Antacid', dose: '2 tablets after meals', maxDaily: '8 tablets' },
                { name: 'Omeprazole', dose: '20mg once daily', maxDaily: '20mg' }
            ],
            advice: 'Avoid spicy foods, eat small meals. If pain is severe or persists for more than 2 days, see a doctor immediately.'
        },
        'diarrhea': {
            medicines: [
                { name: 'ORS', dose: '1 packet in 200ml water', maxDaily: '6 packets' },
                { name: 'Loperamide', dose: '2mg after each loose stool', maxDaily: '16mg' }
            ],
            advice: 'Stay hydrated, eat bland foods. If blood in stool or fever develops, seek immediate medical care.'
        },
        'back pain': {
            medicines: [
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' },
                { name: 'Topical pain relief gel', dose: 'Apply 3-4 times daily', maxDaily: 'As directed' }
            ],
            advice: 'Apply heat/cold, gentle stretching. If pain radiates to legs or numbness occurs, see doctor immediately.'
        },
        'sore throat': {
            medicines: [
                { name: 'Throat lozenges', dose: '1 every 2 hours', maxDaily: '12 lozenges' },
                { name: 'Ibuprofen', dose: '400mg every 8 hours', maxDaily: '1.2g' }
            ],
            advice: 'Gargle with warm salt water, stay hydrated. If difficulty swallowing or high fever, consult doctor.'
        }
    },

    // SEVERE - Requires immediate medical attention
    severe: {
        'chest pain': {
            action: 'EMERGENCY - Call ambulance immediately',
            advice: 'This could be a heart attack. Do not drive yourself. Chew aspirin if not allergic while waiting for help.'
        },
        'difficulty breathing': {
            action: 'EMERGENCY - Seek immediate medical care',
            advice: 'Go to emergency room immediately. This could indicate serious respiratory or cardiac issues.'
        },
        'severe abdominal pain': {
            action: 'URGENT - Visit emergency room',
            advice: 'Severe abdominal pain may indicate appendicitis, gallbladder issues, or other serious conditions requiring immediate care.'
        },
        'high fever': {
            action: 'URGENT - Consult doctor immediately',
            advice: 'Fever above 103°F (39.4°C) requires immediate medical attention, especially with other symptoms.'
        },
        'severe headache': {
            action: 'URGENT - Seek immediate medical care',
            advice: 'Sudden severe headache could indicate stroke, meningitis, or other serious conditions.'
        }
    }
};

// Symptom severity classifier
const SYMPTOM_CLASSIFIER = {
    classifySymptom(symptom) {
        const lowerSymptom = symptom.toLowerCase();
        
        // Severe symptoms (keywords that indicate emergency)
        const severeKeywords = ['chest pain', 'difficulty breathing', 'severe', 'unbearable', 'emergency', 'can\'t breathe', 'heart attack', 'stroke'];
        if (severeKeywords.some(keyword => lowerSymptom.includes(keyword))) {
            return 'severe';
        }
        
        // Medium symptoms
        const mediumKeywords = ['stomach', 'abdominal', 'diarrhea', 'vomiting', 'back pain', 'sore throat', 'persistent'];
        if (mediumKeywords.some(keyword => lowerSymptom.includes(keyword))) {
            return 'medium';
        }
        
        // Low symptoms (common, manageable conditions)
        const lowKeywords = ['headache', 'fever', 'cough', 'cold', 'runny nose', 'sneezing', 'mild', 'leg pain', 'muscle pain', 'running', 'exercise'];
        if (lowKeywords.some(keyword => lowerSymptom.includes(keyword))) {
            return 'low';
        }
        
        return 'medium'; // Default to medium if unsure
    },
    
    getRecommendation(symptom) {
        const severity = this.classifySymptom(symptom);
        const lowerSymptom = symptom.toLowerCase();
        
        if (severity === 'severe') {
            // Find matching severe condition
            for (const [condition, data] of Object.entries(MEDICAL_KNOWLEDGE.severe)) {
                if (lowerSymptom.includes(condition.replace(' ', ''))) {
                    return {
                        severity: 'SEVERE',
                        condition,
                        action: data.action,
                        advice: data.advice
                    };
                }
            }
            return {
                severity: 'SEVERE',
                action: 'URGENT - Consult doctor immediately',
                advice: 'Your symptoms may require immediate medical attention.'
            };
        }
        
        if (severity === 'medium') {
            // Find matching medium condition
            for (const [condition, data] of Object.entries(MEDICAL_KNOWLEDGE.medium)) {
                if (lowerSymptom.includes(condition.replace(' ', ''))) {
                    return {
                        severity: 'MEDIUM',
                        condition,
                        medicines: data.medicines,
                        advice: data.advice
                    };
                }
            }
        }
        
        if (severity === 'low') {
            // Find matching low condition
            for (const [condition, data] of Object.entries(MEDICAL_KNOWLEDGE.low)) {
                if (lowerSymptom.includes(condition)) {
                    return {
                        severity: 'LOW',
                        condition,
                        medicines: data.medicines,
                        advice: data.advice
                    };
                }
            }
        }
        
        return null;
    }
};