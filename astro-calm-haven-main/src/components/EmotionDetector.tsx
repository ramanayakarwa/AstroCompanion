import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Mic,
  Meh,
  Smile,
  Frown,
  Angry,
  AlertCircle,
} from "lucide-react";
import VoiceAnalysis from "./VoiceAnalysis"; // ✅ Import voice analysis component

// Let TypeScript know that 'faceapi' is available on the global window object
declare var faceapi: any;

// A simple component to map emotion strings to icons
const EmotionIcon = ({ emotion }: { emotion: string }) => {
  switch (emotion) {
    case "happy":
      return <Smile className="w-6 h-6 text-yellow-400" />;
    case "sad":
      return <Frown className="w-6 h-6 text-blue-400" />;
    case "angry":
      return <Angry className="w-6 h-6 text-red-500" />;
    case "surprised":
      return <AlertCircle className="w-6 h-6 text-purple-400" />;
    case "neutral":
      return <Meh className="w-6 h-6 text-gray-400" />;
    default:
      return null;
  }
};

export const EmotionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string>("---");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading AI models:", error);
      }
    };
    loadModels();
  }, []);

  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setDetectionActive(true);
      intervalRef.current = setInterval(async () => {
        if (videoRef.current && !videoRef.current.paused) {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();
          if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const primaryEmotion = Object.keys(expressions).reduce((a, b) =>
              expressions[a] > expressions[b] ? a : b
            );
            setDetectedEmotion(primaryEmotion);
          } else {
            setDetectedEmotion("No Face");
          }
        }
      }, 700);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setDetectionActive(false);
    setDetectedEmotion("---");
  };

  const handleButtonClick = () =>
    detectionActive ? stopDetection() : startDetection();

  useEffect(() => {
    return () => stopDetection();
  }, []);

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen p-4 sm:p-8 md:p-12 font-sans bg-[radial-gradient(circle_at_20%_20%,_rgba(49,58,87,0.5)_0%,_rgba(15,23,42,0)_20%),_radial-gradient(circle_at_80%_70%,_rgba(49,58,87,0.a5)_0%,_rgba(15,23,42,0)_15%)]">
      <header className="mb-10">
        <p className="flex items-center gap-2 text-sm text-green-400 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Mission Control Active
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Emotion Detection
        </h1>
        <p className="text-lg text-slate-400 mt-2">
          Real-time analysis of your emotional state to provide personalized
          support.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 📷 Visual Emotion Detection */}
        <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">
              Visual Detection
            </h2>
            <Camera className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="w-full aspect-video bg-slate-900 rounded-lg flex justify-center items-center overflow-hidden">
            {detectionActive ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-center text-slate-500">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>Camera feed will appear here</p>
              </div>
            )}
          </div>
          <div className="text-center mt-4 text-lg min-h-[28px] flex items-center justify-center gap-2">
            <span>Detected Emotion:</span>
            <strong className="text-white capitalize">
              {detectedEmotion}
            </strong>
            <EmotionIcon emotion={detectedEmotion} />
          </div>
          <button
            onClick={handleButtonClick}
            disabled={!modelsLoaded}
            className="mt-auto w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-3 px-4 hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {!modelsLoaded
              ? "Loading AI Models..."
              : detectionActive
              ? "Stop Camera Detection"
              : "Start Camera Detection"}
          </button>
        </div>

        {/* 🎤 Voice Emotion Detection */}
        <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col border border-slate-700">
          <VoiceAnalysis /> {/* ✅ Inserted full voice analysis here */}
        </div>
      </main>
    </div>
  );
};
