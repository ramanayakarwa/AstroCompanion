import os
import json
from pathlib import Path
from datetime import datetime

def scan_memories_folder(memories_path):
    """Scan memories folder and generate metadata"""
    print("📷 Scanning memories folder...")
    
    categories = {
        'family': {
            'name': 'Family',
            'description': 'Photos and videos of family members',
            'voiceTriggers': ['family', 'parents', 'children', 'siblings', 'mom', 'dad', 'mother', 'father', 'son', 'daughter'],
            'emotionTriggers': ['lonely', 'homesick', 'nostalgic', 'sad'],
            'items': []
        },
        'friends': {
            'name': 'Friends',
            'description': 'Memories with friends and colleagues',
            'voiceTriggers': ['friends', 'buddies', 'colleagues', 'team', 'crew'],
            'emotionTriggers': ['lonely', 'isolated', 'bored'],
            'items': []
        },
        'home': {
            'name': 'Home',
            'description': 'Photos of home, city, and neighborhood',
            'voiceTriggers': ['home', 'house', 'apartment', 'city', 'town', 'neighborhood'],
            'emotionTriggers': ['homesick', 'nostalgic', 'longing'],
            'items': []
        },
        'earth': {
            'name': 'Earth',
            'description': 'Beautiful Earth landscapes and nature',
            'voiceTriggers': ['earth', 'planet', 'nature', 'beach', 'mountain', 'forest', 'ocean'],
            'emotionTriggers': ['homesick', 'awestruck', 'peaceful'],
            'items': []
        },
        'pets': {
            'name': 'Pets',
            'description': 'Photos of pets and animals',
            'voiceTriggers': ['pet', 'dog', 'cat', 'animal', 'buddy'],
            'emotionTriggers': ['lonely', 'sad', 'needing comfort'],
            'items': []
        },
        'achievements': {
            'name': 'Achievements',
            'description': 'Personal achievements and milestones',
            'voiceTriggers': ['achievement', 'success', 'graduation', 'award', 'milestone'],
            'emotionTriggers': ['demotivated', 'tired', 'needing inspiration'],
            'items': []
        }
    }
    
    # Supported formats
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    video_extensions = {'.mp4', '.webm', '.mov', '.avi'}
    
    for category in categories.keys():
        category_path = os.path.join(memories_path, category)
        
        if not os.path.exists(category_path):
            print(f"⚠️  Category folder not found: {category_path}")
            continue
        
        # Scan photos
        photos_path = os.path.join(category_path, 'photos')
        if os.path.exists(photos_path):
            for filename in os.listdir(photos_path):
                file_path = os.path.join(photos_path, filename)
                if os.path.isfile(file_path):
                    ext = os.path.splitext(filename)[1].lower()
                    if ext in image_extensions:
                        item_id = f"{category}-photo-{len(categories[category]['items']) + 1:03d}"
                        categories[category]['items'].append(create_memory_item(
                            item_id, filename, file_path, 'photo', category
                        ))
                        print(f"✅ Added photo: {filename} to {category}")
        
        # Scan videos
        videos_path = os.path.join(category_path, 'videos')
        if os.path.exists(videos_path):
            for filename in os.listdir(videos_path):
                file_path = os.path.join(videos_path, filename)
                if os.path.isfile(file_path):
                    ext = os.path.splitext(filename)[1].lower()
                    if ext in video_extensions:
                        item_id = f"{category}-video-{len(categories[category]['items']) + 1:03d}"
                        categories[category]['items'].append(create_memory_item(
                            item_id, filename, file_path, 'video', category
                        ))
                        print(f"✅ Added video: {filename} to {category}")
    
    return categories

def create_memory_item(item_id, filename, file_path, item_type, category):
    """Create metadata for a memory item"""
    file_size = os.path.getsize(file_path)
    file_size_mb = file_size / (1024 * 1024)
    
    # Generate caption based on filename and category
    caption = generate_caption(filename, category, item_type)
    
    return {
        'id': item_id,
        'type': item_type,
        'filename': filename,
        'path': f"/memories/{category}/{'photos' if item_type == 'photo' else 'videos'}/{filename}",
        'caption': caption,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'tags': generate_tags(filename, category),
        'duration': 0 if item_type == 'photo' else 30,  # Assume 30s for videos
        'size': f"{file_size_mb:.1f} MB",
        'file_size': file_size,
        'added': datetime.now().isoformat()
    }

def generate_caption(filename, category, item_type):
    """Generate a meaningful caption"""
    name_without_ext = os.path.splitext(filename)[0].replace('-', ' ').replace('_', ' ')
    
    captions = {
        'family': {
            'photo': f"Family memory: {name_without_ext}",
            'video': f"Family moment: {name_without_ext}"
        },
        'friends': {
            'photo': f"With friends: {name_without_ext}",
            'video': f"Friends gathering: {name_without_ext}"
        },
        'home': {
            'photo': f"Home: {name_without_ext}",
            'video': f"Home memory: {name_without_ext}"
        },
        'earth': {
            'photo': f"Earth beauty: {name_without_ext}",
            'video': f"Earth view: {name_without_ext}"
        },
        'pets': {
            'photo': f"Pet: {name_without_ext}",
            'video': f"Pet moment: {name_without_ext}"
        },
        'achievements': {
            'photo': f"Achievement: {name_without_ext}",
            'video': f"Milestone: {name_without_ext}"
        }
    }
    
    return captions.get(category, {}).get(item_type, f"Memory: {name_without_ext}")

