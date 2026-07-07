// src/pages/games/PlanetMatch.tsx
import React, { useState } from "react";

const planets = ["🪐", "🌕", "🌑", "🌍", "🪐", "🌕", "🌑", "🌍"];

const PlanetMatch: React.FC = () => {
  const [cards, setCards] = useState(planets.sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleClick = (index: number) => {
    if (flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (cards[a] === cards[b]) setMatched((m) => [...m, a, b]);
      setTimeout(() => setFlipped([]), 800);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🌌 Planet Match Memory</h1>
      <p className="mb-4">Match pairs of planets to relax your mind!</p>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((planet, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 flex items-center justify-center text-3xl bg-gray-800 rounded-xl cursor-pointer ${
              flipped.includes(i) || matched.includes(i) ? "bg-teal-400 text-black" : ""
            }`}
          >
            {flipped.includes(i) || matched.includes(i) ? planet : "?"}
          </div>
        ))}
      </div>
      {matched.length === cards.length && <p className="mt-4 text-green-400">🎉 You matched all planets!</p>}
    </div>
  );
};

export default PlanetMatch;
