// utils/memory/memoryScanner.ts

import { MemoryItem, MemoryCategory } from '../../types/memory';

class MemoryScanner {
  private static instance: MemoryScanner;
  private categories: Record<string, MemoryCategory> = {};
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): MemoryScanner {
    if (!MemoryScanner.instance) {
      MemoryScanner.instance = new MemoryScanner();
    }
    return MemoryScanner.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load real memories from metadata
      await this.loadRealMemories();
      
      // If no categories loaded, generate placeholders
      if (Object.keys(this.categories).length === 0) {
        console.log('📸 No real memories found. Generating 20 photos + 20 videos per category...');
        this.generatePlaceholderMemories();
      }
      
      this.initialized = true;
      console.log(`🎞️ Memory Scanner initialized with ${Object.keys(this.categories).length} categories`);
      console.log(`📊 Total items: ${this.getTotalItems()}`);
    } catch (error) {
      console.error('❌ Failed to load memories, using placeholders:', error);
      this.generatePlaceholderMemories();
      this.initialized = true;
    }
  }

  private async loadRealMemories(): Promise<void> {
    try {
      const response = await fetch('/memories/metadata/memories.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && data.categories) {
        this.categories = data.categories;
        console.log(`✅ Loaded ${Object.keys(this.categories).length} categories from metadata`);
      }
    } catch (error) {
      console.log('📝 No existing metadata found, will use placeholders');
      // Don't throw, just proceed to generate placeholders
    }
  }

  private generatePlaceholderMemories(): void {
    const categories = ['family', 'friends', 'home', 'earth', 'pets', 'achievements'];
    
    categories.forEach(category => {
      // Generate 20 photo placeholders
      const photos = Array.from({ length: 20 }, (_, i) => 
        this.createPhotoPlaceholder(category, i + 1)
      );
      
      // Generate 20 video placeholders
      const videos = Array.from({ length: 20 }, (_, i) => 
        this.createVideoPlaceholder(category, i + 1)
      );
      
      this.categories[category] = {
        name: this.getCategoryName(category),
        description: this.getCategoryDescription(category),
        voiceTriggers: this.getVoiceTriggers(category),
        emotionTriggers: this.getEmotionTriggers(category),
        items: [...photos, ...videos]
      };
      
      console.log(`✅ Generated ${photos.length} photos + ${videos.length} videos for ${category}`);
    });
  }

  private createPhotoPlaceholder(category: string, index: number): MemoryItem {
    const caption = this.getCaption(category, 'photo', index);
    const fileSize = 1.5 + Math.random() * 2.5;
    
    return {
      id: `${category}-photo-${index.toString().padStart(3, '0')}`,
      type: 'photo' as const,
      filename: `placeholder-photo-${index}.jpg`,
      path: `/memories/${category}/photos/placeholder-photo-${index}.jpg`,
      caption: caption,
      date: this.getRandomDate(),
      tags: this.getTags(category, 'photo', index),
      duration: null,
      size: `${fileSize.toFixed(1)} MB`,
      file_size: Math.floor(fileSize * 1024 * 1024),
      added: new Date().toISOString(),
      isPlaceholder: true
    };
  }

  private createVideoPlaceholder(category: string, index: number): MemoryItem {
    const caption = this.getCaption(category, 'video', index);
    const fileSize = 30 + Math.random() * 70;
    const duration = Math.floor(15 + Math.random() * 45);
    
    return {
      id: `${category}-video-${index.toString().padStart(3, '0')}`,
      type: 'video' as const,
      filename: `placeholder-video-${index}.mp4`,
      path: `/memories/${category}/videos/placeholder-video-${index}.mp4`,
      caption: caption,
      date: this.getRandomDate(),
      tags: this.getTags(category, 'video', index),
      duration: duration,
      size: `${fileSize.toFixed(1)} MB`,
      file_size: Math.floor(fileSize * 1024 * 1024),
      added: new Date().toISOString(),
      isPlaceholder: true
    };
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      family: 'Family',
      friends: 'Friends',
      home: 'Home',
      earth: 'Earth',
      pets: 'Pets',
      achievements: 'Achievements'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      family: 'Photos and videos of family members and gatherings. These memories provide comfort during lonely times in space.',
      friends: 'Memories with friends and colleagues from Earth. Moments of laughter and camaraderie.',
      home: 'Photos of home, city, and neighborhood. Familiar scenes that bring a sense of belonging.',
      earth: 'Beautiful Earth landscapes and nature scenes. Reminders of our beautiful home planet.',
      pets: 'Photos of pets and animal companions. Unconditional love and joyful moments.',
      achievements: 'Personal achievements and milestones. Inspiration during challenging times.'
    };
    return descriptions[category] || `Memories related to ${category}`;
  }

  private getCaption(category: string, type: 'photo' | 'video', index: number): string {
    const baseTitles: Record<string, Record<string, string>> = {
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

    const base = baseTitles[category]?.[type] || `${type === 'photo' ? 'Photo' : 'Video'} #{index}`;
    
    // Add variety to captions
    const variations = [
      `${base.replace('#{index}', `#${index}`)}`,
      `Special ${base.replace('#{index}', `${index}`)}`,
      `Remembering ${base.replace('#{index}', `${index}`)}`,
      `${base.replace('#{index}', `${index}`)} from Earth`,
      `Astronaut's ${base.replace('#{index}', `${index}`).toLowerCase()}`
    ];
    
    return variations[index % variations.length];
  }

  private getRandomDate(): string {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 2);
    const end = new Date();
    
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  private getTags(category: string, type: 'photo' | 'video', index: number): string[] {
    const baseTags = [category, type, 'memory', 'astronaut', 'space'];
    
    const categoryTags: Record<string, string[]> = {
      family: ['love', 'together', 'familytime', 'home', 'comfort'],
      friends: ['friendship', 'fun', 'gathering', 'laugh', 'joy'],
      home: ['comfort', 'safe', 'belonging', 'house', 'city'],
      earth: ['nature', 'beautiful', 'planet', 'landscape', 'blue'],
      pets: ['cute', 'companion', 'animal', 'love', 'loyal'],
      achievements: ['success', 'proud', 'milestone', 'accomplishment', 'goal']
    };
    
    const specificTags: string[] = [];
    if (index % 3 === 0) specificTags.push('favorite');
    if (index % 5 === 0) specificTags.push('special');
    if (index <= 5) specificTags.push('top-pick');
    if (type === 'video') specificTags.push('motion');
    
    return [...baseTags, ...(categoryTags[category] || []), ...specificTags];
  }

  private getVoiceTriggers(category: string): string[] {
    const triggers: Record<string, string[]> = {
      family: ['family', 'parents', 'mom', 'dad', 'children', 'siblings', 'i miss my family'],
      friends: ['friends', 'buddies', 'colleagues', 'team', 'i miss my friends'],
      home: ['home', 'house', 'apartment', 'city', 'i miss home'],
      earth: ['earth', 'planet', 'nature', 'beautiful', 'i miss earth'],
      pets: ['pet', 'dog', 'cat', 'animal', 'i miss my pet'],
      achievements: ['achievement', 'success', 'milestone', 'accomplishment']
    };
    return triggers[category] || [category];
  }

  private getEmotionTriggers(category: string): string[] {
    const triggers: Record<string, string[]> = {
      family: ['lonely', 'homesick', 'sad', 'nostalgic'],
      friends: ['lonely', 'isolated', 'missing'],
      home: ['homesick', 'longing', 'comfort'],
      earth: ['awestruck', 'peaceful', 'inspired'],
      pets: ['lonely', 'needing comfort', 'happy'],
      achievements: ['demotivated', 'proud', 'inspired']
    };
    return triggers[category] || [category];
  }

  private getTotalItems(): number {
    return Object.values(this.categories).reduce((total, category) => 
      total + category.items.length, 0
    );
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // ========== PUBLIC API ==========

  async getCategories(): Promise<string[]> {
    await this.ensureInitialized();
    return Object.keys(this.categories);
  }

  async getCategory(categoryId: string): Promise<MemoryCategory | null> {
    await this.ensureInitialized();
    return this.categories[categoryId] || null;
  }

  async getItems(categoryId: string): Promise<MemoryItem[]> {
    await this.ensureInitialized();
    return this.categories[categoryId]?.items || [];
  }

  async searchMemories(query: string): Promise<MemoryItem[]> {
    await this.ensureInitialized();
    
    const searchTerm = query.toLowerCase();
    const results: MemoryItem[] = [];
    
    for (const category of Object.values(this.categories)) {
      for (const item of category.items) {
        const matchesCaption = item.caption.toLowerCase().includes(searchTerm);
        const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesType = item.type.toLowerCase().includes(searchTerm);
        
        if (matchesCaption || matchesTags || matchesType) {
          results.push(item);
        }
      }
    }
    
    return results;
  }

  async matchVoiceCommand(command: string): Promise<{ category: string; response: string } | null> {
    await this.ensureInitialized();
    
    const normalizedCommand = command.toLowerCase();
    
    for (const [categoryId, category] of Object.entries(this.categories)) {
      for (const trigger of category.voiceTriggers) {
        if (normalizedCommand.includes(trigger.toLowerCase())) {
          return {
            category: categoryId,
            response: `Showing ${category.name} memories for "${command}"`
          };
        }
      }
    }
    
    return null;
  }

  async getRandomItem(categoryId: string): Promise<MemoryItem | null> {
    await this.ensureInitialized();
    
    const items = this.categories[categoryId]?.items;
    if (!items || items.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  async getEmotionSuggestions(emotion: string): Promise<string[]> {
    await this.ensureInitialized();
    
    const suggestions: string[] = [];
    const normalizedEmotion = emotion.toLowerCase();
    
    for (const [categoryId, category] of Object.entries(this.categories)) {
      if (category.emotionTriggers.some(trigger => 
        normalizedEmotion.includes(trigger.toLowerCase())
      )) {
        suggestions.push(categoryId);
      }
    }
    
    if (suggestions.length === 0) {
      return Object.keys(this.categories);
    }
    
    return suggestions;
  }

  async getStatistics(): Promise<{
    totalMemories: number;
    totalPhotos: number;
    totalVideos: number;
    categories: Record<string, { photos: number; videos: number; total: number }>;
  }> {
    await this.ensureInitialized();
    
    let totalPhotos = 0;
    let totalVideos = 0;
    const categoryStats: Record<string, { photos: number; videos: number; total: number }> = {};
    
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const photos = category.items.filter(item => item.type === 'photo').length;
      const videos = category.items.filter(item => item.type === 'video').length;
      
      categoryStats[categoryId] = { photos, videos, total: photos + videos };
      totalPhotos += photos;
      totalVideos += videos;
    }
    
    return {
      totalMemories: totalPhotos + totalVideos,
      totalPhotos,
      totalVideos,
      categories: categoryStats
    };
  }

  // For debugging
  async debug(): Promise<void> {
    await this.ensureInitialized();
    
    console.log('🔍 Memory Scanner Debug Info');
    console.log('==========================');
    
    const stats = await this.getStatistics();
    console.log(`📊 Total Categories: ${Object.keys(this.categories).length}`);
    console.log(`📸 Total Photos: ${stats.totalPhotos}`);
    console.log(`🎬 Total Videos: ${stats.totalVideos}`);
    console.log(`🎯 Total Items: ${stats.totalMemories}`);
    
    console.log('\n📁 Category Details:');
    for (const [categoryId, category] of Object.entries(this.categories)) {
      const catStats = stats.categories[categoryId];
      console.log(`  ${category.name} (${categoryId}):`);
      console.log(`    📝 ${category.description}`);
      console.log(`    📸 Photos: ${catStats.photos}, 🎬 Videos: ${catStats.videos}`);
      console.log(`    🎤 Voice Triggers: ${category.voiceTriggers.slice(0, 3).join(', ')}...`);
      console.log(`    ❤️  Emotion Triggers: ${category.emotionTriggers.slice(0, 3).join(', ')}...`);
      
      // Show first few items
      const firstItems = category.items.slice(0, 3);
      console.log(`    📄 Sample Items:`);
      firstItems.forEach(item => {
        console.log(`      • ${item.type === 'photo' ? '📷' : '🎬'} ${item.caption} (${item.size})`);
      });
      if (category.items.length > 3) {
        console.log(`      ... and ${category.items.length - 3} more`);
      }
      console.log('');
    }
  }
}



// Export as singleton instance
const memoryScanner = MemoryScanner.getInstance();
export default memoryScanner;