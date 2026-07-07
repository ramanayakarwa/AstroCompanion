import { localLLM, ConversationMessage } from "./localLLM";

export interface ProcessedResponse {
  text: string;
  language: "en" | "hi";
  shouldSpeak: boolean;
  processingTime: number;
  source: "llm" | "pattern" | "cache";
  confidence: number;
}

export class AIPreprocessor {
  private responseCache = new Map<string, ProcessedResponse>();
  private cacheSize = 30;

  // Detect language from text
  detectLanguage(input: string): "en" | "hi" {
    const hindiChars = /[\u0900-\u097F]/;
    return hindiChars.test(input) ? "hi" : "en";
  }

  // Check if query is simple enough for pattern matching
  isSimpleQuery(input: string): boolean {
    const trimmed = input.toLowerCase().trim();
    
    const simplePatterns = [
      // Greetings
      /^(hello|hi|hey|namaste|suprabhat|shubh sandhya)/i,
      /^(good morning|good afternoon|good evening)/i,
      // Farewells
      /^(bye|goodbye|see you|alvida)/i,
      // Thanks
      /^(thank|thanks|dhanyavad|shukriya)/i,
      // Basic questions
      /^(who are you|what is your name|tum kaun ho)/i,
      /^(how are you|kaise ho|aap kaise hain)/i
    ];

    return simplePatterns.some(pattern => pattern.test(trimmed));
  }

  // Get pattern-based response
  getPatternResponse(input: string, language: "en" | "hi"): string {
    const trimmed = input.toLowerCase();
    
    const responses = {
      en: {
        greetings: [
          "Hello! How can I help you today?",
          "Hi there! What would you like to know?",
          "Hey! Nice to hear from you. How can I assist?",
        ],
        thanks: [
          "You're welcome! Glad I could help.",
          "My pleasure! Always happy to assist.",
          "No problem at all! Let me know if you need anything else.",
        ],
        farewell: [
          "Goodbye! Have a wonderful day!",
          "Take care! Talk to you soon.",
          "Bye! Feel free to reach out anytime.",
        ],
        identity: [
          "I'm Priya, your friendly Indian AI assistant!",
          "I'm Priya, here to help you with anything you need.",
          "I'm Priya, your digital friend and assistant.",
        ],
        feeling: [
          "I'm doing great, thanks for asking! How about you?",
          "I'm wonderful! Ready to help you with anything.",
          "I'm excellent! What's on your mind today?",
        ]
      },
      hi: {
        greetings: [
          "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूँ?",
          "हैलो! आप क्या जानना चाहेंगे?",
          "हे! आपसे बात करके अच्छा लगा। मैं कैसे सहायता कर सकता हूँ?",
        ],
        thanks: [
          "आपका स्वागत है! खुशी हुई मदद कर पाने में।",
          "मेरी खुशी! हमेशा सहायता करने को तैयार हूँ।",
          "कोई बात नहीं! अगर कुछ और चाहिए तो बताइएगा।",
        ],
        farewell: [
          "अलविदा! आपका दिन शानदार गुजरे!",
          "ख्याल रखना! जल्द ही बात करते हैं।",
          "बाय! कभी भी बात करने के लिए संपर्क कर सकते हैं।",
        ],
        identity: [
          "मैं प्रिया हूं, आपकी दोस्ताना भारतीय AI सहायक!",
          "मैं प्रिया हूं, आपकी मदद के लिए यहां हूं।",
          "मैं प्रिया हूं, आपकी डिजिटल दोस्त और सहायक।",
        ],
        feeling: [
          "मैं बहुत अच्छा कर रही हूं, पूछने के लिए धन्यवाद! आप कैसे हैं?",
          "मैं शानदार हूं! आपकी मदद के लिए तैयार हूं।",
          "मैं बढ़िया हूं! आज आप क्या सोच रहे हैं?",
        ]
      }
    };

    // Check patterns
    if (/(hello|hi|hey|namaste)/i.test(trimmed)) {
      const greetings = responses[language].greetings;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (/(thank|dhanyavad|shukriya)/i.test(trimmed)) {
      const thanks = responses[language].thanks;
      return thanks[Math.floor(Math.random() * thanks.length)];
    }
    
    if (/(bye|goodbye|alvida)/i.test(trimmed)) {
      const farewells = responses[language].farewell;
      return farewells[Math.floor(Math.random() * farewells.length)];
    }
    
    if (/(who are you|tum kaun ho|what is your name)/i.test(trimmed)) {
      const identity = responses[language].identity;
      return identity[Math.floor(Math.random() * identity.length)];
    }
    
    if (/(how are you|kaise ho)/i.test(trimmed)) {
      const feeling = responses[language].feeling;
      return feeling[Math.floor(Math.random() * feeling.length)];
    }

    return language === "en"
      ? "I heard you, but I need a bit more context. Could you elaborate?"
      : "मैंने आपको सुना, लेकिन मुझे थोड़ा और संदर्भ चाहिए। क्या आप विस्तार से बता सकते हैं?";
  }

  // Process user input
  async processUserInput(
    userInput: string,
    useLLM: boolean = true
  ): Promise<ProcessedResponse> {
    const startTime = performance.now();
    
    // Detect language
    const language = this.detectLanguage(userInput);
    
    // Check cache first
    const cacheKey = `${language}:${userInput.toLowerCase().trim()}`;
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse) {
      console.log("Using cached response");
      return {
        ...cachedResponse,
        processingTime: performance.now() - startTime,
      };
    }
    
    let responseText: string;
    let source: "llm" | "pattern" | "cache" = "pattern";
    let confidence = 0.9;

    // Check if it's a simple query
    if (this.isSimpleQuery(userInput)) {
      responseText = this.getPatternResponse(userInput, language);
      source = "pattern";
      confidence = 0.95;
    } else if (useLLM) {
      try {
        // Use LLM for complex queries
        responseText = await localLLM.generateResponse(userInput, language);
        source = "llm";
        confidence = 0.85;
        
        // Cache the response
        this.cacheResponse(cacheKey, {
          text: responseText,
          language,
          shouldSpeak: true,
          processingTime: performance.now() - startTime,
          source,
          confidence,
        });
      } catch (error) {
        console.warn("LLM failed, using pattern response:", error);
        responseText = this.getPatternResponse(userInput, language);
        source = "pattern";
        confidence = 0.7;
      }
    } else {
      responseText = this.getPatternResponse(userInput, language);
      source = "pattern";
      confidence = 0.9;
    }

    const processingTime = performance.now() - startTime;

    const response: ProcessedResponse = {
      text: responseText,
      language,
      shouldSpeak: true,
      processingTime,
      source,
      confidence,
    };

    return response;
  }

  // Cache response
  private cacheResponse(key: string, response: ProcessedResponse): void {
    this.responseCache.set(key, response);
    
    // Limit cache size
    if (this.responseCache.size > this.cacheSize) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }

  // Clear cache
  clearCache(): void {
    this.responseCache.clear();
  }
}

// Singleton instance
export const aiProcessor = new AIPreprocessor();