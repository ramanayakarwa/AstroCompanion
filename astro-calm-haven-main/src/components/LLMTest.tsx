import React, { useState } from "react";
import { useVoiceTrigger } from "../hooks/useVoiceTrigger";

export const LLMTest: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    response,
    chatHistory, // Changed from conversationHistory
    error,
    modelStatus,
    startListening,
    stopListening,
    toggleListening,
    clearChat, // Changed from resetConversation
  } = useVoiceTrigger();

  const testQueries = [
    "How many planets are in the solar system?",
    "What's the capital of France?",
    "I'm feeling bored, suggest something",
    "Tell me a short story",
    "नमस्ते, कैसे हो?",
    "मुझे एक कहानी सुनाओ"
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Voice Assistant Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Panel */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Listening: {isListening ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isSpeaking ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span>Speaking: {isSpeaking ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isProcessing ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span>Processing: {isProcessing ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${modelStatus.isLoaded ? 'bg-green-500' : modelStatus.isInitializing ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span>LLM: {modelStatus.isLoaded ? 'Loaded' : modelStatus.isInitializing ? 'Loading...' : 'Not Loaded'}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Controls</h2>
          <div className="space-y-2">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <button
              onClick={clearChat} // Changed from resetConversation
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Reset Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Conversation</h2>
        <div className="bg-white border rounded-lg p-4 min-h-[200px]">
          {chatHistory.length === 0 ? ( // Changed from conversationHistory
            <p className="text-gray-500">No conversation yet. Start speaking or use test queries.</p>
          ) : (
            chatHistory.map((msg) => ( // Changed from conversationHistory
              <div key={msg.id} className="mb-4">
                <div className="text-sm text-gray-500">
                  {msg.sender === 'user' ? 'User' : 'Assistant'}: {/* Updated field */}
                </div>
                <div className="mb-2">{msg.text}</div>
                <hr className="my-2" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Queries */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Test Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {testQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => {
                // Simulate voice input
                const event = new CustomEvent('voice-input', { detail: query });
                window.dispatchEvent(event);
              }}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-left text-sm"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Current State */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Latest Input</h2>
          <div className="bg-yellow-50 p-3 rounded border">
            {transcript || "No input yet"}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Latest Response</h2>
          <div className="bg-green-50 p-3 rounded border">
            {response || "No response yet"}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};