# TriageCare AI - Setup Instructions

## Getting Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select a Google Cloud project (or create a new one)
   - Copy the generated API key

3. **Add API Key to Project**
   - Open `config.js` in your project
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key
   - Example: `GEMINI_API_KEY: 'AIzaSyD...'`

## Important Security Notes

⚠️ **NEVER commit your API key to GitHub or share it publicly!**

- Add `config.js` to `.gitignore`
- For production, use environment variables
- Consider using Firebase Functions or a backend server

## Testing the Chatbot

1. Open `index.html` in your browser
2. Scroll to the "Experience the Future" section
3. Type a symptom (e.g., "I have a headache and fever")
4. The AI will respond with triage questions

## How It Works

The chatbot follows these rules:

### ✅ What it DOES:
- Asks about symptoms, duration, and severity
- Categorizes urgency (Emergency, Urgent, Standard, Non-urgent)
- Suggests appropriate departments
- Offers to schedule appointments
- Provides empathetic, professional responses

### ❌ What it DOES NOT do:
- Provide medical diagnoses
- Recommend specific treatments or medications
- Replace professional medical advice
- Store personal health information (in this demo)

## Triage Categories

1. **Emergency** (Call 911 immediately)
   - Chest pain, difficulty breathing
   - Severe bleeding, stroke symptoms
   - Loss of consciousness

2. **Urgent** (Same day appointment)
   - High fever (>103°F)
   - Severe pain
   - Persistent vomiting

3. **Standard** (1-3 days)
   - Mild symptoms
   - Routine concerns
   - Follow-up needed

4. **Non-urgent** (Scheduled)
   - Routine checkups
   - Preventive care
   - Follow-ups

## Customizing the AI Behavior

Edit the `SYSTEM_PROMPT` in `script.js` to:
- Add hospital-specific departments
- Include your hospital's protocols
- Adjust tone and language
- Add multilingual support

## Troubleshooting

**"API key not configured" message?**
- Make sure you've added your API key to `config.js`
- Check that `config.js` is loaded before `script.js` in `index.html`

**API errors?**
- Verify your API key is valid
- Check your Google Cloud project has Gemini API enabled
- Ensure you haven't exceeded rate limits

**No response from AI?**
- Check browser console for errors (F12)
- Verify internet connection
- Check API quota in Google Cloud Console

## Next Steps for Production

1. **Backend Integration**
   - Move API calls to a secure backend
   - Use Firebase Cloud Functions or Node.js server
   - Implement proper authentication

2. **Database Integration**
   - Store conversation history
   - Track triage outcomes
   - Generate analytics

3. **Enhanced Features**
   - Voice input/output
   - Multi-language support
   - Integration with hospital EHR systems
   - Appointment scheduling API

## Support

For issues or questions:
- Check the README.md
- Review the code comments
- Test with simple queries first
