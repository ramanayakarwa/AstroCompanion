"use client";
import { useRef, useState } from "react";

export default function VoiceAnalysis({
  apiBase = "http://127.0.0.1:8000",
}: {
  apiBase?: string;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setLoading(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();

        // Convert webm to wav server-side or send webm; backend librosa should accept webm in many cases.
        formData.append("file", blob, "voice.webm");

        try {
          const res = await fetch(`${apiBase}/analyze-voice/`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setAnalysis(data);
        } catch (err) {
          setAnalysis({ error: "Failed to reach backend" });
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      setAnalysis({ error: "Microphone access denied or not available" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    // stop all tracks to free mic
    // @ts-ignore
    mediaRecorderRef.current?.stream?.getTracks?.().forEach((t: any) => t.stop());
    setRecording(false);
  };

  return (
    <div>
      <button
        className={`px-4 py-2 rounded text-white ${recording ? "bg-red-500" : "bg-blue-500"}`}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop Recording" : "Start Voice Analysis"}
      </button>

      {loading && <p className="mt-2">Analyzing...</p>}

      {analysis && (
        <div className="mt-2 p-2 bg-gray-800 text-white rounded">
          {analysis.error ? (
            <div>Error: {analysis.error}</div>
          ) : (
            <div>
              <div>Source: {analysis.source}</div>
              <div>Mood: {analysis.mood}</div>
              <div>Stress: {analysis.stress_level} ({analysis.stress_percent}%)</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
