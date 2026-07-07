import os
import json
from pathlib import Path

def scan_songs_basic(songs_path):
    """Simple scanner without audio analysis dependencies"""
    songs_data = []
    
    # Supported audio formats
    audio_extensions = {'.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.m4b'}
    
    print(f"📂 Scanning: {songs_path}")
    
    # Check if directory exists
    if not os.path.exists(songs_path):
        print(f"❌ ERROR: Directory does not exist: {songs_path}")
        return songs_data
    
    # Get all files
    try:
        files = os.listdir(songs_path)
        print(f"Found {len(files)} items in directory")
    except Exception as e:
        print(f"❌ ERROR: Cannot read directory: {e}")
        return songs_data
    
    for filename in files:
        file_path = os.path.join(songs_path, filename)
        
        # Check if it's a file and has audio extension
        if os.path.isfile(file_path):
            file_ext = os.path.splitext(filename)[1].lower()
            
            if file_ext in audio_extensions:
                try:
                    # Basic file info
                    file_size = os.path.getsize(file_path)
                    file_size_mb = file_size / (1024 * 1024)
                    
                    # Create basic song info
                    song_title = Path(filename).stem
                    
                    # Simple categorization based on filename
                    filename_lower = filename.lower()
                    therapeutic_category = categorize_song(filename_lower)
                    mood_tags = get_mood_tags_from_filename(filename_lower)
                    
                    song_info = {
                        'id': len(songs_data),
                        'filename': filename,
                        'path': f"/songs/{filename}",  # FIXED: leading slash
                        'title': song_title.replace('_', ' ').replace('-', ' ').title(),
                        'artist': extract_artist_from_filename(filename),
                        'album': '',
                        'genre': '',
                        'duration': 0,
                        'file_size': file_size,
                        'file_size_mb': round(file_size_mb, 2),
                        'mood_tags': mood_tags,
                        'therapeutic_category': therapeutic_category,
                        'play_count': 0,
                        'last_played': None,
                        'bpm': 0,
                        'energy': 0.5,
                        'key': 'C'
                    }
                    
                    songs_data.append(song_info)
                    print(f"✅ Added: {song_info['title']} ({file_ext}, {song_info['file_size_mb']:.1f} MB)")
                    
                except Exception as e:
                    print(f"⚠️  Skipped {filename}: {e}")
    
    return songs_data

def categorize_song(filename):
    """Simple categorization based on filename keywords"""
    filename_lower = filename.lower()
    
    # Define keyword mappings
    categories = {
        'relaxation': ['relax', 'calm', 'peace', 'meditation', 'zen', 'chill', 'soothing', 'nature', 'ocean', 'rain'],
        'focus': ['focus', 'study', 'work', 'concentration', 'productivity', 'brain', 'lofi'],
        'sleep': ['sleep', 'lullaby', 'night', 'dream', 'bedtime', 'insomnia'],
        'energy': ['energy', 'upbeat', 'morning', 'workout', 'exercise', 'gym', 'pump', 'motivation'],
        'instrumental': ['instrumental', 'piano', 'guitar', 'violin', 'orchestra', 'symphony', 'classical']
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in filename_lower:
                return category
    
    return 'general'

def extract_artist_from_filename(filename):
    """Try to extract artist from filename patterns"""
    # Common patterns: "Artist - Song.mp3" or "Song by Artist.mp3"
    filename_no_ext = Path(filename).stem
    
    # Pattern 1: "Artist - Title"
    if ' - ' in filename_no_ext:
        parts = filename_no_ext.split(' - ')
        if len(parts) >= 2:
            return parts[0].title()
    
    # Pattern 2: "Title by Artist"
    if ' by ' in filename_no_ext:
        parts = filename_no_ext.split(' by ')
        if len(parts) >= 2:
            return parts[1].title()
    
    return 'Unknown Artist'

def get_mood_tags_from_filename(filename):
    """Extract mood tags from filename"""
    mood_keywords = {
        'happy': ['happy', 'joy', 'cheerful', 'upbeat', 'positive'],
        'sad': ['sad', 'melancholy', 'blue', 'emotional'],
        'calm': ['calm', 'peaceful', 'serene', 'tranquil'],
        'energetic': ['energetic', 'powerful', 'intense', 'dynamic'],
        'romantic': ['romantic', 'love', 'heart', 'passion'],
        'motivational': ['motivational', 'inspirational', 'encouraging'],
        'nature': ['nature', 'rain', 'ocean', 'forest', 'birds', 'water'],
        'instrumental': ['instrumental', 'piano', 'guitar', 'violin']
    }
    
    tags = []
    filename_lower = filename.lower()
    
    for mood, keywords in mood_keywords.items():
        for keyword in keywords:
            if keyword in filename_lower and mood not in tags:
                tags.append(mood)
                break
    
    return tags

def save_metadata(songs_data, output_path):
    """Save metadata to JSON file"""
    # Create metadata directory if it doesn't exist
    metadata_dir = os.path.join(output_path, 'metadata')
    os.makedirs(metadata_dir, exist_ok=True)
    
    metadata_file = os.path.join(metadata_dir, 'songs.json')
    
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(songs_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Metadata saved to: {metadata_file}")
    return metadata_file

def main():
    print("🎵 ASTRO CALM HAVEN - Song Scanner")
    print("=" * 50)
    
    # Set your songs folder path
    project_path = r"C:\Users\Soumyadeep mukherjee\OneDrive\Desktop\sih\xyz\astro-calm-haven-main"
    songs_path = os.path.join(project_path, "public", "songs")
    output_path = os.path.join(project_path, "public")
    
    print(f"Project path: {project_path}")
    print(f"Songs path: {songs_path}")
    
    # Verify paths
    if not os.path.exists(songs_path):
        print(f"\n⚠️  WARNING: Songs folder not found at: {songs_path}")
        print("Creating empty songs folder...")
        os.makedirs(songs_path, exist_ok=True)
        print("Please add your audio files to this folder and run the script again.")
        return
    
    # Scan songs
    print(f"\n🔍 Scanning songs folder...")
    songs_data = scan_songs_basic(songs_path)
    
    if not songs_data:
        print("\n⚠️  No audio files found in the songs folder.")
        print("Supported formats: .mp3, .wav, .flac, .m4a, .ogg, .aac")
        print(f"\nPlease add audio files to: {songs_path}")
        print("\nCreating sample metadata with dummy data...")
        
        # Create dummy data
        songs_data = [
            {
                'id': 0,
                'filename': 'test-song.mp3',
                'path': '/songs/test-song.mp3',
                'title': 'Test Song',
                'artist': 'Test Artist',
                'therapeutic_category': 'relaxation',
                'mood_tags': ['calm', 'test']
            }
        ]
    
    # Save metadata
    metadata_file = save_metadata(songs_data, output_path)
    
    # Generate statistics
    print("\n📊 SCAN RESULTS:")
    print(f"Total songs found: {len(songs_data)}")
    
    if songs_data:
        total_size_mb = sum(song.get('file_size_mb', 0) for song in songs_data)
        print(f"Total size: {total_size_mb:.2f} MB")
        
        # Count by category
        categories = {}
        for song in songs_data:
            cat = song.get('therapeutic_category', 'general')
            categories[cat] = categories.get(cat, 0) + 1
        
        print("\n📈 Categories:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count} songs")
    
    print("\n🎯 NEXT STEPS:")
    print("1. The metadata file has been created at: public/metadata/songs.json")
    print("2. You can now run your web application")
    print("3. To add real songs, put MP3 files in the songs folder and run this script again")

if __name__ == "__main__":
    main()