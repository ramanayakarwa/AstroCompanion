// src/pages/games/MeteorDodge.tsx
import React, { useState, useEffect } from "react";

const canvasWidth = 600;
const canvasHeight = 400;
const astronautWidth = 50;
const astronautHeight = 50;
const meteorSize = 30;

interface Meteor {
  x: number;
  y: number;
}

const MeteorDodge: React.FC = () => {
  const [astronautX, setAstronautX] = useState(canvasWidth / 2 - astronautWidth / 2);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors((prev) => [...prev, { x: Math.random() * (canvasWidth - meteorSize), y: 0 }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors((prevMeteors) => {
        return prevMeteors.map((meteor) => ({ ...meteor, y: meteor.y + 5 }));
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Collision detection
  useEffect(() => {
    meteors.forEach((meteor) => {
      if (
        meteor.y + meteorSize >= canvasHeight - astronautHeight &&
        meteor.x + meteorSize >= astronautX &&
        meteor.x <= astronautX + astronautWidth
      ) {
        setGameOver(true);
      } else if (meteor.y + meteorSize > canvasHeight) {
        setScore((s) => s + 1);
      }
    });
  }, [meteors, astronautX]);

  // Arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setAstronautX((x) => Math.max(0, x - 20));
      if (e.key === "ArrowRight") setAstronautX((x) => Math.min(canvasWidth - astronautWidth, x + 20));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (gameOver) return <div className="p-6 text-white"><h1 className="text-3xl">💥 Game Over!</h1><p>Score: {score}</p></div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">☄️ Meteor Dodge</h1>
      <p className="mb-4">Avoid meteors falling from the sky! Score increases each avoided meteor.</p>
      <p className="mb-4">Score: {score}</p>
      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          background: "linear-gradient(180deg, #0b1533 0%, #152040 100%)",
          border: "2px solid #3bb3b6",
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: astronautX,
            width: astronautWidth,
            height: astronautHeight,
            backgroundColor: "#4ad6d9",
            borderRadius: "8px",
          }}
        />
        {meteors.map((m, i) => (
          <div key={i} style={{
            position: "absolute",
            top: m.y,
            left: m.x,
            width: meteorSize,
            height: meteorSize,
            backgroundColor: "#f87171",
            borderRadius: "50%",
          }} />
        ))}
      </div>
    </div>
  );
};

export default MeteorDodge;
