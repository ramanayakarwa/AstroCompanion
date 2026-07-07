// components/MemoryLane/UploadButton.tsx
import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';

interface UploadButtonProps {
  onClick: () => void;
  category: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onClick, category }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="floating-upload-btn"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Upload to ${category}`}
    >
      <Plus className="h-6 w-6" />
      {isHovered && (
        <span className="upload-btn-tooltip">
          <Upload size={16} className="mr-1" />
          Upload Memories
        </span>
      )}
    </button>
  );
};

export default UploadButton;