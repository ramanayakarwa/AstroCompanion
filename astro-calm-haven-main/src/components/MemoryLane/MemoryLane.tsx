import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import MemoryScanner from '../../utils/memory/memoryScanner';
import MemoryViewer from './MemoryViewer';
import MemoryGrid from './MemoryGrid';
import VoiceTrigger from './VoiceTrigger';
import { generatePlaceholders } from '../../types/memoryPlaceholders';
import './MemoryLane.css';
import MemoryUploader from './MemoryUploader';
import NostalgicRandomizer from './NostalgicRandomizer';
import GalleryView from './GalleryView';
import UploadButton from './UploadButton';
import { MemoryItem, MemoryCategory } from '../../types/memory';

const MemoryLane: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryData, setCategoryData] = useState<MemoryCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNostalgicOpen, setIsNostalgicOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [userUploadedItems, setUserUploadedItems] = useState<MemoryItem[]>([]);
  const [activeVoiceTrigger, setActiveVoiceTrigger] = useState<string>('');

  const categoryIcons = {
    'family': '👨‍👩‍👧‍👦',
    'friends': '👥',
    'home': '🏠',
    'earth': '🌍',
    'pets': '🐾',
    'achievements': '🏆',
    'search': '🔍'
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initializeMemoryLane();
      initialized.current = true;
    }
  }, []);

  const loadUserUploads = async (categoryId: string) => {
    try {
      const savedData = localStorage.getItem(`memoryLane_${categoryId}`);
      if (savedData) {
        const items = JSON.parse(savedData);
        setUserUploadedItems(items);
        return items;
      }
    } catch (error) {
      console.error('Error loading user uploads:', error);
    }
    return [];
  };

  const initializeMemoryLane = async () => {
    setIsLoading(true);
    try {
      await MemoryScanner.initialize();
      const cats = await MemoryScanner.getCategories();

      // If no categories found, use placeholders
      if (cats.length === 0) {
        const placeholderData = generatePlaceholders();
        setCategories(Object.keys(placeholderData.categories));
        setSelectedCategory(Object.keys(placeholderData.categories)[0]);
        setCategoryData(placeholderData.categories[Object.keys(placeholderData.categories)[0]]);

        // Load user uploads for the selected category
        await loadUserUploads(Object.keys(placeholderData.categories)[0]);
      } else {
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
          const data = await MemoryScanner.getCategory(cats[0]);
          setCategoryData(data);

          // Load user uploads for the selected category
          await loadUserUploads(cats[0]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Memory Lane:', error);
      // Fallback to placeholders
      const placeholderData = generatePlaceholders();
      setCategories(Object.keys(placeholderData.categories));
      setSelectedCategory(Object.keys(placeholderData.categories)[0]);
      setCategoryData(placeholderData.categories[Object.keys(placeholderData.categories)[0]]);

      // Load user uploads
      await loadUserUploads(Object.keys(placeholderData.categories)[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Load real data from MemoryScanner
    const data = await MemoryScanner.getCategory(categoryId);
    setCategoryData(data);

    // Load user uploads
    const userItems = await loadUserUploads(categoryId);
    setUserUploadedItems(userItems);

    setSearchQuery('');
    setSearchResults([]);
  };

  const handleItemSelect = (item: MemoryItem) => {
    setSelectedItem(item);
    setIsViewerOpen(true);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const results = await MemoryScanner.searchMemories(query);
      // Also search through user uploaded items
      const userItems = userUploadedItems.filter(item =>
        item.caption.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults([...results, ...userItems]);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Remove from userUploadedItems state
      setUserUploadedItems(prev => prev.filter(item => item.id !== itemId));

      // Update localStorage
      const savedData = localStorage.getItem(`memoryLane_${selectedCategory}`);
      if (savedData) {
        const items = JSON.parse(savedData);
        const updatedItems = items.filter((item: MemoryItem) => item.id !== itemId);
        localStorage.setItem(`memoryLane_${selectedCategory}`, JSON.stringify(updatedItems));
      }

      // Show success message
      setActiveVoiceTrigger(`🗑️ Memory deleted successfully`);
      setTimeout(() => setActiveVoiceTrigger(''), 3000);

    } catch (error) {
      console.error('Error deleting item:', error);
      setActiveVoiceTrigger(`❌ Failed to delete memory`);
      setTimeout(() => setActiveVoiceTrigger(''), 3000);
    }
  };

  const handleUploadComplete = (uploadedItems: MemoryItem[]) => {
    setUserUploadedItems(prev => [...prev, ...uploadedItems]);
    setIsUploaderOpen(false);

    // Show success message
    setActiveVoiceTrigger(`✅ Added ${uploadedItems.length} item(s) to ${selectedCategory}`);
    setTimeout(() => setActiveVoiceTrigger(''), 3000);
  };

  const handleVoiceTrigger = async (text: string) => {
    console.log('🎤 Voice command received:', text);

    const trigger = await MemoryScanner.matchVoiceCommand(text);
    if (trigger) {
      console.log('✅ Trigger activated:', trigger.category, trigger.response);

      setActiveVoiceTrigger(trigger.response);
      setSelectedCategory(trigger.category);
      const data = await MemoryScanner.getCategory(trigger.category);
      setCategoryData(data);

      // Load user uploads for the triggered category
      await loadUserUploads(trigger.category);

      // Auto-show a random item from this category
      const allItems = [...(data?.items || []), ...userUploadedItems];
      if (allItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * allItems.length);
        const randomItem = allItems[randomIndex];
        setTimeout(() => {
          setSelectedItem(randomItem);
          setIsViewerOpen(true);
          console.log('🖼️ Auto-showing:', randomItem.caption);
        }, 1000);
      } else {
        console.log('⚠️ No items found in category:', trigger.category);
      }

      // Clear the voice trigger message after 3 seconds
      setTimeout(() => setActiveVoiceTrigger(''), 3000);
    } else {
      console.log('❌ No trigger found for:', text);
      setActiveVoiceTrigger(`No specific memories found for "${text}". Try "family", "home", or "pets".`);
      setTimeout(() => setActiveVoiceTrigger(''), 3000);
    }
  };

  const debugMemoryData = async () => {
    console.log('🔄 Debugging Memory Data...');
    console.log('Selected Category:', selectedCategory);
    console.log('Categories:', categories);
    console.log('User Uploaded Items:', userUploadedItems.length);

    const stats = await MemoryScanner.getStatistics();
    console.log('Statistics:', stats);

    const allCategories = await MemoryScanner.getCategories();
    console.log('All Categories:', allCategories);

    for (const cat of allCategories) {
      const items = await MemoryScanner.getItems(cat);
      console.log(`${cat}: ${items.length} items`);
    }
  };

  if (isLoading) {
    return (
      <div className="memory-lane loading">
        <div className="spinner"></div>
        <p>Loading cherished memories...</p>
        <div className="loading-stars">
          <span>✨</span>
          <span>⭐</span>
          <span>🌟</span>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-lane">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      {/* Enhanced Header */}
      <div className="ml-header">
        <div className="header-content">
          <div className="header-icons">
            <span className="header-icon">🌌</span>
            <span className="header-icon">🪐</span>
            <span className="header-icon">🚀</span>
          </div>
          <h1>
            <span className="gradient-text">Memory Lane</span>
            <span className="header-sub-icon">🎞️</span>
          </h1>
          <p className="ml-subtitle">
            <span className="sparkle">✨</span>
            Pre-loaded memories for emotional support during space missions
            <span className="sparkle">✨</span>
          </p>

          {activeVoiceTrigger && (
            <div className="voice-trigger-notice">
              <div className="trigger-icon">🎤</div>
              <span>{activeVoiceTrigger}</span>
            </div>
          )}
        </div>
      </div>

      {/* Debug Button (Remove in production) */}
      <button
        onClick={debugMemoryData}
        className="debug-btn"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#666',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: '100'
        }}
      >
        Debug Data
      </button>

      {/* Voice Trigger Component */}
      <VoiceTrigger onVoiceCommand={handleVoiceTrigger} />

      {/* Search Bar with Nostalgic Button */}
      <div className="ml-search">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search memories by caption, tags, or category..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="clear-search"
            >
              ✕ Clear
            </button>
          )}
          
          {/* Static Nostalgic Randomizer Button */}
          <button
            className="static-nostalgic-btn"
            onClick={() => setIsNostalgicOpen(true)}
            title="Random nostalgic slideshow from all memories"
          >
            <Shuffle size={18} />
            <span>Nostalgic Randomizer</span>
          </button>
        </div>
      </div>

      {/* Enhanced Category Navigation */}
      <div className="category-nav">
        {categories.map((catId) => {
          const cat = categoryData?.name.toLowerCase().includes(catId) ? categoryData : null;
          return (
            <button
              key={catId}
              className={`category-tab ${selectedCategory === catId ? 'active' : ''}`}
              onClick={() => {
                handleCategorySelect(catId);
                setIsGalleryOpen(true); // Open gallery when category clicked
              }}
            >
              <span className="category-icon">{categoryIcons[catId] || '📷'}</span>
              <span className="category-name">{cat?.name || catId}</span>
            </button>
          );
        })}
      </div>

      {/* Search Results or Category Content */}
      {searchResults.length > 0 ? (
        <div className="search-results">
          <div className="results-header">
            <h3>
              <span className="results-icon">{categoryIcons.search}</span>
              Search Results ({searchResults.length})
            </h3>
            <p className="results-query">For: "{searchQuery}"</p>
          </div>
          <MemoryGrid
            items={searchResults}
            onSelect={handleItemSelect}
            category="search"
          />
        </div>
      ) : categoryData ? (
        <div className="category-content">
          <div className="category-header">
            <h2>
              <span className="category-title-icon">{categoryIcons[selectedCategory] || '📷'}</span>
              {categoryData.name}
            </h2>
            <p className="category-description">{categoryData.description}</p>
          </div>

          {(categoryData.items.length > 0 || userUploadedItems.length > 0) ? (
            <MemoryGrid
              items={[...categoryData.items, ...userUploadedItems]}
              onSelect={handleItemSelect}
              category={selectedCategory}
            />
          ) : (
            <div className="no-memories">
              <div className="no-memories-icon">📸</div>
              <p>No memories in this category yet.</p>
              <p className="hint">Click the category to open gallery and upload memories</p>
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="open-gallery-btn"
              >
                📱 Open Gallery
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-category">
          <p>Select a category to view memories</p>
        </div>
      )}

      {/* Memory Viewer Modal */}
      {isViewerOpen && selectedItem && (
        <MemoryViewer
          item={selectedItem}
          category={selectedCategory}
          onClose={() => setIsViewerOpen(false)}
          onNext={async () => {
            const scannerItems = await MemoryScanner.getItems(selectedCategory);
            const allItems = [...scannerItems, ...userUploadedItems];
            const currentIndex = allItems.findIndex(item => item.id === selectedItem.id);
            const nextIndex = (currentIndex + 1) % allItems.length;
            setSelectedItem(allItems[nextIndex]);
          }}
          onPrev={async () => {
            const scannerItems = await MemoryScanner.getItems(selectedCategory);
            const allItems = [...scannerItems, ...userUploadedItems];
            const currentIndex = allItems.findIndex(item => item.id === selectedItem.id);
            const prevIndex = currentIndex === 0 ? allItems.length - 1 : currentIndex - 1;
            setSelectedItem(allItems[prevIndex]);
          }}
        />
      )}

      {/* Uploader Modal */}
      {isUploaderOpen && (
        <MemoryUploader
          category={selectedCategory}
          onClose={() => setIsUploaderOpen(false)}
          onUpload={handleUploadComplete}
        />
      )}

      {/* Gallery View with delete support */}
      {isGalleryOpen && (
        <GalleryView
          category={selectedCategory}
          items={[...(categoryData?.items || []), ...userUploadedItems]}
          onClose={() => setIsGalleryOpen(false)}
          onUploadClick={() => {
            setIsGalleryOpen(false);
            setIsUploaderOpen(true);
          }}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Floating Upload Button (only show when not in gallery/uploader) */}
      {!isGalleryOpen && !isUploaderOpen && !isNostalgicOpen && (
        <UploadButton
          category={selectedCategory}
          onClick={() => setIsUploaderOpen(true)}
        />
      )}

      {/* Nostalgic Randomizer Modal */}
      {isNostalgicOpen && (
        <NostalgicRandomizer
          onClose={() => setIsNostalgicOpen(false)}
        />
      )}

      {/* Enhanced Footer Info */}
      <div className="ml-footer">
        <div className="footer-content">
          <div className="memory-stats">
            <div className="stat-card">
              <div className="stat-icon-large">🚀</div>
              <div className="stat-info">
                <strong>Space-Ready System</strong>
                <small>All memories pre-loaded before launch • 100% offline operation</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-large">📱</div>
              <div className="stat-info">
                <strong>Upload Your Own</strong>
                <small>Add personal photos/videos with custom headings</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-large">🎤</div>
              <div className="stat-info">
                <strong>Voice-Activated</strong>
                <small>Try: "I miss my family", "Show me home", "I feel lonely"</small>
              </div>
            </div>
          </div>

          <div className="mission-notes">
            <p>
              <span className="note-icon">💫</span>
              <strong>Personal Gallery Feature:</strong> Click any category to open gallery view.
              Upload your own photos/videos with custom headings. All data is saved in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryLane;