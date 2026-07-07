"use client";
import React, { useRef, useState } from "react";

export default function FaceCapture({ apiBase = "http://127.0.0.1:8000" }: { apiBase?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      setAnalysis({ error: "Camera access denied or not available" });
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );

    if (!blob) {
      setAnalysis({ error: "Failed to capture image" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", blob, "face.jpg");

    try {
      const res = await fetch(`${apiBase}/analyze-face/`, {
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

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        {!streaming ? (
          <button onClick={startCamera} className="px-3 py-1 rounded bg-green-600 text-white">
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} className="px-3 py-1 rounded bg-red-600 text-white">
            Stop Camera
          </button>
        )}

        <button onClick={captureAndAnalyze} className="px-3 py-1 rounded bg-blue-600 text-white">
          Capture & Analyze Face
        </button>
      </div>

      <video ref={videoRef} className="w-64 h-48 bg-black" />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {loading && <div>Analyzing face...</div>}

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
