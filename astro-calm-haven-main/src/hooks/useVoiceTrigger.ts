import { useState, useEffect, useCallback, useRef } from "react";
import IndianVoiceAssistant from "../lib/indianVoiceAssistant";
import { localLLM } from "../lib/localLLM";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface VoiceProfile {
  id: string;
  name: string;
  accent: string;
  gender: string;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isVoiceEnabled: boolean;
  language: 'english' | 'hindi';
  volume: number;
  chatHistory: ChatMessage[];
  voiceProfiles: VoiceProfile[];
  currentVoiceProfile: string;
  speechSupported: boolean;
  transcript: string;
  response: string;
  error: string | null;
  modelStatus: {
    isLoaded: boolean;
    isInitializing: boolean;
  };
}

export const useVoiceTrigger = () => {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isVoiceEnabled: true,
    language: 'english',
    volume: 1.0,
    chatHistory: [],
    voiceProfiles: [
      { id: 'female-indian', name: 'Indian Female', accent: 'Indian', gender: 'Female' },
      { id: 'male-indian', name: 'Indian Male', accent: 'Indian', gender: 'Male' },
    ],
    currentVoiceProfile: 'female-indian',
    speechSupported: typeof window !== 'undefined' && 
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window)),
    transcript: "",
    response: "",
    error: null,
    modelStatus: {
      isLoaded: false,
      isInitializing: false,
    },
  });

  const assistantRef = useRef<IndianVoiceAssistant | null>(null);
  const isInitializedRef = useRef(false);

  const initializeAssistant = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      console.log("Initializing voice assistant...");
      isInitializedRef.current = true;

      // Initialize LLM
      setState(prev => ({
        ...prev,
        modelStatus: { ...prev.modelStatus, isInitializing: true }
      }));

      const llmInitialized = await localLLM.initialize();

      setState(prev => ({
        ...prev,
        modelStatus: {
          isLoaded: llmInitialized,
          isInitializing: false,
        }
      }));

      // Initialize voice assistant
      assistantRef.current = new IndianVoiceAssistant(
        (transcript: string) => {
          console.log("Transcript:", transcript);
          
          // Add user message to chat history
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date(),
          };

          setState(prev => ({
            ...prev,
            transcript,
            chatHistory: [...prev.chatHistory, newMessage],
            error: null,
          }));
        },
        (response: string, responseLanguage: 'en' | 'hi') => {
          console.log("Assistant response:", response);
          
          // Add assistant message to chat history
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: response,
            sender: 'assistant',
            timestamp: new Date(),
          };

          setState(prev => ({
            ...prev,
            response,
            chatHistory: [...prev.chatHistory, newMessage],
          }));
        },
        (status) => {
          setState(prev => ({
            ...prev,
            isListening: status.isListening,
            isSpeaking: status.isSpeaking,
            isProcessing: status.isProcessing,
          }));
        },
        (error: string) => {
          console.error("Assistant error:", error);
          setState(prev => ({ ...prev, error }));
        }
      );

      // Update language configuration
      assistantRef.current.updateConfig({ 
        language: state.language === 'hindi' ? 'hi' : 'en' 
      });

      console.log("Voice assistant initialized successfully");

    } catch (error: any) {
      console.error("Failed to initialize assistant:", error);
      setState(prev => ({
        ...prev,
        error: error.message,
        modelStatus: { ...prev.modelStatus, isInitializing: false }
      }));
    }
  }, [state.language]);

  const startListening = useCallback(async () => {
    if (!assistantRef.current) {
      console.warn("Assistant not initialized");
      return;
    }

    try {
      assistantRef.current.startListening();
      setState(prev => ({ ...prev, error: null }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (assistantRef.current) {
      assistantRef.current.stopListening();
    }
  }, []);

  const toggleVoice = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isVoiceEnabled: !prev.isVoiceEnabled 
    }));
  }, []);

  const setVoiceProfile = useCallback((profileId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentVoiceProfile: profileId 
    }));
  }, []);

  const setLanguage = useCallback((language: 'english' | 'hindi') => {
    setState(prev => ({ 
      ...prev, 
      language 
    }));
    
    // Update assistant language if initialized
    if (assistantRef.current) {
      assistantRef.current.updateConfig({ 
        language: language === 'hindi' ? 'hi' : 'en' 
      });
    }
  }, []);

  const clearChat = useCallback(() => {
    if (assistantRef.current) {
      assistantRef.current.resetConversation();
    }
    setState(prev => ({
      ...prev,
      chatHistory: [],
      transcript: "",
      response: "",
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ 
      ...prev, 
      volume 
    }));
    
    // Update assistant volume if initialized
    if (assistantRef.current) {
      assistantRef.current.updateConfig({ volume });
    }
  }, []);

  const simulateVoiceMessage = useCallback((message: string) => {
    // Simulate receiving a voice message
    if (assistantRef.current && state.isVoiceEnabled) {
      // Trigger the assistant to process this as if it were a voice input
      const event = new Event('simulated-voice');
      (window as any).simulatedMessage = message;
      window.dispatchEvent(event);
    }
  }, [state.isVoiceEnabled]);

  const speakResponse = useCallback((text: string) => {
    if (assistantRef.current && state.isVoiceEnabled) {
      const language = state.language === 'hindi' ? 'hi' : 'en';
      return assistantRef.current.speakResponse(text, language);
    }
  }, [state.isVoiceEnabled, state.language]);

  const toggleListening = useCallback(() => {
    if (!assistantRef.current) return;
    
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const getAssistantState = useCallback(() => {
    if (assistantRef.current) {
      return assistantRef.current.getState();
    }
    return null;
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAssistant();

    return () => {
      if (assistantRef.current) {
        assistantRef.current.stopAll();
      }
    };
  }, [initializeAssistant]);

  // Handle simulated voice messages
  useEffect(() => {
    const handleSimulatedVoice = () => {
      const message = (window as any).simulatedMessage;
      if (message && assistantRef.current) {
        // Process the simulated message
        const event = new CustomEvent('voice-input', { detail: message });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('simulated-voice', handleSimulatedVoice);
    return () => {
      window.removeEventListener('simulated-voice', handleSimulatedVoice);
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    startListening,
    stopListening,
    toggleVoice,
    setVoiceProfile,
    setLanguage,
    clearChat,
    setVolume,
    simulateVoiceMessage,
    speakResponse,
    toggleListening,
    getAssistantState,
  };
};