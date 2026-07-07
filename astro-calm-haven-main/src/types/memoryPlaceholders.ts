// types/memoryPlaceholders.ts

import { MemoryItem, MemoryCategory } from './memory';

export interface PlaceholderCategory extends MemoryCategory {
  items: Array<MemoryItem & { isPlaceholder: true }>;
}

export interface PlaceholderData {
  categories: Record<string, PlaceholderCategory>;
}

export const generatePlaceholders = (): PlaceholderData => {
  const categories: Record<string, PlaceholderCategory> = {};
  
  // All categories
  const categoryList = [
    'family', 
    'friends', 
    'home', 
    'earth', 
    'pets', 
    'achievements'
  ];
  
  categoryList.forEach(category => {
    // Generate 20 photo placeholders
    const photos = Array.from({ length: 20 }, (_, i) => 
      createPhotoPlaceholder(category, i + 1)
    );
    
    // Generate 20 video placeholders
    const videos = Array.from({ length: 20 }, (_, i) => 
      createVideoPlaceholder(category, i + 1)
    );
    
    categories[category] = {
      name: getCategoryName(category),
      description: getCategoryDescription(category),
      voiceTriggers: getVoiceTriggers(category),
      emotionTriggers: getEmotionTriggers(category),
      items: [...photos, ...videos] as Array<MemoryItem & { isPlaceholder: true }>
    };
  });
  
  return { categories };
};

// Create individual photo placeholder
const createPhotoPlaceholder = (category: string, index: number): MemoryItem & { isPlaceholder: true } => {
  const caption = getCaption(category, 'photo', index);
  
  return {
    id: `${category}-photo-${index.toString().padStart(3, '0')}`,
    type: 'photo',
    filename: `placeholder-photo-${index}.jpg`,
    path: `/memories/${category}/photos/placeholder-photo-${index}.jpg`, // ✅ FIXED: removed /placeholders
    caption: caption,
    date: getRandomDate(),
    tags: getTags(category, 'photo', index),
    duration: null,
    size: `${(1.5 + Math.random() * 2.5).toFixed(1)} MB`,
    file_size: Math.floor((1.5 + Math.random() * 2.5) * 1024 * 1024),
    added: new Date().toISOString(),
    isPlaceholder: true
  };
};

// Create individual video placeholder
const createVideoPlaceholder = (category: string, index: number): MemoryItem & { isPlaceholder: true } => {
  const caption = getCaption(category, 'video', index);
  
  return {
    id: `${category}-video-${index.toString().padStart(3, '0')}`,
    type: 'video',
    filename: `placeholder-video-${index}.mp4`,
    path: `/memories/${category}/videos/placeholder-video-${index}.mp4`, // ✅ FIXED: removed /placeholders
    caption: caption,
    date: getRandomDate(),
    tags: getTags(category, 'video', index),
    duration: Math.floor(15 + Math.random() * 45), // 15-60 seconds
    size: `${(30 + Math.random() * 70).toFixed(1)} MB`,
    file_size: Math.floor((30 + Math.random() * 70) * 1024 * 1024),
    added: new Date().toISOString(),
    isPlaceholder: true,
    thumbnail: `/memories/${category}/videos/placeholder-video-${index}.jpg` // ✅ FIXED: removed /placeholders
  };
};

// Get category display name
const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    family: 'Family',
    friends: 'Friends',
    home: 'Home',
    earth: 'Earth',
    pets: 'Pets',
    achievements: 'Achievements'
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Get category description
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    family: 'Photos and videos of family members and cherished moments together. These memories provide comfort during lonely times in space.',
    friends: 'Memories with friends and colleagues from Earth. Moments of laughter, celebration, and camaraderie.',
    home: 'Photos of home, city, and neighborhood. Familiar scenes that bring a sense of belonging and peace.',
    earth: 'Beautiful Earth landscapes, nature scenes, and planet views. Reminders of our beautiful home planet.',
    pets: 'Photos and videos of beloved pets and animal companions. Unconditional love and joyful moments.',
    achievements: 'Personal achievements, milestones, and proud moments. Inspiration during challenging times.'
  };
  return descriptions[category] || `Memories related to ${category}`;
};

