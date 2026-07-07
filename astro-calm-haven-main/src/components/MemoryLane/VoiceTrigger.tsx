import React, { useState, useEffect } from 'react';
import './MemoryLane.css';

interface VoiceTriggerProps {
  onVoiceCommand: (text: string) => void;
}

const VoiceTrigger: React.FC<VoiceTriggerProps> = ({ onVoiceCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onVoiceCommand(text);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setSupported(false);
    }
  }, [onVoiceCommand]);

  const toggleListening = () => {
    if (!supported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const handleManualCommand = () => {
    const command = prompt('Enter a voice command (e.g., "I miss my family"):');
    if (command) {
      setTranscript(command);
      onVoiceCommand(command);
    }
  };

  return (
    <div className="voice-trigger">
      <div className="voice-controls">
        <button 
          onClick={toggleListening}
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          disabled={!supported}
        >
          {isListening ? (
            <>
              <span className="pulse-dot"></span>
              Listening... Click to stop
            </>
          ) : (
            '🎤 Click to speak'
          )}
        </button>
        
        <button 
          onClick={handleManualCommand}
          className="manual-voice-btn"
        >
          Type command
        </button>
      </div>

      {transcript && (
        <div className="voice-transcript">
          <strong>You said:</strong> "{transcript}"
        </div>
      )}

      {!supported && (
        <div className="voice-not-supported">
          <small>Voice recognition not supported. Use "Type command" button.</small>
        </div>
      )}

      <div className="voice-examples">
        <small>Try saying: "I miss my family", "Show me home", "I feel lonely"</small>
      </div>
    </div>
  );
};

export default VoiceTrigger;