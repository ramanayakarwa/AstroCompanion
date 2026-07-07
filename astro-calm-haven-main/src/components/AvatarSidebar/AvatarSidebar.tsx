import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, VolumeX, Settings, X, Bot, Trash2, Loader2 } from 'lucide-react';
import { useVoiceTrigger } from '@/hooks/useVoiceTrigger';
import './AvatarSidebar.css';

interface AvatarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarSidebar: React.FC<AvatarSidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('voice'); // Default to voice tab
  
  const {
    chatHistory,
    isListening,
    isProcessing,
    isVoiceEnabled,
    voiceProfiles,
    currentVoiceProfile,
    startListening,
    stopListening,
    toggleVoice,
    setVoiceProfile,
    clearChat,
    volume,
    setVolume,
    speechSupported,
    simulateVoiceMessage
  } = useVoiceTrigger();

  const handleStartListening = async () => {
    await startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const AvatarSettings = () => (
    <div className="avatar-settings space-y-4 p-4">
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Voice Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-enabled">Enable Voice</Label>
              <p className="text-sm text-muted-foreground">
                Turn voice responses on/off
              </p>
            </div>
            <Switch
              id="voice-enabled"
              checked={isVoiceEnabled}
              onCheckedChange={toggleVoice}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-profile">Voice Profile</Label>
            <Select value={currentVoiceProfile} onValueChange={setVoiceProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voiceProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center">
                      <Volume2 size={14} className="mr-2" />
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {profile.accent} • {profile.gender}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Volume</Label>
            <div className="flex items-center gap-2">
              <VolumeX size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 volume-slider"
              />
              <Volume2 size={16} />
              <span className="w-10 text-right text-sm">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Voice History</h4>
        
        <div className="space-y-4">
          <div className="conversation-history max-h-60 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conversation history yet
              </p>
            ) : (
              <div className="space-y-3">
                {chatHistory.slice(-5).map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg text-sm ${
                      message.sender === 'user' 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-card border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        message.sender === 'user' ? 'bg-primary' : 'bg-green-500'
                      }`} />
                      <span className="font-medium">
                        {message.sender === 'user' ? 'You' : 'Maitri'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div>{message.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear History</Label>
              <p className="text-sm text-muted-foreground">
                Delete all conversation history
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearChat}
            >
              <Trash2 size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">About Maitri AI</h4>
        <p className="text-sm text-muted-foreground">
          Maitri AI is your voice-based Indian companion. Speak naturally and get responses 
          with a warm Indian accent. Designed for voice-only interaction.
        </p>
      </Card>
    </div>
  );

  return (
    <div className={`avatar-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="avatar-sidebar-header">
        <div className="avatar-header-content">
          <Avatar className="avatar-icon">
            <AvatarImage src="/assets/ai-avatar.png" alt="AI Assistant" />
            <AvatarFallback>
              <Bot size={24} />
            </AvatarFallback>
          </Avatar>
          <div className="avatar-info">
            <h3>Maitri AI</h3>
            <p className="text-sm text-muted-foreground">Voice Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="close-btn">
          <X size={20} />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="avatar-tabs">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic size={16} />
            <span>Voice</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="mt-0 p-4">
          <div className="voice-interface h-full flex flex-col">
            <div className="voice-status-card mb-6">
              <Card className="p-6">
                {/* Browser support warning */}
                {!speechSupported && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      ⚠️ Voice recognition not supported in this browser. Try Chrome or Edge.
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <div className={`voice-avatar ${isListening ? 'listening' : ''}`}>
                    <div className="relative">
                      <Bot size={40} className="text-primary" />
                      {isListening && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">Maitri Voice Assistant</h4>
                    <p className="text-sm text-muted-foreground">
                      {isListening ? 'Listening... Speak now' : 
                       isProcessing ? 'Processing your message...' : 
                       'Ready for voice commands'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    className="w-full h-14 text-lg"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    disabled={isProcessing || !speechSupported}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : isListening ? (
                      <>
                        <MicOff size={20} className="mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic size={20} className="mr-2" />
                        Start Voice Chat
                      </>
                    )}
                  </Button>

                  {/* Test buttons for demo */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateVoiceMessage("I'm not feeling good today")}
                      disabled={isProcessing}
                    >
                      Test: Sad
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateVoiceMessage("I'm feeling happy")}
                      disabled={isProcessing}
                    >
                      Test: Happy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateVoiceMessage("Who are you?")}
                      disabled={isProcessing}
                    >
                      Test: Who are you
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateVoiceMessage("Thank you")}
                      disabled={isProcessing}
                    >
                      Test: Thanks
                    </Button>
                  </div>

                  <div className="p-4 bg-card border rounded-lg">
                    <p className="text-sm font-medium mb-3">Try saying:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm">"I'm not feeling good"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm">"Tell me a story"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm">"I'm feeling tired"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <p className="text-sm">"Who are you?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="conversation-preview flex-1">
              <Card className="h-full">
                <div className="p-4 border-b">
                  <h4 className="font-semibold">Recent Conversation</h4>
                </div>
                <div className="p-4 h-[200px] overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="mb-4 p-3 rounded-full bg-primary/10">
                        <Mic size={24} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start speaking to see conversation history
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.slice(-5).reverse().map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender === 'user' 
                              ? 'bg-primary/5 border border-primary/10' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 w-2 h-2 rounded-full ${
                              message.sender === 'user' ? 'bg-primary' : 'bg-green-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">
                                  {message.sender === 'user' ? 'You' : 'Maitri'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm">{message.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <AvatarSettings />
        </TabsContent>
      </Tabs>

      <div className="avatar-sidebar-footer">
        <div className="current-status flex items-center gap-2">
          <div className={`status-dot ${isListening ? 'listening' : isProcessing ? 'processing' : 'idle'}`} />
          <span className="text-sm">
            {isListening ? 'Listening' : 
             isProcessing ? 'Processing' : 
             'Ready'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Voice Only • Indian Accent
        </div>
      </div>
    </div>
  );
};