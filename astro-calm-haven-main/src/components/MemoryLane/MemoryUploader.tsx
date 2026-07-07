// components/MemoryLane/MemoryUploader.tsx
import React, { useState, useRef } from 'react';
import { X, Upload, Image, Video, Tag, Type } from 'lucide-react';
import { MemoryItem, MemoryType } from '../../types/memory';

interface MemoryUploaderProps {
  category: string;
  onClose: () => void;
  onUpload: (items: MemoryItem[]) => void;
}

const MemoryUploader: React.FC<MemoryUploaderProps> = ({ category, onClose, onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [headings, setHeadings] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Initialize headings for new files
      newFiles.forEach(file => {
        const fileName = file.name;
        const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
        setHeadings(prev => ({
          ...prev,
          [fileName]: baseName.charAt(0).toUpperCase() + baseName.slice(1)
        }));
        
        // Initialize tags based on file type and category
        const fileTags = [category.toLowerCase()];
        if (file.type.startsWith('image/')) fileTags.push('photo');
        if (file.type.startsWith('video/')) fileTags.push('video');
        if (category === 'family') fileTags.push('love', 'together');
        if (category === 'earth') fileTags.push('nature', 'beautiful');
        
        setTags(prev => ({
          ...prev,
          [fileName]: fileTags
        }));
      });
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
    const newHeadings = { ...headings };
    delete newHeadings[fileName];
    setHeadings(newHeadings);
  };

  const updateHeading = (fileName: string, heading: string) => {
    setHeadings(prev => ({ ...prev, [fileName]: heading }));
  };

  const addTag = (fileName: string, tag: string) => {
    if (!tag.trim()) return;
    setTags(prev => ({
      ...prev,
      [fileName]: [...(prev[fileName] || []), tag.trim().toLowerCase()]
    }));
  };

  const removeTag = (fileName: string, tagToRemove: string) => {
    setTags(prev => ({
      ...prev,
      [fileName]: (prev[fileName] || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    const uploadedItems: MemoryItem[] = [];

    for (const file of files) {
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onload = (e) => {
          const itemId = `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const isVideo = file.type.startsWith('video/');
          
          const memoryItem: MemoryItem = {
            id: itemId,
            type: isVideo ? 'video' : 'photo',
            filename: file.name,
            path: URL.createObjectURL(file), // Local URL for preview
            caption: headings[file.name] || file.name,
            date: new Date().toISOString().split('T')[0],
            tags: tags[file.name] || [category],
            duration: isVideo ? Math.floor(Math.random() * 60) + 10 : null,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            file_size: file.size,
            added: new Date().toISOString()
          };
          
          uploadedItems.push(memoryItem);
          resolve(null);
        };
        
        reader.readAsDataURL(file);
      });
    }

    // Save to localStorage
    const existingData = localStorage.getItem(`memoryLane_${category}`);
    const existingItems = existingData ? JSON.parse(existingData) : [];
    const allItems = [...existingItems, ...uploadedItems];
    localStorage.setItem(`memoryLane_${category}`, JSON.stringify(allItems));
    
    // Also save to a master list
    const allCategoriesData = localStorage.getItem('memoryLane_allCategories');
    const allCategories = allCategoriesData ? JSON.parse(allCategoriesData) : {};
    allCategories[category] = allCategories[category] || [];
    allCategories[category].push(...uploadedItems.map(item => item.id));
    localStorage.setItem('memoryLane_allCategories', JSON.stringify(allCategories));
    
    setIsUploading(false);
    onUpload(uploadedItems);
    onClose();
  };

  return (
    <div className="memory-uploader-overlay">
      <div className="memory-uploader-content">
        <div className="uploader-header">
          <h2>
            <Upload className="inline mr-2" size={24} />
            Upload to {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="uploader-body">
          {/* Upload Area */}
          <div 
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files);
              setFiles(prev => [...prev, ...droppedFiles]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="dropzone-content">
              <Upload size={48} className="mb-4 text-gray-400" />
              <p className="text-lg font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500 mt-2">Supports photos (JPG, PNG) and videos (MP4, MOV)</p>
            </div>
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="selected-files">
              <h3 className="text-lg font-semibold mb-4">
                Selected Files ({files.length})
              </h3>
              
              <div className="files-grid">
                {files.map((file) => (
                  <div key={file.name} className="file-item">
                    <div className="file-preview">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="preview-image"
                        />
                      ) : (
                        <div className="video-preview">
                          <Video size={32} />
                          <span className="text-sm mt-2">{file.name}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => removeFile(file.name)}
                        className="remove-file-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="file-info">
                      <div className="heading-input">
                        <Type size={18} className="text-gray-400" />
                        <input
                          type="text"
                          value={headings[file.name] || ''}
                          onChange={(e) => updateHeading(file.name, e.target.value)}
                          placeholder="Enter a heading/caption..."
                          className="heading-field"
                        />
                      </div>
                      
                      <div className="tags-section">
                        <div className="tags-display">
                          {(tags[file.name] || []).map(tag => (
                            <span key={tag} className="tag-badge">
                              {tag}
                              <button 
                                onClick={() => removeTag(file.name, tag)}
                                className="remove-tag"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="add-tag-input">
                          <Tag size={16} className="text-gray-400" />
                          <input
                            type="text"
                            placeholder="Add a tag..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addTag(file.name, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                            className="tag-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="uploader-actions">
            <button
              onClick={onClose}
              className="cancel-btn"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="upload-btn"
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="upload-spinner"></span>
                  Uploading...
                </>
              ) : (
                `Upload ${files.length} item${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryUploader;