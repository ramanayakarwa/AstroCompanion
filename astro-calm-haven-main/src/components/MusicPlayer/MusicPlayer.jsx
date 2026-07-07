import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css';

// Simple demo songs data
const demoSongs = [
    {
        id: 0,
        filename: "cosmic-meditation.mp3",
        path: "/songs/cosmic-meditation.mp3",
        title: "Cosmic Meditation",
        artist: "Space Harmony",
        duration: 328,
        mood_tags: ["calm", "peaceful", "spiritual"],
        therapeutic_category: "relaxation",
        play_count: 0
    },
    {
        id: 1,
        filename: "quantum-focus.mp3",
        path: "/songs/quantum-focus.mp3",
        title: "Quantum Focus",
        artist: "Neural Sync",
        duration: 245,
        mood_tags: ["concentration", "focus", "productive"],
        therapeutic_category: "focus",
        play_count: 0
    },
    {
        id: 2,
        filename: "stellar-lullaby.mp3",
        path: "/songs/stellar-lullaby.mp3",
        title: "Stellar Lullaby",
        artist: "Celestial Choir",
        duration: 412,
        mood_tags: ["sleep", "calm", "dreamy"],
        therapeutic_category: "sleep",
        play_count: 0
    },
    {
        id: 3,
        filename: "orbital-energy.mp3",
        path: "/songs/orbital-energy.mp3",
        title: "Orbital Energy",
        artist: "Solar Flare",
        duration: 196,
        mood_tags: ["energetic", "upbeat", "motivational"],
        therapeutic_category: "energy",
        play_count: 0
    }
];

const MusicPlayer = () => {
    // ✅ All hooks must be at the TOP LEVEL of the component
    const [songs, setSongs] = useState(demoSongs);
    const [currentSong, setCurrentSong] = useState(demoSongs[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSongs, setFilteredSongs] = useState(demoSongs);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [category, setCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    
    const audioRef = useRef(null);

    useEffect(() => {
        // Filter songs when search or category changes
        let results = songs;
        
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            results = results.filter(song => 
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query) ||
                song.mood_tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        if (category !== 'all') {
            results = results.filter(song => song.therapeutic_category === category);
        }
        
        setFilteredSongs(results);
    }, [searchQuery, category, songs]);

    const playSong = (song) => {
        console.log("🎵 Playing (simulated):", song.title);
        setCurrentSong(song);
        setIsPlaying(true);
        
        // For demo: simulate playback
        setCurrentTime(0);
        setDuration(song.duration);
        
        // Update play count
        const updatedSongs = songs.map(s => 
            s.id === song.id ? {...s, play_count: (s.play_count || 0) + 1} : s
        );
        setSongs(updatedSongs);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            console.log("⏸️ Paused:", currentSong.title);
        } else {
            setIsPlaying(true);
            console.log("▶️ Resumed:", currentSong.title);
        }
    };

    const playNext = () => {
        const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % filteredSongs.length;
        playSong(filteredSongs[nextIndex]);
    };

    const playPrevious = () => {
        const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
        const prevIndex = currentIndex === 0 ? filteredSongs.length - 1 : currentIndex - 1;
        playSong(filteredSongs[prevIndex]);
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        console.log("Seek to:", time, "seconds");
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        console.log("Volume set to:", newVolume);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ✅ Render logic - no hooks after this point
    return (
        <div className="music-player">
            {/* Demo Notice */}
            <div className="demo-notice">
                <p>🎵 <strong>SIHP Demo:</strong> Simulated offline music player</p>
                <small>In actual deployment, real audio files would be pre-loaded</small>
            </div>

            {/* Search and Filter */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search songs, artists, or moods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                
                <div className="search-info">
                    <small>
                        {filteredSongs.length} of {songs.length} songs match
                    </small>
                </div>
                
                <div className="category-filters">
                    <button
                        className={`category-btn ${category === 'all' ? 'active' : ''}`}
                        onClick={() => setCategory('all')}
                    >
                        All
                    </button>
                    <button
                        className={`category-btn ${category === 'relaxation' ? 'active' : ''}`}
                        onClick={() => setCategory('relaxation')}
                    >
                        Relaxation
                    </button>
                    <button
                        className={`category-btn ${category === 'focus' ? 'active' : ''}`}
                        onClick={() => setCategory('focus')}
                    >
                        Focus
                    </button>
                    <button
                        className={`category-btn ${category === 'sleep' ? 'active' : ''}`}
                        onClick={() => setCategory('sleep')}
                    >
                        Sleep
                    </button>
                    <button
                        className={`category-btn ${category === 'energy' ? 'active' : ''}`}
                        onClick={() => setCategory('energy')}
                    >
                        Energy
                    </button>
                </div>
            </div>

            {/* Song List */}
            <div className="song-list">
                {filteredSongs.length === 0 ? (
                    <div className="no-songs">
                        <p>No songs found matching "{searchQuery}"</p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setCategory('all');
                            }}
                            className="clear-search-btn"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    filteredSongs.map(song => (
                        <div
                            key={song.id}
                            className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                            onClick={() => playSong(song)}
                        >
                            <div className="song-info">
                                <h4 className="song-title">{song.title}</h4>
                                <p className="song-artist">{song.artist}</p>
                                <div className="song-tags">
                                    <span className="song-category">{song.therapeutic_category}</span>
                                    {song.mood_tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="mood-tag">{tag}</span>
                                    ))}
                                    <span className="song-duration">{formatTime(song.duration)}</span>
                                </div>
                            </div>
                            <button className="play-btn">
                                {currentSong?.id === song.id && isPlaying ? '⏸️' : '▶️'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Player Controls */}
            {currentSong && (
                <div className="player-controls">
                    <div className="now-playing">
                        <div className="current-song-info">
                            <h3>{currentSong.title}</h3>
                            <p>{currentSong.artist} • {currentSong.therapeutic_category} • Played {currentSong.play_count || 0} times</p>
                        </div>
                        
                        <div className="progress-section">
                            <span className="time">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="progress-bar"
                            />
                            <span className="time">{formatTime(duration)}</span>
                        </div>
                        
                        <div className="control-buttons">
                            <button onClick={playPrevious} className="control-btn">⏮</button>
                            <button onClick={togglePlayPause} className="play-pause-btn">
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button onClick={playNext} className="control-btn">⏭</button>
                            
                            <div className="volume-control">
                                <span>🔊</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                />
                            </div>
                        </div>
                        
                        <div className="simulation-note">
                            <small>🔊 Simulation: Audio playback is simulated for demo purposes</small>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MusicPlayer;