// Get caption for photo/video
const getCaption = (category: string, type: 'photo' | 'video', index: number): string => {
  // Base templates for each category
  const baseTemplates: Record<string, Record<string, string>> = {
    family: {
      photo: 'Family Memory #{index}',
      video: 'Family Moment #{index}'
    },
    friends: {
      photo: 'Friends Gathering #{index}',
      video: 'Fun with Friends #{index}'
    },
    home: {
      photo: 'Home Sweet Home #{index}',
      video: 'Home Memories #{index}'
    },
    earth: {
      photo: 'Earth Beauty #{index}',
      video: 'Planet View #{index}'
    },
    pets: {
      photo: 'Pet Companion #{index}',
      video: 'Playful Pet #{index}'
    },
    achievements: {
      photo: 'Achievement #{index}',
      video: 'Success Story #{index}'
    }
  };

  const template = baseTemplates[category]?.[type] || `${type === 'photo' ? 'Photo' : 'Video'} #{index}`;
  
  // Variations to make each caption unique
  const variations = [
    `Special ${template.replace('#{index}', `#${index}`)}`,
    `Remembering ${template.replace('#{index}', `${index}`)}`,
    `${template.replace('#{index}', `${index}`)}: Cherished Memory`,
    `${template.replace('#{index}', `${index}`)} from Earth`,
    `Astronaut's ${template.replace('#{index}', `${index}`).toLowerCase()}`
  ];
  
  return variations[index % variations.length];
};

