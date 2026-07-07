import * as webllm from "@mlc-ai/web-llm";

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: 'en' | 'hi';
}

interface ModelProgress {
  text: string;
  progress: number;
}

export class LocalLLMAssistant {
  private engine: webllm.MLCEngineInterface | null = null;
  private modelLoaded = false;
  private conversationHistory: ConversationMessage[] = [];
  private readonly maxHistoryLength = 8;
  private currentSystemPrompt: string;
  private onProgress?: (progress: ModelProgress) => void;
  private modelName: string = "Phi-3.2-mini-4k-instruct-q4f16_1-MLC";
  
  constructor() {
    this.currentSystemPrompt = this.getDefaultSystemPrompt('en');
  }
  
  // Set progress callback
  setProgressCallback(callback: (progress: ModelProgress) => void): void {
    this.onProgress = callback;
  }
  
  private getDefaultSystemPrompt(language: 'en' | 'hi'): string {
    const prompts = {
      en: `You are Priya, a friendly Indian AI assistant. You speak like a warm, caring friend with an Indian cultural context. 
You can speak both English and Hindi (use Devanagari script for Hindi). 
Be concise (1-2 sentences usually), factual, and emotionally intelligent.
If asked about feelings, be supportive. If asked facts, be accurate.
Mix languages naturally like many Indians do (Hinglish).
Personality: Warm, helpful, occasionally uses Indian phrases like "achha", "arey", "wah" appropriately.
Keep responses conversational and natural for voice.`,
      
      hi: `आप प्रिया हैं, एक दोस्ताना भारतीय AI सहायक। आप एक गर्मजोशी से भरे, देखभाल करने वाले दोस्त की तरह बात करती हैं।
आप अंग्रेजी और हिंदी दोनों बोल सकती हैं। 
संक्षिप्त रहें (आमतौर पर 1-2 वाक्य), तथ्यात्मक, और भावनात्मक रूप से बुद्धिमान।
अगर भावनाओं के बारे में पूछा जाए, तो सहायक बनें। अगर तथ्य पूछे जाएं, तो सटीक रहें।
कई भारतीयों की तरह प्राकृतिक रूप से भाषाओं को मिलाएं (हिंग्लिश)।
व्यक्तित्व: गर्मजोशी से भरा, मददगार, कभी-कभी "अच्छा", "अरे", "वाह" जैसे भारतीय वाक्यांशों का उपयोग करें।
आवाज के लिए संवादात्मक और प्राकृतिक प्रतिक्रियाएं दें।`
    };
    
    return prompts[language];
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing WebLLM...');
      
      if (this.onProgress) {
        this.onProgress({
          text: 'Starting model initialization...',
          progress: 0
        });
      }
      
      // Create progress callback
      const initProgressCallback = (report: webllm.InitProgressReport) => {
        const progressText = report.text || 'Loading model...';
        const progressValue = report.progress || 0;
        
        console.log(`WebLLM Progress: ${progressText} (${(progressValue * 100).toFixed(1)}%)`);
        
        if (this.onProgress) {
          this.onProgress({
            text: progressText,
            progress: progressValue
          });
        }
      };
      
      // Create engine instance
      this.engine = await webllm.CreateMLCEngine(
        this.modelName,
        {
          initProgressCallback: initProgressCallback
        }
      );
      
      this.modelLoaded = true;
      
      // Initialize conversation with system prompt
      this.conversationHistory = [{
        role: 'system',
        content: this.currentSystemPrompt,
        language: 'en'
      }];
      
      console.log('WebLLM initialized successfully');
      
      if (this.onProgress) {
        this.onProgress({
          text: 'Model loaded and ready!',
          progress: 1
        });
      }
      
      return true;
      
    } catch (error: any) {
      console.error('Failed to initialize LLM:', error);
      
      if (this.onProgress) {
        this.onProgress({
          text: 'Failed to load LLM. Using pattern matching instead.',
          progress: 0
        });
      }
      
      return false;
    }
  }
  
  async generateResponse(
    userMessage: string,
    language: 'en' | 'hi' = 'en'
  ): Promise<string> {
    // Check if LLM is available
    if (!this.engine || !this.modelLoaded) {
      console.warn('LLM not available, using pattern matching');
      return this.getFallbackResponse(userMessage, language);
    }
    
    // Update system prompt if language changed
    const newSystemPrompt = this.getDefaultSystemPrompt(language);
    if (newSystemPrompt !== this.currentSystemPrompt) {
      this.currentSystemPrompt = newSystemPrompt;
      this.conversationHistory[0] = {
        role: 'system',
        content: newSystemPrompt,
        language
      };
    }
    
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      language
    });
    
    // Prepare messages for the API
    const messagesForAPI: webllm.ChatCompletionMessageParam[] = [
      ...this.conversationHistory
        .slice(-this.maxHistoryLength * 2) // Keep recent conversation
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
    ];
    
    console.log("Sending to LLM:", {
      messageCount: messagesForAPI.length,
      lastUserMessage: userMessage.substring(0, 100)
    });
    
    try {
      // Show generating status
      if (this.onProgress) {
        this.onProgress({
          text: 'Thinking...',
          progress: 0.5
        });
      }
      
      // Generate response
      const response = await this.engine.chat.completions.create({
        messages: messagesForAPI,
        stream: false,
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9,
      });
      
      const assistantResponse = response.choices[0]?.message?.content || 
        this.getFallbackResponse(userMessage, language);
      
      // Add to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
        language: this.detectLanguage(assistantResponse)
      });
      
      console.log("Generated response:", assistantResponse.substring(0, 100));
      
      if (this.onProgress) {
        this.onProgress({
          text: 'Response ready!',
          progress: 1
        });
      }
      
      return assistantResponse;
    } catch (error: any) {
      console.error('Error generating response:', error);
      
      if (this.onProgress) {
        this.onProgress({
          text: 'Error generating response',
          progress: 0
        });
      }
      
      return this.getFallbackResponse(userMessage, language);
    }
  }
  
  private getFallbackResponse(userMessage: string, language: 'en' | 'hi'): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Common factual responses
    if (lowerMessage.includes('planet') && lowerMessage.includes('solar')) {
      return language === 'en' 
        ? 'There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.'
        : 'हमारे सौर मंडल में 8 ग्रह हैं: बुध, शुक्र, पृथ्वी, मंगल, बृहस्पति, शनि, अरुण और वरुण।';
    }
    
    if (lowerMessage.includes('capital') && lowerMessage.includes('france')) {
      return language === 'en'
        ? 'The capital of France is Paris.'
        : 'फ्रांस की राजधानी पेरिस है।';
    }
    
    if (lowerMessage.includes('bored')) {
      return language === 'en'
        ? 'Why not try learning a new hobby? Maybe cooking an Indian dish or listening to some Bollywood music!'
        : 'क्यों न एक नया शौक सीखें? शायद एक भारतीय व्यंजन बनाना या कुछ बॉलीवुड संगीत सुनना!';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return language === 'en'
        ? 'Hello! I\'m Priya, your AI assistant. How can I help you today?'
        : 'नमस्ते! मैं प्रिया हूं, आपकी AI सहायक। आज मैं आपकी कैसे मदद कर सकती हूं?';
    }
    
    if (lowerMessage.includes('thank')) {
      return language === 'en'
        ? 'You\'re welcome! Happy to help.'
        : 'आपका स्वागत है! मदद करके खुशी हुई।';
    }
    
    if (lowerMessage.includes('story') || lowerMessage.includes('kahani')) {
      return language === 'en'
        ? 'Once upon a time in a small Indian village, there lived a wise old storyteller. Every evening, children would gather around him to hear tales of brave kings, clever animals, and magical adventures that taught important life lessons.'
        : 'एक बार एक छोटे से भारतीय गाँव में, एक बुद्धिमान बूढ़ा कहानीकार रहता था। हर शाम, बच्चे उसके आसपास इकट्ठा होते थे बहादुर राजाओं, चतुर जानवरों और जादुई साहसिक कारनामों की कहानियाँ सुनने के लिए जो महत्वपूर्ण जीवन के सबक सिखाती थीं।';
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('kaise ho')) {
      return language === 'en'
        ? 'I\'m doing great, thank you for asking! How can I help you today?'
        : 'मैं बहुत अच्छा कर रही हूं, पूछने के लिए धन्यवाद! आज मैं आपकी कैसे मदद कर सकती हूं?';
    }
    
    // Default fallback responses
    const fallbacks = {
      en: [
        "I understand you're asking something, but I'm having trouble processing it fully right now. Could you try rephrasing?",
        "That's an interesting question! Let me think about it... Actually, could you ask me something else for now?",
        "Hmm, I want to help you with that. Let's talk about something else while I get better at answering complex questions!"
      ],
      hi: [
        "मैं समझता हूं कि आप कुछ पूछ रहे हैं, लेकिन मुझे अभी इसे पूरी तरह से संसाधित करने में कठिनाई हो रही है। क्या आप इसे दूसरे शब्दों में कह सकते हैं?",
        "यह एक दिलचस्प सवाल है! मुझे इसके बारे में सोचने दो... असल में, क्या आप अभी मुझसे कुछ और पूछ सकते हैं?",
        "हम्म, मैं आपकी उससे मदद करना चाहता हूं। जब तक मैं जटिल सवालों के जवाब देने में बेहतर नहीं हो जाता, तब तक कुछ और बात करते हैं!"
      ]
    };
    
    const responses = fallbacks[language];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private detectLanguage(text: string): 'en' | 'hi' {
    // Simple language detection based on Devanagari characters
    const hindiChars = /[\u0900-\u097F]/;
    return hindiChars.test(text) ? 'hi' : 'en';
  }
  
  clearHistory(): void {
    // Keep only the system prompt
    if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory = [this.conversationHistory[0]];
    } else {
      this.conversationHistory = [];
    }
  }
  
  getStatus(): {
    isLoaded: boolean;
    model: string;
    conversationLength: number;
  } {
    return {
      isLoaded: this.modelLoaded,
      model: this.modelName,
      conversationLength: this.conversationHistory.length
    };
  }
}

// Export singleton instance
export const localLLM = new LocalLLMAssistant();