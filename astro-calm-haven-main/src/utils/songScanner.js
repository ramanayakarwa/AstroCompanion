class SongScanner {
    constructor() {
        this.songs = [];
        this.metadataLoaded = false;
        console.log("🎵 SongScanner initialized");
    }

    async loadMetadata() {
        console.log("📂 Starting metadata load...");
        try {
            // Try to load pre-generated metadata
            const response = await fetch('/metadata/songs.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Check if we got valid data
            if (!Array.isArray(data)) {
                console.warn("⚠️ songs.json does not contain an array, using fallback");
                return this.getDummySongs();
            }
            
            this.songs = data;
            this.metadataLoaded = true;
            console.log(`✅ Loaded ${this.songs.length} songs from metadata`);
            
            // If no songs loaded, use dummy data for testing
            if (this.songs.length === 0) {
                console.warn("⚠️ No songs found in metadata, using dummy data");
                return this.getDummySongs();
            }
            
            // Ensure all songs have correct path format
            this.songs = this.songs.map(song => ({
                ...song,
                path: song.path.startsWith('/') ? song.path : `/${song.path}`,
                filename: song.filename || song.path.split('/').pop()
            }));
            
            return this.songs;
        } catch (error) {
            console.warn('⚠️ Could not load metadata:', error.message);
            console.log('Falling back to dummy data...');
            return this.getDummySongs();
        }
    }

    getDummySongs() {
        console.log("🔄 Using dummy data for testing");
        this.songs = [
            {
                id: 0,
                filename: "calm-ocean-waves.mp3",
                path: "/songs/calm-ocean-waves.mp3",
                title: "Calm Ocean Waves",
                artist: "Nature Sounds",
                album: "Nature Therapy",
                genre: "Ambient",
                duration: 180,
                file_size: 3456789,
                mood_tags: ["calm", "peaceful", "nature", "relaxation"],
                therapeutic_category: "relaxation",
                play_count: 0,
                last_played: null,
                bpm: 60,
                energy: 0.2,
                key: "C"
            },
            {
                id: 1,
                filename: "focus-study-music.mp3",
                path: "/songs/focus-study-music.mp3",
                title: "Focus Study Music",
                artist: "Study Tunes",
                album: "Productivity Boost",
                genre: "Instrumental",
                duration: 240,
                file_size: 4567890,
                mood_tags: ["concentration", "focus", "productive"],
                therapeutic_category: "focus",
                play_count: 0,
                last_played: null,
                bpm: 90,
                energy: 0.5,
                key: "G"
            },
            {
                id: 2,
                filename: "sleep-meditation.mp3",
                path: "/songs/sleep-meditation.mp3",
                title: "Sleep Meditation",
                artist: "Meditation Guide",
                album: "Deep Sleep",
                genre: "Meditation",
                duration: 600,
                file_size: 9876543,
                mood_tags: ["calm", "sleep", "meditation", "peaceful"],
                therapeutic_category: "sleep",
                play_count: 0,
                last_played: null,
                bpm: 55,
                energy: 0.1,
                key: "Am"
            },
            {
                id: 3,
                filename: "morning-energy-boost.mp3",
                path: "/songs/morning-energy-boost.mp3",
                title: "Morning Energy Boost",
                artist: "Workout Mix",
                album: "Energy Collection",
                genre: "Upbeat",
                duration: 200,
                file_size: 3456123,
                mood_tags: ["energetic", "upbeat", "motivational"],
                therapeutic_category: "energy",
                play_count: 0,
                last_played: null,
                bpm: 120,
                energy: 0.8,
                key: "D"
            },
            {
                id: 4,
                filename: "piano-relaxation.mp3",
                path: "/songs/piano-relaxation.mp3",
                title: "Piano Relaxation",
                artist: "Classical Piano",
                album: "Solo Piano",
                genre: "Classical",
                duration: 300,
                file_size: 5678901,
                mood_tags: ["calm", "instrumental", "peaceful", "classical"],
                therapeutic_category: "relaxation",
                play_count: 0,
                last_played: null,
                bpm: 70,
                energy: 0.3,
                key: "F"
            }
        ];
        this.metadataLoaded = true;
        console.log(`✅ Loaded ${this.songs.length} dummy songs`);
        return this.songs;
    }

    async scanFolder() {
        console.log("🔄 Scanning songs folder directly...");
        try {
            const response = await fetch('/songs/');
            
            if (!response.ok) {
                throw new Error(`Cannot access songs folder: ${response.status}`);
            }
            
            const text = await response.text();
            
            // Parse HTML directory listing
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a');
            
            this.songs = [];
            const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac'];
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                
                if (href && audioExtensions.some(ext => href.toLowerCase().endsWith(ext))) {
                    const filename = href.split('/').pop();
                    const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').trim();
                    const lowerTitle = title.toLowerCase();
                    
                    // Auto-categorize based on filename
                    let therapeutic_category = 'general';
                    let mood_tags = [];
                    
                    if (lowerTitle.includes('relax') || lowerTitle.includes('calm') || lowerTitle.includes('peace')) {
                        therapeutic_category = 'relaxation';
                        mood_tags = ['calm', 'peaceful', 'relaxing'];
                    } else if (lowerTitle.includes('focus') || lowerTitle.includes('study') || lowerTitle.includes('work')) {
                        therapeutic_category = 'focus';
                        mood_tags = ['concentration', 'focus', 'productive'];
                    } else if (lowerTitle.includes('sleep') || lowerTitle.includes('bed') || lowerTitle.includes('dream')) {
                        therapeutic_category = 'sleep';
                        mood_tags = ['calm', 'sleep', 'peaceful'];
                    } else if (lowerTitle.includes('energy') || lowerTitle.includes('upbeat') || lowerTitle.includes('workout')) {
                        therapeutic_category = 'energy';
                        mood_tags = ['energetic', 'upbeat', 'motivational'];
                    } else if (lowerTitle.includes('nature') || lowerTitle.includes('rain') || lowerTitle.includes('ocean')) {
                        therapeutic_category = 'relaxation';
                        mood_tags = ['nature', 'calm', 'peaceful'];
                    }
                    
                    this.songs.push({
                        id: this.songs.length,
                        filename: filename,
                        path: `/songs/${filename}`,  // Fixed: leading slash
                        title: title,
                        artist: this.extractArtistFromFilename(filename),
                        album: '',
                        genre: '',
                        duration: 0,
                        file_size: 0,
                        mood_tags: mood_tags,
                        therapeutic_category: therapeutic_category,
                        play_count: 0,
                        last_played: null
                    });
                }
            });
            
            this.metadataLoaded = true;
            console.log(`✅ Folder scan complete: ${this.songs.length} songs found`);
            
            if (this.songs.length === 0) {
                console.warn("No audio files found in songs folder");
                return this.getDummySongs();
            }
            
            return this.songs;
        } catch (error) {
            console.error('❌ Error scanning songs folder:', error);
            return this.getDummySongs();
        }
    }

    extractArtistFromFilename(filename) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        
        // Common patterns
        if (nameWithoutExt.includes(' - ')) {
            const parts = nameWithoutExt.split(' - ');
            if (parts.length >= 2) {
                return parts[0].trim();
            }
        }
        
        if (nameWithoutExt.includes(' by ')) {
            const parts = nameWithoutExt.split(' by ');
            if (parts.length >= 2) {
                return parts[1].trim();
            }
        }
        
        return 'Unknown Artist';
    }

    async search(query, filters = {}) {
        if (!this.metadataLoaded) {
            await this.loadMetadata();
        }

        // If no songs loaded, return empty array
        if (this.songs.length === 0) {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        
        return this.songs.filter(song => {
            // Check if song has required properties
            if (!song || typeof song !== 'object') return false;
            
            // Text search
            let textMatch = false;
            
            if (normalizedQuery === '') {
                textMatch = true;
            } else {
                // Check title
                if (song.title && song.title.toLowerCase().includes(normalizedQuery)) {
                    textMatch = true;
                }
                // Check artist
                else if (song.artist && song.artist.toLowerCase().includes(normalizedQuery)) {
                    textMatch = true;
                }
                // Check album
                else if (song.album && song.album.toLowerCase().includes(normalizedQuery)) {
                    textMatch = true;
                }
                // Check genre
                else if (song.genre && song.genre.toLowerCase().includes(normalizedQuery)) {
                    textMatch = true;
                }
                // Check mood tags
                else if (song.mood_tags && Array.isArray(song.mood_tags)) {
                    textMatch = song.mood_tags.some(tag => 
                        tag && tag.toLowerCase().includes(normalizedQuery)
                    );
                }
            }
            
            // Filter by category
            const categoryMatch = !filters.category || 
                (song.therapeutic_category && song.therapeutic_category === filters.category);
            
            // Filter by duration
            const durationMatch = !filters.maxDuration || 
                (song.duration && song.duration <= filters.maxDuration);
            
            return textMatch && categoryMatch && durationMatch;
        });
    }

    getSongsByCategory(category) {
        if (!this.metadataLoaded) {
            console.warn("Metadata not loaded yet");
            return [];
        }
        
        return this.songs.filter(song => 
            song && song.therapeutic_category === category
        );
    }

    getRandomSong() {
        if (this.songs.length === 0) {
            console.warn("No songs available");
            return null;
        }
        return this.songs[Math.floor(Math.random() * this.songs.length)];
    }

    getSongById(id) {
        if (!this.metadataLoaded) {
            console.warn("Metadata not loaded yet");
            return null;
        }
        
        return this.songs.find(song => song.id === id);
    }

    updatePlayCount(songId) {
        const song = this.getSongById(songId);
        if (song) {
            song.play_count = (song.play_count || 0) + 1;
            song.last_played = new Date().toISOString();
            console.log(`📊 Updated play count for "${song.title}": ${song.play_count}`);
        }
    }

    getRecentlyPlayed(limit = 10) {
        if (!this.metadataLoaded) {
            console.warn("Metadata not loaded yet");
            return [];
        }
        
        return [...this.songs]
            .filter(s => s && s.last_played)
            .sort((a, b) => new Date(b.last_played) - new Date(a.last_played))
            .slice(0, limit);
    }

    getMostPlayed(limit = 10) {
        if (!this.metadataLoaded) {
            console.warn("Metadata not loaded yet");
            return [];
        }
        
        return [...this.songs]
            .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
            .slice(0, limit);
    }

    async loadRealSongs() {
    console.log("🔄 Loading real songs from folder...");
    try {
        // First try to load metadata
        const response = await fetch('/metadata/songs.json');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                this.songs = data.map(song => ({
                    ...song,
                    // Ensure path is correct
                    path: song.path.startsWith('/') ? song.path : `/${song.path}`,
                    // Use dummy duration if not set
                    duration: song.duration || 180 + Math.floor(Math.random() * 300)
                }));
                this.metadataLoaded = true;
                console.log(`✅ Loaded ${this.songs.length} real songs`);
                return this.songs;
            }
        }
    } catch (error) {
        console.log("No metadata found, checking songs folder...");
    }
    
    // If no metadata, check songs folder
    try {
        const response = await fetch('/songs/');
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a');
        
        const audioFiles = [];
        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac'];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && audioExtensions.some(ext => href.toLowerCase().endsWith(ext))) {
                const filename = href.split('/').pop();
                audioFiles.push(filename);
            }
        });
        
        if (audioFiles.length > 0) {
            console.log(`✅ Found ${audioFiles.length} audio files in songs folder`);
            
            // Create song objects for real files
            this.songs = audioFiles.map((filename, index) => {
                const title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').trim();
                const lowerTitle = title.toLowerCase();
                
                return {
                    id: index,
                    filename: filename,
                    path: `/songs/${filename}`,
                    title: title,
                    artist: this.extractArtistFromFilename(filename),
                    duration: 180 + Math.floor(Math.random() * 300), // Random duration 3-8 mins
                    mood_tags: this.getMoodTagsFromTitle(lowerTitle),
                    therapeutic_category: this.categorizeFromTitle(lowerTitle),
                    play_count: 0,
                    last_played: null,
                    file_size: 5000000 + Math.floor(Math.random() * 5000000) // 5-10MB
                };
            });
            
            this.metadataLoaded = true;
            return this.songs;
        }
    } catch (error) {
        console.log("Could not access songs folder:", error);
    }
    
    // Fallback to dummy data
    console.log("🔄 Using enhanced dummy data");
    return this.getEnhancedDummySongs();
}
}



export default SongScanner;