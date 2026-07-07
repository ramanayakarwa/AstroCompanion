import { useState, useRef, useEffect, useCallback } from "react";
import { mapEmotionToState, getMaitriRecommendation, getAdvancedCreativeSuggestion } from "@/lib/cognitiveEngine";
import { useWellnessStore } from "@/store/wellnessStore";

// NEW: This one line fixes the error. It tells TypeScript that 'faceapi' exists.
declare var faceapi: any;

const getStableEmotion = (history: string[]): string => {
    if (history.length === 0) return 'neutral';
    const modeMap: { [key: string]: number } = {};
    let maxCount = 0;
    let stableEmotion = history[0];
    for(const emotion of history) {
        if (!modeMap[emotion]) modeMap[emotion] = 0;
        modeMap[emotion]++;
        if (modeMap[emotion] > maxCount) {
            maxCount = modeMap[emotion];
            stableEmotion = emotion;
        }
    }
    return stableEmotion;
};

const saveSessionData = (sessionReadings: React.MutableRefObject<{ mood: number; stress: number; }[]>) => {
    if (sessionReadings.current.length === 0) return;
    const totalMood = sessionReadings.current.reduce((sum, r) => sum + r.mood, 0);
    const totalStress = sessionReadings.current.reduce((sum, r) => sum + r.stress, 0);
    const sessionSummary = {
        id: Date.now(),
        date: new Date().toISOString(),
        averageMood: Math.round(totalMood / sessionReadings.current.length),
        averageStress: Math.round(totalStress / sessionReadings.current.length),
    };
    const allSessions = JSON.parse(localStorage.getItem('astroSessions') || '[]');
    allSessions.push(sessionSummary);
    localStorage.setItem('astroSessions', JSON.stringify(allSessions));
    console.log("Session saved:", sessionSummary);
};

export const useMaitriModel = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cognitiveState, setCognitiveState] = useState("Nominal");
  const [currentStress, setCurrentStress] = useState<number | string>("---");
  const [recommendation, setRecommendation] = useState("Activate analysis to begin.");
  
  const updateCognitiveState = useWellnessStore((state) => state.updateCognitiveState);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionReadings = useRef<{ mood: number; stress: number }[]>([]);
  const emotionHistory = useRef<string[]>([]);
  const stressStreak = useRef(0);

  useEffect(() => {
    const loadModels = async () => {
        const MODEL_URL = '/models';
        try {
            await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        } catch (error) {
            console.error("CRITICAL: Error loading AI models:", error);
            setRecommendation("Error loading perception models.");
        }
    };
    loadModels();
  }, []);

  const runDetection = useCallback(async () => {
    if (videoRef.current && !videoRef.current.paused && !isGenerating) {
      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.65 })
        ).withFaceLandmarks().withFaceExpressions();
        
        if (detections && detections.length > 0) {
          const expressions = detections[0].expressions;
          let primaryEmotion = 'neutral';
          let maxConfidence = 0;

          for (const [emotion, conf] of Object.entries(expressions)) {
              if ((conf as number) > maxConfidence) {
                  maxConfidence = conf as number;
                  primaryEmotion = emotion;
              }
          }
          
          emotionHistory.current.push(primaryEmotion);
          if (emotionHistory.current.length > 5) emotionHistory.current.shift();
          
          const stableEmotion = getStableEmotion(emotionHistory.current);
          const { mood, stress, cognitive } = mapEmotionToState(stableEmotion);

          setCognitiveState(cognitive);
          setCurrentStress(stress);
          updateCognitiveState(cognitive);

          const isStressed = ['Frustrated', 'Anxious', 'Stressed'].includes(cognitive);
          if (isStressed) {
            stressStreak.current++;
          } else {
            stressStreak.current = 0;
          }
          
          if (stressStreak.current >= 4) {
             setIsGenerating(true);
             const advancedRec = await getAdvancedCreativeSuggestion(cognitive);
             setRecommendation(advancedRec);
             setIsGenerating(false);
             stressStreak.current = 0;
          } else {
             const standardRec = getMaitriRecommendation(cognitive, maxConfidence);
             setRecommendation(standardRec);
          }
          
          sessionReadings.current.push({ mood, stress });
        } else {
           setRecommendation("Searching for astronaut...");
        }
      } catch (error) {
        // Silent error
      }
    }
  }, [isGenerating, updateCognitiveState]);

  const handleVideoPlay = useCallback(() => {
    if (!modelsLoaded) return;
    setRecommendation("Cognitive model calibrated.");
    intervalRef.current = setInterval(runDetection, 2500);
  }, [modelsLoaded, runDetection]);

  const startDetection = useCallback(async () => {
    setIsDetecting(true);
    setRecommendation("Activating visual feed...");
    stressStreak.current = 0;
    sessionReadings.current = []; 
    emotionHistory.current = [];
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (error) {
        console.error("Could not access camera:", error);
        setRecommendation("Could not access camera.");
        setIsDetecting(false);
    }
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setCognitiveState("Nominal");
    setCurrentStress("---");
    setRecommendation("Activate analysis to begin.");
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    if (sessionReadings.current.length > 0) saveSessionData(sessionReadings);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    modelsLoaded, isDetecting, isGenerating, cognitiveState, currentStress,
    recommendation, videoRef, startDetection, stopDetection, handleVideoPlay
  };
};

