// components/MemoryLane/SlideshowPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music } from 'lucide-react';
import { MemoryItem } from '../../types/memory';
import './MemoryLane.css';

interface SlideshowPlayerProps {
  items: MemoryItem[];
  category: string;
  onClose: () => void;
}

const nostalgicMusicTracks = [
  {
    id: 'memory-1',
    name: 'Nostalgic Piano',
    url: 'https://assets.mixkit.co/music/preview/mixkit-piano-melody-1099.mp3',
    artist: 'Piano Memories'
  },
  {
    id: 'memory-2',
    name: 'Gentle Guitar',
    url: 'https://assets.mixkit.co/music/preview/mixkit-gentle-guitar-1211.mp3',
    artist: 'Acoustic Dreams'
  }
];

const SlideshowPlayer: React.FC<SlideshowPlayerProps> = ({ items, category, onClose }) => {
  // Filter only photos for slideshow
  const photoItems = items.filter(item => item.type === 'photo');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [transition, setTransition] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(nostalgicMusicTracks[0]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const slideshowInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-play slideshow
  useEffect(() => {
    if (isPlaying && photoItems.length > 1) {
      slideshowInterval.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photoItems.length);
        setTransition(true);
        setTimeout(() => setTransition(false), 100);
      }, 3000);
    }

    return () => {
      if (slideshowInterval.current) {
        clearInterval(slideshowInterval.current);
      }
    };
  }, [isPlaying, photoItems.length]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoItems.length, currentIndex, onClose]);

  const handleNext = () => {
    if (photoItems.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % photoItems.length);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  const handlePrev = () => {
    if (photoItems.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + photoItems.length) % photoItems.length);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  const resetInterval = () => {
    if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
      if (isPlaying && photoItems.length > 1) {
        slideshowInterval.current = setInterval(() => {
          setCurrentIndex(prev => (prev + 1) % photoItems.length);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Handle click on image for navigation
  const handleImageClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Click on left 40% for previous, right 40% for next
    if (x < width * 0.4) {
      handlePrev();
    } else if (x > width * 0.6) {
      handleNext();
    }
    // Center 20% does nothing (for play/pause button)
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setTransition(true);
    setTimeout(() => setTransition(false), 100);
    resetInterval();
  };

  if (photoItems.length === 0) {
    return (
      <div className="slideshow-overlay">
        <div className="slideshow-content">
          <button onClick={onClose} className="close-slideshow-btn">
            <X size={24} />
          </button>
          <div className="no-photos-message">
            <Music size={64} className="mb-4" />
            <h3>No Photos Found</h3>
            <p>Add some photos to this category to start a slideshow</p>
            <button onClick={onClose} className="close-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = photoItems[currentIndex];

  return (
    <div className="slideshow-overlay">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={selectedMusic.url}
        loop
        preload="auto"
      />
      
      <div className="slideshow-content">
        {/* Close Button - FIXED: Added proper onClick */}
        <button 
          onClick={onClose} 
          className="close-slideshow-btn"
          aria-label="Close slideshow"
        >
          <X size={24} />
        </button>

        {/* Slideshow Display */}
        <div className="slideshow-display">
          <div 
            className={`slideshow-image-container ${transition ? 'fade-out' : 'fade-in'}`}
            onClick={handleImageClick}
          >
            <img
              src={currentItem.path}
              alt={currentItem.caption}
              className="slideshow-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBmMGM1NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NZW1vcnkgU2xpZGVzaG93PC90ZXh0Pjwvc3ZnPg==';
              }}
            />
            
            {/* Image Info Overlay */}
            <div className="image-info-overlay">
              <div className="image-caption">{currentItem.caption}</div>
              <div className="image-meta">
                <span className="image-date">{currentItem.date}</span>
                <span className="image-counter">
                  {currentIndex + 1} / {photoItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel - FIXED: Proper onClick handlers */}
        <div className="slideshow-controls">
          {/* Navigation Controls */}
          <div className="navigation-controls">
            <button 
              onClick={handlePrev} 
              className="control-btn" 
              title="Previous (←)"
              disabled={photoItems.length <= 1}
            >
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={togglePlayPause} 
              className="play-pause-btn" 
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            
            <button 
              onClick={handleNext} 
              className="control-btn" 
              title="Next (→)"
              disabled={photoItems.length <= 1}
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Volume Controls */}
          <div className="volume-controls">
            <button 
              onClick={toggleMute} 
              className="mute-btn" 
              title={isMuted ? 'Unmute' : 'Mute'}
            >
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

        {/* Progress Bar & Dots - FIXED: Proper onClick */}
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${((currentIndex + 1) / photoItems.length) * 100}%` }}
          ></div>
          <div className="progress-dots">
            {photoItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
                title={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideshowPlayer;