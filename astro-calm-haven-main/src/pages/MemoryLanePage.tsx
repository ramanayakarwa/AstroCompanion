import MemoryLane from '../components/MemoryLane/MemoryLane';

const MemoryLanePage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">🎞️ Memory Lane</h1>
        <p className="text-gray-600 mt-2">
          Pre-loaded memories for emotional support during space missions
        </p>
      </div>
      
      <MemoryLane />
      
      <div className="mt-8 p-6 bg-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">How it works:</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Pre-loaded before launch with astronaut's personal photos</li>
          <li>• Voice-activated: "I miss my family" → shows family photos</li>
          <li>• Emotion-aware: Detects loneliness → shows comforting memories</li>
          <li>• Works 100% offline - no internet required in space</li>
          <li>• Secure uplink from Earth for new memories</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryLanePage;