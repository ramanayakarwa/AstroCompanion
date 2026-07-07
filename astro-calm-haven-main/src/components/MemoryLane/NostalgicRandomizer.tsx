// components/MemoryLane/NostalgicRandomizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, Shuffle } from 'lucide-react';
import { MemoryItem } from '../../types/memory';
import MemoryScanner from '../../utils/memory/memoryScanner';
import './MemoryLane.css';

interface NostalgicRandomizerProps {
  onClose: () => void;
}

const nostalgicMusicTracks = [
  {
    id: 'random-1',
    name: 'Memories of Yesterday',
    url: 'https://assets.mixkit.co/music/preview/mixkit-piano-melody-1099.mp3',
    artist: 'Piano Dreams'
  }
];

const NostalgicRandomizer: React.FC<NostalgicRandomizerProps> = ({ onClose }) => {
  const [selectedItems, setSelectedItems] = useState<MemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [transition, setTransition] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(nostalgicMusicTracks[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffleCount, setShuffleCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const slideshowInterval = useRef<NodeJS.Timeout | null>(null);
  const usedPhotoIds = useRef<Set<string>>(new Set());

  // Get random photos from all categories
  const getRandomPhotos = async () => {
    setIsLoading(true);
    try {
      await MemoryScanner.initialize();
      const categories = await MemoryScanner.getCategories();
      
      // Get all photos from all categories
      let allPhotos: MemoryItem[] = [];
      
      for (const category of categories) {
        const items = await MemoryScanner.getItems(category);
        const photos = items.filter(item => item.type === 'photo');
        allPhotos = [...allPhotos, ...photos];
      }
      
      // Also load user uploaded photos from localStorage
      const userUploads: MemoryItem[] = [];
      for (const category of categories) {
        const savedData = localStorage.getItem(`memoryLane_${category}`);
        if (savedData) {
          const items = JSON.parse(savedData);
          const userPhotos = items.filter((item: MemoryItem) => 
            item.type === 'photo' && !item.isPlaceholder
          );
          userUploads.push(...userPhotos);
        }
      }
      
      allPhotos = [...allPhotos, ...userUploads];
      
      if (allPhotos.length === 0) {
        setSelectedItems([]);
        setIsLoading(false);
        return;
      }
      
      // Filter out already shown photos
      const availablePhotos = allPhotos.filter(photo => !usedPhotoIds.current.has(photo.id));
      
      // If we've shown most photos, reset the used IDs
      if (availablePhotos.length < 5 || usedPhotoIds.current.size > allPhotos.length * 0.8) {
        usedPhotoIds.current.clear();
        availablePhotos.push(...allPhotos);
      }
      
      // Select 10 random photos
      const count = Math.min(10, availablePhotos.length);
      const shuffled = [...availablePhotos].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);
      
      // Mark these photos as used
      selected.forEach(photo => usedPhotoIds.current.add(photo.id));
      
      setSelectedItems(selected);
      setShuffleCount(prev => prev + 1);
      setCurrentIndex(0);
      setIsPlaying(true); // Auto-play when shuffled
    } catch (error) {
      console.error('Error getting random photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    getRandomPhotos();
    
    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (isPlaying && selectedItems.length > 1) {
      slideshowInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % selectedItems.length);
        setTransition(true);
        setTimeout(() => setTransition(false), 100);
      }, 3000);
    }

    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, [isPlaying, selectedItems.length]);

  // Audio control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, selectedMusic]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 's' || e.key === 'S') {
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems.length, currentIndex]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % selectedItems.length);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + selectedItems.length) % selectedItems.length);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  const resetInterval = () => {
    if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
      if (isPlaying && selectedItems.length > 1) {
        slideshowInterval.current = setInterval(() => {
          setCurrentIndex(prev => (prev + 1) % selectedItems.length);
          setTransition(true);
          setTimeout(() => setTransition(false), 100);
        }, 3000);
      }
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // FIXED: Handle Shuffle function
  const handleShuffle = async () => {
    await getRandomPhotos();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  if (isLoading) {
    return (
      <div className="nostalgic-overlay">
        <div className="nostalgic-content">
          <button onClick={onClose} className="close-nostalgic-btn">
            <X size={24} />
          </button>
          <div className="loading-nostalgic">
            <h3>Collecting memories...</h3>
            <p>Gathering photos from all categories</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="nostalgic-overlay">
        <div className="nostalgic-content">
          <button onClick={onClose} className="close-nostalgic-btn">
            <X size={24} />
          </button>
          <div className="no-photos-message">
            <Music size={64} className="mb-4" />
            <h3>No Photos Found</h3>
            <p>Add photos to any category to use Nostalgic Randomizer</p>
            <button onClick={onClose} className="close-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = selectedItems[currentIndex];

  return (
    <div className="nostalgic-overlay">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={selectedMusic.url}
        loop
        preload="auto"
      />
      
      <div className="nostalgic-content">
        {/* Close Button - FIXED */}
        <button onClick={onClose} className="close-nostalgic-btn">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="nostalgic-header">
          <div className="header-left">
            <Shuffle size={24} />
            <h2 className="nostalgic-title">Nostalgic Randomizer</h2>
          </div>
          <div className="header-right">
            <span className="shuffle-count">Shuffle #{shuffleCount}</span>
            {/* FIXED: Shuffle Again button */}
            <button onClick={handleShuffle} className="shuffle-btn" title="Shuffle new memories (S)">
              <Shuffle size={18} />
              <span>Shuffle Again</span>
            </button>
          </div>
        </div>

        {/* Slideshow Display */}
        <div className="nostalgic-display">
          <div 
            className={`nostalgic-image-container ${transition ? 'fade-out' : 'fade-in'}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width * 0.4) {
                handlePrev();
              } else if (x > rect.width * 0.6) {
                handleNext();
              }
            }}
          >
            <img
              src={currentItem.path}
              alt={currentItem.caption}
              className="nostalgic-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBmMGM1NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NZW1vcnkgU2xpZGVzaG93PC90ZXh0Pjwvc3ZnPg==';
              }}
            />
            
            {/* Image Info */}
            <div className="nostalgic-info-overlay">
              <div className="image-caption">{currentItem.caption}</div>
              <div className="image-meta">
                <span className="image-date">{currentItem.date}</span>
                <span className="image-counter">
                  {currentIndex + 1} / {selectedItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="nostalgic-controls">
          <div className="navigation-controls">
            <button onClick={handlePrev} className="control-btn" title="Previous (←)">
              <SkipBack size={24} />
            </button>
            
            <button onClick={togglePlayPause} className="play-pause-btn" title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            
            <button onClick={handleNext} className="control-btn" title="Next (→)">
              <SkipForward size={24} />
            </button>
          </div>

          <div className="volume-controls">
            <button onClick={toggleMute} className="mute-btn" title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>

        {/* Progress & Info */}
        <div className="nostalgic-bottom">
          <div className="progress-container">
            <div className="progress-dots">
              {selectedItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
                  title={`Go to memory ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NostalgicRandomizer;