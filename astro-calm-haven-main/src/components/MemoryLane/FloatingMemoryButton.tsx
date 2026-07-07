import React, { useState } from 'react';
import { Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingMemoryButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/memory-lane');
  };

  return (
    <button
      className="floating-memory-btn"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Memory Lane - Family Photos"
    >
      <Images className="h-6 w-6" />
      {isHovered && (
        <span className="floating-btn-tooltip">Memory Lane</span>
      )}
    </button>
  );
};

export default FloatingMemoryButton;