import MusicPlayer from '../components/MusicPlayer/MusicPlayer';

const SongsPage = () => {
  return (
    <div className="songs-page">
      <div className="page-header">
        <h1 className="text-3xl font-bold">🎵 Therapeutic Music System</h1>
        <p className="text-muted-foreground">
          AI-powered music for emotional well-being. Works completely offline.
        </p>
      </div>
      
      <div className="mt-8">
        <MusicPlayer />
      </div>
      
      <div className="mt-12 p-6 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">About This System</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Works 100% offline - no internet required in space</li>
          <li>• Pre-loaded with therapeutic music for astronauts</li>
          <li>• AI recommends music based on detected emotions</li>
          <li>• Voice-controlled search with offline speech recognition</li>
          <li>• Secure uplink system for adding new music from Earth</li>
        </ul>
      </div>
    </div>
  );
};

export default SongsPage;