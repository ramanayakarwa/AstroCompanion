// --- MAITRI COGNITIVE ENGINE V5.0 (HYBRID INTELLIGENCE) ---

// This function maps basic emotions for dashboard data.
export const mapEmotionToState = (emotion: string) => {
  const states: { [key: string]: { mood: number; stress: number; cognitive: string } } = {
    happy:     { mood: 100, stress: 5,  cognitive: 'Engaged' },
    neutral:   { mood: 70,  stress: 20, cognitive: 'Focused' },
    surprised: { mood: 75,  stress: 30, cognitive: 'Alert' },
    sad:       { mood: 20,  stress: 70, cognitive: 'Low Mood' },
    angry:     { mood: 10,  stress: 90, cognitive: 'Frustrated' },
    fearful:   { mood: 15,  stress: 95, cognitive: 'Anxious' },
    disgusted: { mood: 25,  stress: 60, cognitive: 'Stressed' },
    default:   { mood: 50,  stress: 50, cognitive: 'Nominal' }
  };
  return states[emotion] || states.default;
};

// --- THIS IS MAITRI'S OWN, BUILT-IN INTELLIGENCE ---
export const getMaitriRecommendation = (cognitiveState: string, confidence: number) => {
    if (confidence < 0.70) {
        return "Maintaining cognitive baseline. Signal is stable but indistinct.";
    }
    switch(cognitiveState) {
        case 'Engaged': 
            return "Positive engagement detected. This is an excellent state for collaborative tasks.";
        case 'Focused': 
            return "High focus detected. Optimal state for complex, mission-critical procedures.";
        case 'Alert': 
            return "Heightened alertness noted. Is everything with the mission systems nominal?";
        case 'Low Mood': 
            const tips = [
                "I'm detecting a sustained low mood. Sometimes talking can help. Would you like to open a private voice log?",
                "This emotional signature is often related to fatigue. Have you had a chance to rest recently?"
            ];
            return tips[Math.floor(Math.random() * tips.length)];
        case 'Frustrated': 
             return "A strong stress signature detected. Focused breathing can be very effective. Would you like to begin a 2-minute exercise?";
        case 'Anxious': 
            return "Anxiety indicators are elevated. A mindfulness exercise from the mission tablet could be beneficial.";
        case 'Stressed': 
            return "General stress detected. Ensure hydration and check your personal schedule for upcoming breaks.";
        default: 
            return "Monitoring cognitive and emotional state.";
    }
}

// --- THIS IS MAITRI'S "SPECIALIST CONSULTANT" ---
// It is only called for specific, persistent issues.
export const getAdvancedCreativeSuggestion = async (cognitiveState: string): Promise<string> => {
    const GEMINI_API_KEY = ""; // Provided by the environment.
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `An astronaut is in a persistent state of "${cognitiveState}". Generate a novel, non-obvious, and creative suggestion (1-2 sentences) for a pattern-interrupt activity they can do in a space station to improve their mood. Be caring and insightful.`;

    const payload = {
      "systemInstruction": { "parts": { "text": "You are Maitri, an AI companion for astronauts, acting as a specialist consultant." } },
      "contents": [{ "parts": [{ "text": prompt }] }],
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) return "My advanced analysis is currently offline. Let's try a standard breathing exercise.";
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's try a standard breathing exercise.";
    } catch (error) {
        return "Connection to the creative core is unstable. Let's stick to basics for now.";
    }
};