def generate_tags(filename, category):
    """Generate tags for search"""
    name_lower = filename.lower()
    tags = [category]
    
    # Add content-based tags
    if 'birthday' in name_lower:
        tags.append('birthday')
    if 'wedding' in name_lower:
        tags.append('wedding')
    if 'vacation' in name_lower:
        tags.append('vacation')
    if 'graduation' in name_lower:
        tags.append('graduation')
    if 'beach' in name_lower:
        tags.append('beach')
    if 'mountain' in name_lower:
        tags.append('mountain')
    
    return tags

def create_voice_triggers():
    """Create voice trigger mappings"""
    return {
        'triggers': [
            {
                'id': 'trigger-001',
                'phrases': ['i miss my family', 'show family', 'family photos', 'my family'],
                'category': 'family',
                'priority': 'high',
                'response': 'Showing cherished family memories'
            },
            {
                'id': 'trigger-002',
                'phrases': ['i miss my friends', 'show friends', 'my buddies', 'colleagues'],
                'category': 'friends',
                'priority': 'high',
                'response': 'Showing fun moments with friends'
            },
            {
                'id': 'trigger-003',
                'phrases': ['i miss home', 'show home', 'my house', 'my city'],
                'category': 'home',
                'priority': 'high',
                'response': 'Showing home memories'
            },
            {
                'id': 'trigger-004',
                'phrases': ['i miss earth', 'show earth', 'our planet', 'nature'],
                'category': 'earth',
                'priority': 'medium',
                'response': 'Showing beautiful Earth views'
            },
            {
                'id': 'trigger-005',
                'phrases': ['i miss my pet', 'show my dog', 'my cat', 'my pet'],
                'category': 'pets',
                'priority': 'medium',
                'response': 'Showing your pet memories'
            },
            {
                'id': 'trigger-006',
                'phrases': ['i feel demotivated', 'show achievements', 'my success', 'milestones'],
                'category': 'achievements',
                'priority': 'medium',
                'response': 'Showing your achievements for motivation'
            }
        ]
    }

def create_emotion_map():
    """Create emotion to memory category mapping"""
    return {
        'mappings': [
            {
                'emotion': 'lonely',
                'categories': ['family', 'friends', 'pets'],
                'priority': 'high',
                'message': 'Remembering loved ones can help'
            },
            {
                'emotion': 'homesick',
                'categories': ['home', 'earth', 'family'],
                'priority': 'high',
                'message': 'Home memories to comfort you'
            },
            {
                'emotion': 'sad',
                'categories': ['pets', 'family', 'achievements'],
                'priority': 'medium',
                'message': 'Happy memories to lift your spirits'
            },
            {
                'emotion': 'stressed',
                'categories': ['earth', 'pets'],
                'priority': 'medium',
                'message': 'Relaxing scenes to calm you'
            },
            {
                'emotion': 'tired',
                'categories': ['achievements', 'earth'],
                'priority': 'low',
                'message': 'Inspirational memories to energize you'
            },
            {
                'emotion': 'happy',
                'categories': ['achievements', 'friends'],
                'priority': 'low',
                'message': 'Celebrating with you'
            }
        ]
    }

def main():
    print("🎞️ MEMORY LANE - Content Scanner")
    print("=" * 50)
    
    # Set paths
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    memories_path = os.path.join(project_root, 'public', 'memories')
    metadata_path = os.path.join(memories_path, 'metadata')
    
    print(f"Project root: {project_root}")
    print(f"Memories path: {memories_path}")
    
    # Create metadata directory
    os.makedirs(metadata_path, exist_ok=True)
    
    # Scan memories
    categories = scan_memories_folder(memories_path)
    
    # Create metadata files
    memories_file = os.path.join(metadata_path, 'memories.json')
    with open(memories_file, 'w', encoding='utf-8') as f:
        json.dump({'categories': categories}, f, indent=2, ensure_ascii=False)
    
    voice_triggers_file = os.path.join(metadata_path, 'voice-triggers.json')
    with open(voice_triggers_file, 'w', encoding='utf-8') as f:
        json.dump(create_voice_triggers(), f, indent=2, ensure_ascii=False)
    
    emotion_map_file = os.path.join(metadata_path, 'emotion-map.json')
    with open(emotion_map_file, 'w', encoding='utf-8') as f:
        json.dump(create_emotion_map(), f, indent=2, ensure_ascii=False)
    
    # Statistics
    total_items = sum(len(cat['items']) for cat in categories.values())
    print(f"\n📊 Scan Complete!")
    print(f"Total memory items: {total_items}")
    
    for category, data in categories.items():
        print(f"  {data['name']}: {len(data['items'])} items")
    
    print(f"\n💾 Metadata saved to:")
    print(f"  {memories_file}")
    print(f"  {voice_triggers_file}")
    print(f"  {emotion_map_file}")
    
    print("\n🎯 Next Steps:")
    print("1. Add actual photos/videos to public/memories/[category]/photos|videos/")
    print("2. Run this script again to update metadata")
    print("3. Start the React app to see your memories")

if __name__ == "__main__":
    main()