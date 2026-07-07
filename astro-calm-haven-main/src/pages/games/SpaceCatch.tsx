import React, { useState, useEffect } from "react";

const canvasWidth = 600;
const canvasHeight = 400;
const astronautWidth = 50;
const astronautHeight = 50;
const starSize = 20;

interface Star {
  x: number;
  y: number;
}

const SpaceCatch: React.FC = () => {
  const [astronautX, setAstronautX] = useState(canvasWidth / 2 - astronautWidth / 2);
  const [stars, setStars] = useState<Star[]>([]);
  const [score, setScore] = useState(0);

  // Spawn stars
  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prev) => [...prev, { x: Math.random() * (canvasWidth - starSize), y: 0 }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) => {
        return prevStars
          .map((star) => ({ ...star, y: star.y + 5 }))
          .filter((star) => {
            if (
              star.y + starSize >= canvasHeight - astronautHeight &&
              star.x + starSize >= astronautX &&
              star.x <= astronautX + astronautWidth
            ) {
              setScore((s) => s + 1);
              return false; // remove caught star
            }
            return star.y <= canvasHeight;
          });
      });
    }, 50);
    return () => clearInterval(interval);
  }, [astronautX]);

  // Handle arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setAstronautX((x) => Math.max(0, x - 20));
      } else if (e.key === "ArrowRight") {
        setAstronautX((x) => Math.min(canvasWidth - astronautWidth, x + 20));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">🌌 Space Catch - Mind Relaxation</h1>
      <p className="mb-4">Use arrow keys to move the astronaut and catch the stars! ⭐</p>
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
        {/* Astronaut */}
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

        {/* Stars */}
        {stars.map((star, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: star.y,
              left: star.x,
              width: starSize,
              height: starSize,
              backgroundColor: "#fff59d",
              borderRadius: "50%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SpaceCatch;
