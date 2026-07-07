import React from 'react';
import { MemoryItem } from '../../types/memory';
import './MemoryLane.css';

interface MemoryGridProps {
  items: MemoryItem[];
  onSelect: (item: MemoryItem) => void;
  category: string;
}

const MemoryGrid: React.FC<MemoryGridProps> = ({ items, onSelect, category }) => {
  if (items.length === 0) {
    return (
      <div className="memory-grid empty">
        <p>No memories found</p>
      </div>
    );
  }

  const getThumbnailUrl = (item: MemoryItem) => {
    // For now, use the same URL
    // In production, you'd have separate thumbnails
    return item.path;
  };

  return (
    <div className="memory-grid">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="memory-grid-item"
          onClick={() => onSelect(item)}
        >
          <div className="grid-item-media">
            {item.type === 'photo' ? (
              <img 
                src={getThumbnailUrl(item)} 
                alt={item.caption}
                className="grid-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/memories/placeholder.jpg';
                }}
              />
            ) : (
              <div className="grid-video-thumbnail">
                <img 
                  src={getThumbnailUrl(item)} 
                  alt={item.caption}
                  className="grid-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/memories/video-placeholder.jpg';
                  }}
                />
                <div className="video-play-icon">▶</div>
              </div>
            )}
            
            <div className="grid-item-overlay">
              <span className="item-type">{item.type === 'photo' ? '📷' : '🎬'}</span>
              <span className="item-duration">
                {item.type === 'video' && item.duration ? `${item.duration}s` : ''}
              </span>
            </div>
          </div>
          
          <div className="grid-item-info">
            <h4 className="grid-item-caption">{item.caption}</h4>
            <div className="grid-item-meta">
              <span className="grid-item-date">{item.date}</span>
              <span className="grid-item-size">{item.size}</span>
            </div>
            
            <div className="grid-item-tags">
              {item.tags.slice(0, 2).map(tag => (
                <span key={tag} className="grid-tag">{tag}</span>
              ))}
              {item.tags.length > 2 && (
                <span className="grid-tag-more">+{item.tags.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryGrid;