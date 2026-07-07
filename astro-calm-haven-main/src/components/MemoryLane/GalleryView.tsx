// components/MemoryLane/GalleryView.tsx
import React, { useState, useEffect } from 'react';
import { Grid, List, ChevronLeft, ChevronRight, X, Play, Trash2, Edit, Music } from 'lucide-react';
import { MemoryItem } from '../../types/memory';
import { Video } from 'lucide-react';
import SlideshowPlayer from './SlideshowPlayer';
import './MemoryLane.css';

interface GalleryViewProps {
  category: string;
  items: MemoryItem[];
  onClose: () => void;
  onUploadClick: () => void;
  onDeleteItem?: (itemId: string) => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ 
  category, 
  items, 
  onClose, 
  onUploadClick,
  onDeleteItem 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);
  const [editedCaption, setEditedCaption] = useState('');
  const [showSlideshow, setShowSlideshow] = useState(false);

  const filteredItems = items.filter(item => 
    item.path && !item.path.includes('undefined')
  );

  // Count only photos for slideshow
  const photoItems = filteredItems.filter(item => item.type === 'photo');

  const handleItemClick = (item: MemoryItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const handleDeleteClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't allow deletion of placeholder items
    const item = items.find(i => i.id === itemId);
    if (item?.isPlaceholder) {
      alert("Sample memories cannot be deleted. Only your uploaded memories can be removed.");
      return;
    }
    
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDeleteItem) {
      onDeleteItem(itemToDelete);
      
      // Also remove from localStorage
      const existingData = localStorage.getItem(`memoryLane_${category}`);
      if (existingData) {
        try {
          const items = JSON.parse(existingData);
          const updatedItems = items.filter((item: MemoryItem) => item.id !== itemToDelete);
          localStorage.setItem(`memoryLane_${category}`, JSON.stringify(updatedItems));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      
      // Remove from IndexedDB if exists
      if ('indexedDB' in window) {
        try {
          const request = indexedDB.open('MemoryLaneDB', 2);
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains('memories')) {
              const transaction = db.transaction(['memories'], 'readwrite');
              const store = transaction.objectStore('memories');
              store.delete(itemToDelete);
            }
          };
        } catch (error) {
          console.error('Error deleting from IndexedDB:', error);
        }
      }
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
    
    // If we were viewing the deleted item, close the viewer
    if (selectedItem?.id === itemToDelete) {
      setSelectedItem(null);
    }
  };

  const handleEditClick = (item: MemoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't allow editing of placeholder items
    if (item.isPlaceholder) {
      alert("Sample memories cannot be edited. Only your uploaded memories can be modified.");
      return;
    }
    
    setEditingItem(item);
    setEditedCaption(item.caption);
  };

  const saveCaption = () => {
    if (editingItem) {
      // Update in localStorage
      const existingData = localStorage.getItem(`memoryLane_${category}`);
      if (existingData) {
        try {
          const items = JSON.parse(existingData);
          const updatedItems = items.map((item: MemoryItem) => 
            item.id === editingItem.id ? { ...item, caption: editedCaption } : item
          );
          localStorage.setItem(`memoryLane_${category}`, JSON.stringify(updatedItems));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      
      // Update in IndexedDB
      if ('indexedDB' in window) {
        try {
          const request = indexedDB.open('MemoryLaneDB', 2);
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains('memories')) {
              const transaction = db.transaction(['memories'], 'readwrite');
              const store = transaction.objectStore('memories');
              store.get(editingItem.id).onsuccess = (e) => {
                const item = (e.target as IDBRequest).result;
                if (item) {
                  item.caption = editedCaption;
                  store.put(item);
                }
              };
            }
          };
        } catch (error) {
          console.error('Error updating IndexedDB:', error);
        }
      }
      
      setEditingItem(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedItem(filteredItems[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedItem(filteredItems[currentIndex - 1]);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedItem && !showSlideshow) {
        if (e.key === 'Escape') {
          setSelectedItem(null);
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, showSlideshow]);

  return (
    <div className="gallery-view">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-icon">🗑️</div>
            <h3>Delete Memory</h3>
            <p>Are you sure you want to delete this memory? This action cannot be undone.</p>
            <div className="delete-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-delete-btn"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="confirm-delete-btn"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-header">
              <h3>Edit Caption</h3>
              <button onClick={() => setEditingItem(null)} className="close-edit-btn">
                <X size={20} />
              </button>
            </div>
            <div className="edit-preview">
              {editingItem.type === 'photo' ? (
                <img 
                  src={editingItem.path} 
                  alt={editingItem.caption}
                  className="edit-preview-image"
                />
              ) : (
                <div className="edit-video-preview">
                  <Video size={32} />
                  <span>Video</span>
                </div>
              )}
            </div>
            <div className="edit-input">
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                placeholder="Enter caption..."
                className="caption-textarea"
                rows={3}
                autoFocus
              />
            </div>
            <div className="edit-actions">
              <button 
                onClick={() => setEditingItem(null)}
                className="cancel-edit-btn"
              >
                Cancel
              </button>
              <button 
                onClick={saveCaption}
                className="save-edit-btn"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slideshow Player */}
      {showSlideshow && (
        <SlideshowPlayer
          items={photoItems}
          category={category}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      {/* Gallery Header */}
      <div className="gallery-header">
        <div className="gallery-title">
          <button onClick={onClose} className="back-btn">
            <ChevronLeft size={24} />
            Back to Categories
          </button>
          <h1 className="gallery-category">
            {category.charAt(0).toUpperCase() + category.slice(1)} Gallery
            <span className="item-count">({filteredItems.length} items)</span>
          </h1>
        </div>
        
        <div className="gallery-controls">
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={() => setShowSlideshow(true)}
              className="slideshow-btn"
              title="Start nostalgic slideshow with music"
              disabled={photoItems.length === 0}
            >
              <Play size={18} className="mr-2" />
              Slideshow
              {photoItems.length > 0 && (
                <span className="slideshow-count">{photoItems.length}</span>
              )}
            </button>
            
            <button 
              onClick={onUploadClick}
              className="upload-new-btn"
            >
              + Add Memories
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className={`gallery-content ${viewMode}-view`}>
        {filteredItems.length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">📷</div>
            <h3>No memories yet</h3>
            <p>Start by uploading photos or videos</p>
            <div className="empty-actions">
              <button onClick={onUploadClick} className="upload-first-btn">
                Upload First Memory
              </button>
              <button 
                onClick={onClose}
                className="browse-categories-btn"
              >
                Browse Categories
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className={`gallery-item ${viewMode === 'list' ? 'list-item' : 'grid-item'}`}
              onClick={() => handleItemClick(item, index)}
            >
              {/* Slideshow Indicator for Photos */}
              {item.type === 'photo' && (
                <div className="slideshow-indicator" title="Included in slideshow">
                  <Music size={12} />
                </div>
              )}

              {/* Delete Button - Top Right Corner */}
              {!item.isPlaceholder && (
                <button 
                  onClick={(e) => handleDeleteClick(item.id, e)}
                  className="delete-item-btn"
                  title="Delete this memory"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {/* Edit Button - Top Left Corner */}
              {!item.isPlaceholder && (
                <button 
                  onClick={(e) => handleEditClick(item, e)}
                  className="edit-item-btn"
                  title="Edit caption"
                >
                  <Edit size={16} />
                </button>
              )}
              
              <div className="item-media">
                {item.type === 'photo' ? (
                  <img 
                    src={item.path}
                    alt={item.caption}
                    className="gallery-image"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxNzJiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <div className="gallery-video">
                    <div className="video-thumbnail">
                      <Play size={24} className="play-icon" />
                    </div>
                    <span className="video-duration">{item.duration || 0}s</span>
                  </div>
                )}
              </div>
              
              <div className="item-info">
                <h4 className="item-caption">{item.caption}</h4>
                <div className="item-meta">
                  <span className="item-date">{item.date}</span>
                  <span className="item-size">{item.size}</span>
                  <span className={`item-type ${item.type}`}>
                    {item.type === 'photo' ? '📷' : '🎬'}
                  </span>
                  {item.isPlaceholder && (
                    <span className="placeholder-badge">Sample</span>
                  )}
                </div>
                
                {viewMode === 'list' && (
                  <div className="item-tags">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="more-tags">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fullscreen Viewer with Delete Option */}
      {selectedItem && !showSlideshow && (
        <div className="fullscreen-viewer" onClick={() => setSelectedItem(null)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedItem(null)}
              className="close-fullscreen-btn"
              title="Close (ESC)"
            >
              <X size={24} />
            </button>

            {/* Slideshow Button in Fullscreen */}
            {selectedItem.type === 'photo' && photoItems.length > 1 && (
              <button 
                onClick={() => {
                  setSelectedItem(null);
                  setShowSlideshow(true);
                }}
                className="fullscreen-slideshow-btn"
                title="Start slideshow"
              >
                <Play size={18} className="mr-2" />
                Start Slideshow
              </button>
            )}

            {/* Delete button in fullscreen */}
            {!selectedItem.isPlaceholder && (
              <button 
                onClick={() => {
                  setSelectedItem(null);
                  handleDeleteClick(selectedItem.id, {} as React.MouseEvent);
                }}
                className="fullscreen-delete-btn"
                title="Delete this memory"
              >
                <Trash2 size={20} />
                <span>Delete</span>
              </button>
            )}

            {/* Edit button in fullscreen */}
            {!selectedItem.isPlaceholder && (
              <button 
                onClick={() => {
                  setSelectedItem(null);
                  handleEditClick(selectedItem, {} as React.MouseEvent);
                }}
                className="fullscreen-edit-btn"
                title="Edit caption"
              >
                <Edit size={20} />
                <span>Edit</span>
              </button>
            )}
            
            <div className="viewer-navigation">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="nav-btn prev-btn"
                title="Previous (←)"
              >
                <ChevronLeft size={32} />
              </button>
              
              <div className="viewer-media">
                {selectedItem.type === 'photo' ? (
                  <img 
                    src={selectedItem.path}
                    alt={selectedItem.caption}
                    className="fullscreen-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxNzJiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <video 
                    src={selectedItem.path}
                    controls
                    autoPlay
                    className="fullscreen-video"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={currentIndex === filteredItems.length - 1}
                className="nav-btn next-btn"
                title="Next (→)"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            <div className="viewer-info">
              <h2 className="viewer-caption">{selectedItem.caption}</h2>
              <div className="viewer-meta">
                <span className="viewer-index">
                  {currentIndex + 1} / {filteredItems.length}
                </span>
                <span className="viewer-date">{selectedItem.date}</span>
                {selectedItem.type === 'video' && (
                  <span className="viewer-duration">{selectedItem.duration || 0}s</span>
                )}
                {selectedItem.isPlaceholder && (
                  <span className="placeholder-badge">Sample Memory</span>
                )}
              </div>
              
              <div className="viewer-tags">
                {selectedItem.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              {/* Slideshow Note */}
              {selectedItem.type === 'photo' && photoItems.length > 1 && (
                <div className="slideshow-note">
                  <Music size={14} />
                  <span>This photo can be viewed in slideshow mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;