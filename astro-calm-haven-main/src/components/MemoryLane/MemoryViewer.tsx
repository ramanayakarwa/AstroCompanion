import React, { useState, useEffect, useRef } from 'react';
import { MemoryItem } from '../../types/memory';
import './MemoryLane.css';

interface MemoryViewerProps {
  item: MemoryItem;
  category: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MemoryViewer: React.FC<MemoryViewerProps> = ({
  item,
  category,
  onClose,
  onNext,
  onPrev
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Pause video when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (item.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="memory-viewer-overlay" onClick={onClose}>
      <div className="memory-viewer-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="viewer-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Media display */}
        <div className="viewer-media">
          {item.type === 'photo' ? (
            <img 
              src={item.path} 
              alt={item.caption}
              className="viewer-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/memories/placeholder.jpg';
              }}
            />
          ) : (
            <div className="video-container">
              <video
                ref={videoRef}
                src={item.path}
                className="viewer-video"
                controls
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div className="video-play-overlay" onClick={handlePlayPause}>
                  <div className="play-icon">▶</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memory info */}
        <div className="viewer-info">
          <h3 className="viewer-caption">{item.caption}</h3>
          <div className="viewer-meta">
            <span className="viewer-category">{category}</span>
            <span className="viewer-date">{item.date}</span>
            <span className="viewer-size">{item.size}</span>
          </div>
          
          <div className="viewer-tags">
            {item.tags.map(tag => (
              <span key={tag} className="viewer-tag">{tag}</span>
            ))}
          </div>

          <div className="viewer-actions">
            <button onClick={onPrev} className="nav-btn prev-btn">◀ Previous</button>
            <button onClick={onNext} className="nav-btn next-btn">Next ▶</button>
          </div>
        </div>

        {/* Navigation hints */}
        <div className="viewer-hints">
          <small>Use ← → arrows to navigate • ESC to close</small>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;