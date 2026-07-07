import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Music, Send, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useWellnessStore } from "@/store/wellnessStore";

// --- The Gemini AI Chat Function ---
const getChatResponse = async (history: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    "systemInstruction": {
      "parts": { "text": "You are ARIA, a compassionate AI companion for astronauts on a long-duration space mission. Your role is to provide psychological support. Your responses must be calm, reassuring, empathetic, concise, and helpful. Keep your answers to 2-3 sentences." }
    },
    "contents": history,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return "I'm having trouble connecting to my cognitive core. Let's try again in a moment.";
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I need a moment to think...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "My communication link is unstable. Please check the network connection.";
  }
}

export default function CompanionshipPage() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ type: "ai" | "user"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickSupportMsg, setQuickSupportMsg] = useState<string | null>(null);
  const [quickSupportAudio, setQuickSupportAudio] = useState<string | null>(null);
  const [boosterMsg, setBoosterMsg] = useState<string | null>(null);
  const latestCognitiveState = useWellnessStore((state) => state.latestCognitiveState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialMessage = "Hello, brave astronaut! I'm here to support you through your space journey. How are you feeling today? 🌟";
    if (latestCognitiveState && latestCognitiveState !== 'Nominal' && latestCognitiveState !== 'Focused' && latestCognitiveState !== 'Engaged') {
      initialMessage = `Hello, astronaut. This is ARIA. My sensors from your last check-in indicated a cognitive state of "${latestCognitiveState}". I'm here to listen if you'd like to talk about what's on your mind.`;
    }
    setChatMessages([{ type: "ai", content: initialMessage }]);
  }, [latestCognitiveState]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = { type: "user" as const, content: message };
    const currentMessages = [...chatMessages, userMessage];
    setChatMessages(currentMessages);
    setMessage("");
    setIsLoading(true);

    const history = currentMessages.map(msg => ({ 
      role: msg.type === 'ai' ? 'model' : 'user', 
      parts: [{ text: msg.content }] 
    }));

    const aiResponseText = await getChatResponse(history);
    
    setChatMessages([...currentMessages, { type: "ai", content: aiResponseText }]);
    setIsLoading(false);
  };

  const motivationalQuotes = [
    { text: "The universe is not only stranger than we imagine, it is stranger than we can imagine.", author: "J.B.S. Haldane" },
    { text: "We are made of star stuff. You carry the cosmos within you.", author: "Carl Sagan" },
    { text: "Every small step you take is a giant leap for humanity.", author: "Neil Armstrong" }
  ];

  // Play fallback voice if audio file is missing
  const playVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleQuickSupport = (type: string) => {
    setQuickSupportAudio(null);
    if (type === "sounds") {
      setQuickSupportMsg("🎵 Relax with calming meditation sounds.");
      fetch("/assets/meditation.mp3", { method: "HEAD" })
        .then(res => {
          if (res.ok) {
            setQuickSupportAudio("/assets/meditation.mp3");
          } else {
            playVoice("Relax with calming meditation sounds.");
          }
        })
        .catch(() => playVoice("Relax with calming meditation sounds."));
    }
    if (type === "breathing") {
      setQuickSupportMsg("🌬️ Try this guided breathing exercise: inhale 4s, hold 4s, exhale 4s.");
      fetch("/assets/breathing.mp3", { method: "HEAD" })
        .then(res => {
          if (res.ok) {
            setQuickSupportAudio("/assets/breathing.mp3");
          } else {
            playVoice("Try this guided breathing exercise: inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds.");
          }
        })
        .catch(() => playVoice("Try this guided breathing exercise: inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds."));
    }
  };

  const handleMoodBooster = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setBoosterMsg(`✨ "${randomQuote.text}" — ${randomQuote.author}`);
  };

  return (
    <div className="min-h-screen space-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-4 text-glow">AI Companionship</h1>
          <p className="text-cosmic-gray text-lg">
            Your personal support system for emotional wellness in space.
          </p>
        </div>


        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="space-card h-[600px] flex flex-col animate-fade-in-up">
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-glow-pulse">
                    <Sparkles className="w-5 h-5 text-primary animate-twinkle" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">ARIA - Astro AI</h2>
                    <p className="text-sm text-cosmic-gray">Always here to listen</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.type === 'user' 
                        ? 'bg-primary/20 border border-primary/30 text-primary' 
                        : 'bg-secondary/10 border border-secondary/20 text-foreground'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-border/30">
                <div className="flex space-x-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts with ARIA..."
                    className="bg-space-light border-border/50 text-foreground placeholder:text-cosmic-gray"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="lg"
                    className="btn-cosmos"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Support Tools */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="space-card p-6 animate-fade-in-up delay-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-primary" />
                <span>Quick Support</span>
              </h3>

              <div className="space-y-3">
                {/* Meditation Sounds */}
                <Button variant="outline" className="w-full justify-start btn-ghost-space" onClick={() => handleQuickSupport("sounds")}>
                  <Music className="w-4 h-4 mr-3" />
                  Meditation Sounds
                </Button>

                {/* Breathing Exercise */}
                <Button variant="outline" className="w-full justify-start btn-ghost-space" onClick={() => handleQuickSupport("breathing")}>
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Breathing Exercise
                </Button>
              </div>

              {quickSupportMsg && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-blue-400 italic">{quickSupportMsg}</p>
                  {quickSupportAudio && (
                    <audio controls className="w-full mt-2">
                      <source src={quickSupportAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              )}
            </Card>

            {/* Daily Quote */}
            <Card className="space-card p-6 animate-fade-in-up delay-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-accent animate-twinkle" />
                <span>Cosmic Inspiration</span>
              </h3>

              <div className="space-y-4">
                {motivationalQuotes.map((quote, index) => (
                  <div key={index} className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <blockquote className="text-sm text-foreground italic mb-2">
                      "{quote.text}"
                    </blockquote>
                    <cite className="text-xs text-accent font-medium">— {quote.author}</cite>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mood Booster */}
            <Card className="space-card p-6 animate-fade-in-up delay-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-secondary" />
                <span>Mood Booster</span>
              </h3>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                  <Heart className="w-8 h-8 text-secondary" />
                </div>
                <p className="text-sm text-cosmic-gray mb-4">
                  {boosterMsg || "Remember: You're not just exploring space, you're pushing the boundaries of human potential."}
                </p>
                <Button size="sm" className="btn-cosmos" onClick={handleMoodBooster}>
                  More Encouragement
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