// Get random date from the past 2 years
const getRandomDate = (): string => {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  const end = new Date();
  
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Get tags for search functionality
const getTags = (category: string, type: 'photo' | 'video', index: number): string[] => {
  const baseTags = [
    category,
    type,
    'memory',
    'astronaut',
    'space',
    'earth',
    'comfort',
    'emotional-support'
  ];
  
  // Additional category-specific tags
  const categoryTags: Record<string, string[]> = {
    family: ['love', 'together', 'familytime', 'parents', 'children', 'siblings', 'home'],
    friends: ['friendship', 'fun', 'gathering', 'laugh', 'party', 'colleagues'],
    home: ['comfort', 'safe', 'belonging', 'house', 'apartment', 'neighborhood', 'city'],
    earth: ['nature', 'beautiful', 'planet', 'landscape', 'ocean', 'mountain', 'forest'],
    pets: ['cute', 'companion', 'animal', 'dog', 'cat', 'pet', 'loyal'],
    achievements: ['success', 'proud', 'milestone', 'accomplishment', 'goal', 'dream']
  };
  
  // Some specific tags based on index
  const specificTags: string[] = [];
  if (index % 3 === 0) specificTags.push('favorite');
  if (index % 5 === 0) specificTags.push('special');
  if (index <= 5) specificTags.push('top-pick');
  if (type === 'video') specificTags.push('motion', 'clip');
  if (type === 'photo') specificTags.push('still', 'picture');
  
  return [...baseTags, ...(categoryTags[category] || []), ...specificTags];
};

// Get voice triggers for each category
const getVoiceTriggers = (category: string): string[] => {
  const triggers: Record<string, string[]> = {
    family: [
      'family', 'parents', 'mom', 'dad', 'mother', 'father', 
      'children', 'kids', 'siblings', 'brother', 'sister',
      'i miss my family', 'show me family photos', 'family memories'
    ],
    friends: [
      'friends', 'buddies', 'colleagues', 'team', 'crew',
      'i miss my friends', 'show friends', 'hang out',
      'fun times', 'my buddies'
    ],
    home: [
      'home', 'house', 'apartment', 'city', 'town',
      'i miss home', 'show me home', 'my neighborhood',
      'where i grew up', 'hometown'
    ],
    earth: [
      'earth', 'planet', 'nature', 'beautiful',
      'i miss earth', 'show earth', 'our planet',
      'blue planet', 'home planet', 'earth views'
    ],
    pets: [
      'pet', 'dog', 'cat', 'animal', 'companion',
      'i miss my pet', 'show my dog', 'my cat',
      'animal friend', 'furry friend'
    ],
    achievements: [
      'achievement', 'success', 'milestone', 'accomplishment',
      'show achievements', 'my successes', 'proud moments',
      'what i accomplished', 'goals achieved'
    ]
  };
  return triggers[category] || [category];
};

// Get emotion triggers for each category
const getEmotionTriggers = (category: string): string[] => {
  const triggers: Record<string, string[]> = {
    family: ['lonely', 'homesick', 'sad', 'nostalgic', 'missing', 'emotional'],
    friends: ['lonely', 'isolated', 'missing', 'bored', 'need company'],
    home: ['homesick', 'longing', 'comfort', 'safe', 'belonging'],
    earth: ['awestruck', 'peaceful', 'inspired', 'humbled', 'small'],
    pets: ['lonely', 'needing comfort', 'happy', 'playful', 'loved'],
    achievements: ['demotivated', 'proud', 'inspired', 'accomplished', 'successful']
  };
  return triggers[category] || [category];
};

// Get all categories
export const getAllCategories = (): string[] => {
  return ['family', 'friends', 'home', 'earth', 'pets', 'achievements'];
};

// Get statistics about placeholders
export const getPlaceholderStats = () => {
  const data = generatePlaceholders();
  const stats: Record<string, { photos: number; videos: number; total: number }> = {};
  
  Object.entries(data.categories).forEach(([category, categoryData]) => {
    const photos = categoryData.items.filter(item => item.type === 'photo').length;
    const videos = categoryData.items.filter(item => item.type === 'video').length;
    stats[category] = { photos, videos, total: photos + videos };
  });
  
  const totalPhotos = Object.values(stats).reduce((sum, s) => sum + s.photos, 0);
  const totalVideos = Object.values(stats).reduce((sum, s) => sum + s.videos, 0);
  
  return {
    totalCategories: Object.keys(stats).length,
    totalPhotos,
    totalVideos,
    totalItems: totalPhotos + totalVideos,
    categoryStats: stats
  };
};

// Check if an item is a placeholder
export const isPlaceholderItem = (item: MemoryItem): boolean => {
  return !!(item as any).isPlaceholder || 
         item.filename.includes('placeholder') ||
         item.path.includes('placeholders');
};

// Get placeholder image URL (for use when actual images don't exist)
export const getPlaceholderImageUrl = (category: string, type: 'photo' | 'video', index: number): string => {
  // Using Lorem Picsum for actual placeholder images
  const width = type === 'photo' ? 400 : 600;
  const height = type === 'photo' ? 300 : 400;
  
  return `https://picsum.photos/${width}/${height}?random=${category}-${type}-${index}`;
};

// Generate sample data for preview (returns first 5 items of each type)
export const getSamplePlaceholders = (): PlaceholderData => {
  const fullData = generatePlaceholders();
  const sampleData: Record<string, PlaceholderCategory> = {};
  
  Object.entries(fullData.categories).forEach(([category, categoryData]) => {
    // Take only first 5 photos and first 5 videos for sample
    const photos = categoryData.items.filter(item => item.type === 'photo').slice(0, 5);
    const videos = categoryData.items.filter(item => item.type === 'video').slice(0, 5);
    
    sampleData[category] = {
      ...categoryData,
      items: [...photos, ...videos] as Array<MemoryItem & { isPlaceholder: true }>
    };
  });
  
  return { categories: sampleData };
};

// Export default for easy import
export default {
  generatePlaceholders,
  getAllCategories,
  getPlaceholderStats,
  isPlaceholderItem,
  getPlaceholderImageUrl,
  getSamplePlaceholders
};