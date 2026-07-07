import React, { useState, useEffect } from 'react';
import EarthVisualization from '../components/EarthVisualization';
import './visitearth.css';
// Sample astronaut locations (could be loaded from mission data)
const ASTRONAUT_LOCATIONS = [
  { name: "Mission Commander", city: "Houston, USA", lat: 29.7604, lng: -95.3698 },
  { name: "Flight Engineer", city: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
  { name: "Research Scientist", city: "Bangalore, India", lat: 12.9716, lng: 77.5946 },
  { name: "Medical Officer", city: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 }
];

const WEATHER_TYPES: Array<'clear' | 'cloudy' | 'rain' | 'snow'> = ['clear', 'cloudy', 'rain', 'snow'];
const MOOD_TYPES: Array<'calm' | 'energetic' | 'lonely' | 'stressed'> = ['calm', 'energetic', 'lonely', 'stressed'];

const EarthWindow: React.FC = () => {
  // Current state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(ASTRONAUT_LOCATIONS[0]);
  const [weather, setWeather] = useState<'clear' | 'cloudy' | 'rain' | 'snow'>('clear');
  const [mood, setMood] = useState<'calm' | 'energetic' | 'lonely' | 'stressed'>('calm');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [interactionCount, setInteractionCount] = useState(0);
  const [missionDays, setMissionDays] = useState(42); // Example mission day

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-change weather every 30 seconds if auto-rotate is on
  useEffect(() => {
    if (!isAutoRotate) return;
    
    const weatherInterval = setInterval(() => {
      const currentIndex = WEATHER_TYPES.indexOf(weather);
      const nextIndex = (currentIndex + 1) % WEATHER_TYPES.length;
      setWeather(WEATHER_TYPES[nextIndex]);
    }, 30000);
    
    return () => clearInterval(weatherInterval);
  }, [isAutoRotate, weather]);

  // Handle interaction with the Earth view
  const handleEarthInteraction = () => {
    setInteractionCount(prev => prev + 1);
    
    // Change weather on interaction sometimes
    if (Math.random() > 0.7) {
      const randomWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
      setWeather(randomWeather);
    }
  };

  // Calculate mission progress
  const missionProgress = (missionDays % 365) / 365 * 100;
  const seasonProgress = ((currentTime.getMonth() * 30 + currentTime.getDate()) % 365) / 365 * 100;

  // Get psychological tip based on mood and time
  const getPsychologicalTip = () => {
    const hour = currentTime.getHours();
    if (mood === 'stressed') {
      return "Try synchronized breathing with the clouds. Inhale as a cloud forms, exhale as it dissipates.";
    } else if (mood === 'lonely') {
      return "Each city light represents thousands of people thinking of our astronauts right now.";
    } else if (hour >= 21 || hour < 6) {
      return "Night viewing reduces circadian disruption. The moon's cycle connects you to Earth's rhythm.";
    } else {
      return "Sunlight simulation helps maintain circadian rhythms in space. Enjoy the virtual sunrise!";
    }
  };

  return (
    <div className="earth-window-container">
      {/* Header */}
      <div className="earth-window-header">
        <h1>🌍 Earth Window: Your Dynamic Connection to Home</h1>
        <p className="subtitle">A living, breathing virtual view of Earth - 100% procedurally generated, zero images stored</p>
      </div>

      <div className="main-content">
        {/* Left Panel - Controls */}
        <div className="control-panel">
          <div className="control-section">
            <h3>🚀 Mission Control</h3>
            <div className="mission-info">
              <div className="mission-stat">
                <span className="stat-value">{missionDays}</span>
                <span className="stat-label">Mission Days</span>
              </div>
              <div className="mission-stat">
                <span className="stat-value">{interactionCount}</span>
                <span className="stat-label">Earth Connections</span>
              </div>
              <div className="mission-stat">
                <span className="stat-value">{currentTime.toLocaleDateString()}</span>
                <span className="stat-label">Earth Date</span>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>📍 Select View Location</h3>
            <div className="location-buttons">
              {ASTRONAUT_LOCATIONS.map((location) => (
                <button
                  key={location.city}
                  className={`location-btn ${selectedLocation.city === location.city ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <span className="location-icon">🌍</span>
                  <div className="location-details">
                    <div className="location-city">{location.city}</div>
                    <div className="location-coords">
                      {location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>🎭 Set Your Mood</h3>
            <div className="mood-buttons">
              {MOOD_TYPES.map((moodType) => (
                <button
                  key={moodType}
                  className={`mood-btn ${mood === moodType ? 'active' : ''}`}
                  onClick={() => setMood(moodType)}
                >
                  {moodType === 'calm' && '😌 Calm'}
                  {moodType === 'energetic' && '⚡ Energetic'}
                  {moodType === 'lonely' && '🌌 Lonely'}
                  {moodType === 'stressed' && '😰 Stressed'}
                </button>
              ))}
            </div>
            <div className="mood-description">
              {mood === 'calm' && 'Soft blues, gentle clouds, slow transitions'}
              {mood === 'energetic' && 'Bright colors, dynamic effects, sun rays'}
              {mood === 'lonely' && 'Starry nights, city lights, auroras'}
              {mood === 'stressed' && 'Calming rain, smooth gradients, gentle motions'}
            </div>
          </div>

          <div className="control-section">
            <h3>⛅ Weather Controls</h3>
            <div className="weather-controls">
              {WEATHER_TYPES.map((weatherType) => (
                <button
                  key={weatherType}
                  className={`weather-btn ${weather === weatherType ? 'active' : ''}`}
                  onClick={() => setWeather(weatherType)}
                >
                  {weatherType === 'clear' && '☀️ Clear'}
                  {weatherType === 'cloudy' && '☁️ Cloudy'}
                  {weatherType === 'rain' && '🌧️ Rain'}
                  {weatherType === 'snow' && '❄️ Snow'}
                </button>
              ))}
            </div>
            <div className="auto-control">
              <label>
                <input
                  type="checkbox"
                  checked={isAutoRotate}
                  onChange={(e) => setIsAutoRotate(e.target.checked)}
                />
                <span>Auto-rotate weather & time</span>
              </label>
            </div>
          </div>

          {/* Psychological Interventions */}
          <div className="intervention-section">
            <h3>🧠 Psychological Support</h3>
            <div className="intervention-tip">
              <div className="tip-icon">💡</div>
              <div className="tip-text">{getPsychologicalTip()}</div>
            </div>
            <button className="breathing-exercise-btn" onClick={() => {
              alert("🌬️ Breathing Exercise: Follow the cloud movement\nInhale for 4 seconds → Hold for 4 → Exhale for 6 → Hold for 2\nRepeat 5 times");
            }}>
              🌬️ Start Breathing Exercise
            </button>
          </div>
        </div>

        {/* Right Panel - Earth Visualization */}
        <div className="visualization-panel">
          <EarthVisualization
            latitude={selectedLocation.lat}
            longitude={selectedLocation.lng}
            currentTime={currentTime}
            weather={weather}
            mood={mood}
            onInteraction={handleEarthInteraction}
          />

          {/* Time/Season Visualization */}
          <div className="time-visualization">
            <h3>🕐 Earth Time & Seasons</h3>
            <div className="time-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${seasonProgress}%` }}>
                  <div className="progress-label">Season Progress</div>
                </div>
              </div>
              <div className="season-indicators">
                <span className={currentTime.getMonth() >= 2 && currentTime.getMonth() <= 4 ? 'active' : ''}>🌱 Spring</span>
                <span className={currentTime.getMonth() >= 5 && currentTime.getMonth() <= 7 ? 'active' : ''}>☀️ Summer</span>
                <span className={currentTime.getMonth() >= 8 && currentTime.getMonth() <= 10 ? 'active' : ''}>🍂 Autumn</span>
                <span className={currentTime.getMonth() <= 1 || currentTime.getMonth() === 11 ? 'active' : ''}>❄️ Winter</span>
              </div>
            </div>

            <div className="mission-progress">
              <div className="progress-bar">
                <div className="progress-fill mission" style={{ width: `${missionProgress}%` }}>
                  <div className="progress-label">Mission Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Events */}
          <div className="special-events">
            <h3>✨ Special Views</h3>
            <div className="event-buttons">
              <button onClick={() => {
                setWeather('clear');
                const nightTime = new Date();
                nightTime.setHours(2);
                setCurrentTime(nightTime);
                setMood('lonely');
              }}>
                🌙 Midnight View
              </button>
              <button onClick={() => {
                setWeather('clear');
                const dawnTime = new Date();
                dawnTime.setHours(6);
                dawnTime.setMinutes(30);
                setCurrentTime(dawnTime);
                setMood('calm');
              }}>
                🌅 Sunrise Experience
              </button>
              <button onClick={() => {
                setWeather('snow');
                setMood('calm');
              }}>
                ❄️ Winter Wonderland
              </button>
              <button onClick={() => {
                setWeather('rain');
                setMood('stressed');
              }}>
                🌧️ Calming Rain
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="stats-panel">
            <div className="stat-card">
              <div className="stat-icon">🖥️</div>
              <div className="stat-content">
                <div className="stat-title">Procedural Generation</div>
                <div className="stat-value">0 images stored</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🧠</div>
              <div className="stat-content">
                <div className="stat-title">Psychological Benefit</div>
                <div className="stat-value">Circadian Support</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <div className="stat-title">Real-time</div>
                <div className="stat-value">&lt;1ms rendering</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="earth-window-footer">
        <div className="footer-info">
          <strong>🚀 Space Station Mode:</strong> This Earth Window helps maintain circadian rhythms, 
          reduces isolation through Earth connection, and provides visual therapy for astronauts.
        </div>
        <div className="footer-status">
          <span className="status online">🟢 EARTH CONNECTION ACTIVE</span>
          <span className="status">📡 LAT: {selectedLocation.lat.toFixed(4)}°</span>
          <span className="status">📡 LNG: {selectedLocation.lng.toFixed(4)}°</span>
          <span className="status">🕐 {currentTime.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default EarthWindow;