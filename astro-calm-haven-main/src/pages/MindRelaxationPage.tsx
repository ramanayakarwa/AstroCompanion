// src/pages/MindRelaxationPage.tsx
import React, { useState } from "react";
import SpaceCatch from "./games/SpaceCatch";
import MeteorDodge from "./games/MeteorDodge";
import PlanetMatch from "./games/PlanetMatch";

const MindRelaxationPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame === "SpaceCatch") return <SpaceCatch />;
  if (selectedGame === "MeteorDodge") return <MeteorDodge />;
  if (selectedGame === "PlanetMatch") return <PlanetMatch />;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🪐 Mind Relaxation Games</h1>
      <p className="mb-4">Choose a game to relax in space:</p>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          className="btn-cosmos"
          onClick={() => setSelectedGame("SpaceCatch")}
        >
          🌟 Space Catch
        </button>
        <button
          className="btn-cosmos"
          onClick={() => setSelectedGame("MeteorDodge")}
        >
          ☄️ Meteor Dodge
        </button>
        <button
          className="btn-cosmos"
          onClick={() => setSelectedGame("PlanetMatch")}
        >
          🪐 Planet Match Memory
        </button>
      </div>
    </div>
  );
};

export default MindRelaxationPage;
