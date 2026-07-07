import { aiProcessor, ProcessedResponse } from "./localAI";
import { localLLM } from "./localLLM";

interface VoiceConfig {
  language: "en" | "hi";
  voiceProfile: string;
  volume: number;
  rate: number;
  pitch: number;
}

interface AssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  lastInteraction: number;
  conversationCount: number;
}

export class IndianVoiceAssistant {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private config: VoiceConfig;
  private state: AssistantState;
  private onTranscript: (text: string) => void;
  private onResponse: (text: string, language: "en" | "hi") => void;
  private onStatusChange: (status: AssistantState) => void;
  private onError: (error: string) => void;
  private abortController: AbortController | null = null;

  constructor(
    onTranscript: (text: string) => void,
    onResponse: (text: string, language: "en" | "hi") => void,
    onStatusChange: (status: AssistantState) => void,
    onError: (error: string) => void
  ) {
    this.onTranscript = onTranscript;
    this.onResponse = onResponse;
    this.onStatusChange = onStatusChange;
    this.onError = onError;

    this.config = {
      language: "en",
      voiceProfile: "female",
      volume: 1.0,
      rate: 1.0,
      pitch: 1.0,
    };

    this.state = {
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      lastInteraction: 0,
      conversationCount: 0,
    };

    this.initializeSpeechAPI();
    this.initializeLLM();
  }

  private async initializeLLM(): Promise<void> {
    // Initialize LLM in background
    setTimeout(async () => {
      try {
        await localLLM.initialize();
        console.log("LLM initialized in background");
      } catch (error) {
        console.warn("LLM background initialization failed:", error);
      }
    }, 2000);
  }

  private initializeSpeechAPI(): void {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.configureRecognition();
      } else {
        this.onError("Speech recognition not supported in this browser");
      }
    }
  }

  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.updateState({ isListening: true });
    };

    this.recognition.onend = () => {
      this.updateState({ isListening: false });
      // Auto-restart if we were listening
      if (this.state.isListening) {
        setTimeout(() => this.startListening(), 500);
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      this.onError(`Speech error: ${event.error}`);
      this.updateState({ isListening: false });
    };

    this.recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

      if (transcript && event.results[0].isFinal) {
        this.onTranscript(transcript);
        await this.processVoiceInput(transcript);
      }
    };
  }

  private updateState(updates: Partial<AssistantState>): void {
    this.state = { ...this.state, ...updates };
    this.onStatusChange(this.state);
  }

  // Start voice recognition
  startListening(): void {
    if (!this.recognition) {
      this.onError("Speech recognition not available");
      return;
    }

    try {
      // Set language for recognition
      const langCode = this.config.language === "hi" ? "hi-IN" : "en-IN";
      this.recognition.lang = langCode;

      this.recognition.start();
      this.updateState({ isListening: true });
    } catch (error: any) {
      this.onError(`Failed to start listening: ${error.message}`);
    }
  }

  // Stop voice recognition
  stopListening(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
      this.updateState({ isListening: false });
    }
  }

  // Process voice input
  private async processVoiceInput(transcript: string): Promise<void> {
    this.updateState({ isProcessing: true });

    try {
      // Process the input
      const response: ProcessedResponse = await aiProcessor.processUserInput(
        transcript,
        true // Use LLM
      );

      // Update conversation count
      this.updateState({
        conversationCount: this.state.conversationCount + 1,
        lastInteraction: Date.now(),
        isProcessing: false,
      });

      // Send response to callback
      this.onResponse(response.text, response.language);

      // Speak the response
      if (response.shouldSpeak) {
        await this.speakResponse(response.text, response.language);
      }
    } catch (error: any) {
      console.error("Error processing voice input:", error);
      this.onError("Processing failed, please try again");
      this.updateState({ isProcessing: false });
    }
  }

  // Speak response
  async speakResponse(text: string, language: "en" | "hi" = "en"): Promise<void> {
    if (!this.synthesis) {
      console.warn("Speech synthesis not available");
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.volume = this.config.volume;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;

      // Try to find an Indian voice
      const voices = this.synthesis!.getVoices();
      const indianVoices = voices.filter(voice => 
        voice.lang.startsWith("en-IN") || voice.lang.startsWith("hi-IN") ||
        voice.name.toLowerCase().includes("india") ||
        voice.name.toLowerCase().includes("indian")
      );

      if (indianVoices.length > 0) {
        utterance.voice = indianVoices[0];
      }

      utterance.onstart = () => {
        this.updateState({ isSpeaking: true });
      };

      utterance.onend = () => {
        this.updateState({ isSpeaking: false });
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        this.updateState({ isSpeaking: false });
        reject(new Error("Speech synthesis failed"));
      };

      this.synthesis!.speak(utterance);
    });
  }

  // Update configuration
  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update recognition language if changed
    if (config.language && this.recognition) {
      const langCode = config.language === "hi" ? "hi-IN" : "en-IN";
      this.recognition.lang = langCode;
    }
  }

  // Get current configuration
  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  // Get current state
  getState(): AssistantState {
    return { ...this.state };
  }

  // Reset conversation
  resetConversation(): void {
    localLLM.clearHistory();
    this.updateState({
      conversationCount: 0,
      lastInteraction: 0,
    });
  }

  // Toggle listening
  toggleListening(): void {
    if (this.state.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Stop all
  stopAll(): void {
    this.stopListening();
    
    if (this.synthesis) {
      this.synthesis.cancel();
      this.updateState({ isSpeaking: false });
    }
    
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // Check if speech available
  isSpeechAvailable(): boolean {
    return !!this.synthesis;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }
}

export default IndianVoiceAssistant;
