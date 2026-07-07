// types/memory.ts

export type MemoryType = 'photo' | 'video';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  filename: string;
  path: string;
  caption: string;
  date: string;
  tags: string[];
  duration: number | null;
  size: string;
  file_size: number;
  added: string;
  // ✅ ADD THIS LINE - Makes the placeholder work
  isPlaceholder?: boolean;
  // ✅ Optional thumbnail for videos
  thumbnail?: string;
}

export interface MemoryCategory {
  name: string;
  description: string;
  voiceTriggers: string[];
  emotionTriggers: string[];
  items: MemoryItem[];
}

export interface VoiceTrigger {
  id: string;
  phrases: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
  response: string;
}

export interface EmotionMapping {
  emotion: string;
  categories: string[];
  priority: 'high' | 'medium' | 'low';
  message: string;
}

export interface MemoriesData {
  categories: Record<string, MemoryCategory>;
}

export interface MemoryViewerProps {
  item: MemoryItem;
  category: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export interface MemoryGridProps {
  items: MemoryItem[];
  onSelect: (item: MemoryItem) => void;
  category: string;
}

export interface VoiceTriggerProps {
  onVoiceCommand: (text: string) => void;
}

// ✅ Optional: Add helper type for placeholder items
export interface PlaceholderMemoryItem extends MemoryItem {
  isPlaceholder: true;
  thumbnail?: string;
}

// ✅ Optional: Add helper type for placeholder categories
export interface PlaceholderCategory extends MemoryCategory {
  items: Array<PlaceholderMemoryItem>;
}

// ✅ Optional: Add helper function type for placeholder generation
export type PlaceholderGenerator = () => {
  categories: Record<string, PlaceholderCategory>;
};