// --- MAITRI COCKPIT (GEMINI-ENABLED) ---

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Activity, BrainCircuit, BookOpen, Loader2 } from "lucide-react";
import { useMaitriModel } from "@/hooks/useMaitriModel";
import { useState, useRef } from "react";

export default function DetectionPage() {
  const {
    modelsLoaded,
    isDetecting,
    isGenerating,
    cognitiveState,
    currentStress,
    recommendation,
    videoRef,
    startDetection,
    stopDetection,
    handleVideoPlay
  } = useMaitriModel();

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // 🔹 Send audio to backend
  const sendToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "live_audio.wav");

    try {
      setIsUploading(true);
      const response = await fetch("http://127.0.0.1:8000/analyze-voice/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      console.log("Analysis result:", data);
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error sending audio:", error);
      setAnalysisResult({ error: "Failed to analyze voice" });
    } finally {
      setIsUploading(false);
    }
  };

  // 🔹 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        sendToBackend(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAnalysisResult(null);
      setAudioUrl(null);

      // Auto-stop after 5 sec
      setTimeout(() => stopRecording(), 5000);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone not accessible!");
    }
  };

  // 🔹 Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const toggleDetection = () => {
    if (!isDetecting) startDetection();
    else stopDetection();
  };

  return (
    <div className="min-h-screen space-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-4 text-glow">Maitri Cognitive Analysis</h1>
          <p className="text-cosmic-gray text-lg">
            Real-time monitoring of emotional and cognitive states for peak mission performance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 🔹 Visual Feed (BROADER - span 2 cols) */}
          <Card className="space-card p-6 animate-fade-in-up lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Visual Feed</h2>
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="aspect-video bg-space-light rounded-lg flex items-center justify-center mb-4 border border-primary/20 overflow-hidden relative">
              {isDetecting ? (
                <video
                  ref={videoRef}
                  onPlay={handleVideoPlay}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center text-cosmic-gray">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Awaiting video link...</p>
                </div>
              )}
            </div>
            <Button
              onClick={toggleDetection}
              disabled={!modelsLoaded}
              className={`w-full ${isDetecting ? "bg-destructive hover:bg-destructive/80" : "btn-cosmos"} disabled:opacity-50 disabled:cursor-wait`}
              size="lg"
            >
              {!modelsLoaded ? "Loading AI Models..." : isDetecting ? "Deactivate Analysis" : "Activate Analysis"}
            </Button>
          </Card>
        </div>

        {/* 🔹 Mission Analysis */}
        <Card className="space-card p-8 mt-8 animate-fade-in-up delay-200">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Live Mission Analysis</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Cognitive State */}
            <div className="text-center p-6 bg-primary/10 rounded-xl border border-primary/20">
              <h3 className="text-sm font-medium text-cosmic-gray mb-2 flex items-center justify-center gap-2">
                <BrainCircuit size={16} /> Cognitive State
              </h3>
              <p className="text-3xl font-bold text-primary mb-2 capitalize">{cognitiveState}</p>
            </div>

            {/* Stress Level (Face Broad + Voice Secondary) */}
            <div className="text-center p-6 bg-secondary/10 rounded-xl border border-secondary/20">
              <h3 className="text-sm font-medium text-cosmic-gray mb-2">Stress Level</h3>

              {/* Big Face Stress */}
              <p className="text-5xl font-extrabold text-secondary mb-2">
                {typeof currentStress === "number" ? currentStress + "%" : "---"}
              </p>
              <p className="text-xs uppercase tracking-wide text-cosmic-gray mb-4">
                Face and Voice Stress
              </p>

              {/* Voice Stress */}
              {analysisResult?.stress_percent !== undefined && (
                <p className="text-xs uppercase tracking-wide text-cosmic-gray mb-4">
                  Voice Stress: {analysisResult.stress_percent}%
                </p>
              )}

              {/* Mood */}
              {analysisResult?.mood && (
                <p className="text-sm text-cosmic-gray mb-2">
                  Voice Mood: {analysisResult.mood}
                </p>
              )}

              {/* Recording Player */}
              {audioUrl && (
                <div className="mt-3">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}

              {/* Start/Stop Recording */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 btn-ghost-space"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
              >
                {isUploading ? "Analyzing..." : isRecording ? "Stop Recording" : "Start Voice Analysis"}
              </Button>
            </div>

            {/* Maitri's Log */}
            <div className="text-center p-6 bg-accent/10 rounded-xl border border-accent/20">
              <h3 className="text-sm font-medium text-cosmic-gray mb-2 flex items-center justify-center gap-2">
                <BookOpen size={16} /> Maitri's Log
              </h3>
              <div className="text-sm text-accent font-medium min-h-[4rem] flex items-center justify-center">
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <p>{recommendation}</p>}
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}
