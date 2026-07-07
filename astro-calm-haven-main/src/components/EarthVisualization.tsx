import React, { useEffect, useRef, useState } from 'react';
import { 
  generateSkyColor, 
  generateClouds, 
  generateStars,
  generateAuroraPoints,
  generateCityLights,
  getSeasonalElements,
  getCelestialPosition,
  isDaytime
} from '../utils/earthGenerators';
import './EarthVisualization.css';

interface EarthVisualizationProps {
  latitude: number;
  longitude: number;
  currentTime: Date;
  weather: 'clear' | 'cloudy' | 'rain' | 'snow';
  mood?: 'calm' | 'energetic' | 'lonely' | 'stressed';
  onInteraction?: () => void;
}

const EarthVisualization: React.FC<EarthVisualizationProps> = ({
  latitude,
  longitude,
  currentTime,
  weather,
  mood = 'calm',
  onInteraction
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clouds, setClouds] = useState(generateClouds(weather === 'cloudy' ? 15 : 8));
  const [stars, setStars] = useState(generateStars(50));
  const [cityLights, setCityLights] = useState(generateCityLights());
  const [particles, setParticles] = useState<Array<{x: number, y: number, type: string, color: string, vx?: number, vy?: number}>>([]);
  const [isDay, setIsDay] = useState(isDaytime(latitude, longitude, currentTime));
  
  // Update based on time and weather
  useEffect(() => {
    setClouds(generateClouds(weather === 'cloudy' ? 15 : 8));
    setStars(generateStars(isDay ? 0 : 50)); // No stars during day
    setCityLights(generateCityLights());
    
    // Generate new seasonal particles
    const seasonal = getSeasonalElements(currentTime, weather);
    const animatedParticles = seasonal.particles.map(p => ({
      ...p,
      vx: (Math.random() - 0.5) * 2,
      vy: p.type === 'snow' ? 1 + Math.random() * 2 : 0.5 + Math.random()
    }));
    setParticles(animatedParticles);
    
    setIsDay(isDaytime(latitude, longitude, currentTime));
    
    // Animation loop
    const interval = setInterval(() => {
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: (cloud.x + cloud.speed) % 850
      })));
      
      setParticles(prev => prev.map(p => {
        let newX = p.x + (p.vx || 0);
        let newY = p.y + (p.vy || 0);
        
        // Bounce or reset
        if (newX < 0 || newX > 800) newX = p.x;
        if (newY > 300) {
          if (p.type === 'snow') newY = 0;
          else if (p.type === 'leaf') newY = 200;
          else newY = p.y;
        }
        
        return { ...p, x: newX, y: newY };
      }).filter(p => p.y <= 300));
    }, 100);
    
    return () => clearInterval(interval);
  }, [weather, currentTime, latitude, longitude, isDay]);

  // Draw everything on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky with gradient
    const skyColor = generateSkyColor(currentTime, weather);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    // Adjust gradient based on mood
    let moodSkyColor = skyColor;
    if (mood === 'calm') {
      gradient.addColorStop(0, moodSkyColor);
      gradient.addColorStop(1, 'rgb(100, 150, 200)');
    } else if (mood === 'lonely') {
      gradient.addColorStop(0, 'rgb(70, 70, 120)');
      gradient.addColorStop(1, 'rgb(40, 40, 80)');
    } else if (mood === 'stressed') {
      gradient.addColorStop(0, 'rgb(150, 100, 100)');
      gradient.addColorStop(1, 'rgb(100, 70, 70)');
    } else {
      gradient.addColorStop(0, moodSkyColor);
      gradient.addColorStop(1, 'rgb(150, 200, 255)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw celestial body (sun/moon)
    const celestial = getCelestialPosition(currentTime);
    ctx.beginPath();
    if (celestial.type === 'sun') {
      // Sun with rays
      ctx.fillStyle = mood === 'energetic' ? '#FFDD00' : '#FFFF00';
      ctx.arc(celestial.x, celestial.y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Sun rays
      ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const rayLength = 50;
        ctx.beginPath();
        ctx.moveTo(
          celestial.x + Math.cos(angle) * 35,
          celestial.y + Math.sin(angle) * 35
        );
        ctx.lineTo(
          celestial.x + Math.cos(angle) * rayLength,
          celestial.y + Math.sin(angle) * rayLength
        );
        ctx.stroke();
      }
    } else {
      // Moon with craters
      ctx.fillStyle = '#F0F0F0';
      ctx.arc(celestial.x, celestial.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Craters
      ctx.fillStyle = '#D0D0D0';
      ctx.beginPath();
      ctx.arc(celestial.x - 10, celestial.y - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(celestial.x + 8, celestial.y + 10, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw clouds
    clouds.forEach(cloud => {
      ctx.fillStyle = weather === 'rain' ? 'rgba(100, 100, 120, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      // Draw cloud as overlapping circles
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.3, cloud.y - 10, cloud.size * 0.3, 0, Math.PI * 2);
      ctx.arc(cloud.x - cloud.size * 0.3, cloud.y - 10, cloud.size * 0.3, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
      ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw rain if weather is rain
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(150, 150, 255, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 100; i++) {
        const x = (i * 8 + (Date.now() / 20) % 8) % 800;
        const y = (Date.now() / 10 + i * 20) % 300;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 15);
        ctx.stroke();
      }
    }
    
    // Draw stars (only at night)
    if (!isDay) {
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1 + star.brightness, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw aurora occasionally (1% chance each render)
      if (Math.random() < 0.01 && mood === 'calm') {
        const aurora = generateAuroraPoints();
        ctx.beginPath();
        ctx.moveTo(aurora[0].x, aurora[0].y);
        for (let i = 1; i < aurora.length; i++) {
          ctx.lineTo(aurora[i].x, aurora[i].y);
        }
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.3)';
        ctx.lineWidth = 5;
        ctx.stroke();
      }
      
      // Draw city lights
      cityLights.forEach(light => {
        ctx.fillStyle = `rgba(255, 255, 200, ${light.intensity * 0.7})`;
        ctx.beginPath();
        ctx.arc(light.x, light.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Draw ground
    const seasonal = getSeasonalElements(currentTime, weather);
    ctx.fillStyle = seasonal.groundColor;
    ctx.fillRect(0, 250, canvas.width, 50);
    
    // Draw particles (leaves, snow, blossoms)
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      if (particle.type === 'leaf') {
        // Draw leaf shape
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(Date.now() / 1000);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (particle.type === 'snow') {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'blossom') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * 3;
          const y = Math.sin(angle) * 3;
          if (i === 0) ctx.moveTo(particle.x + x, particle.y + y);
          else ctx.lineTo(particle.x + x, particle.y + y);
        }
        ctx.closePath();
        ctx.fill();
      }
    });
    
    // Draw horizon line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(canvas.width, 250);
    ctx.stroke();
    
  }, [currentTime, weather, clouds, stars, cityLights, particles, isDay, mood]);

  // Handle click for interaction
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add ripple effect where clicked
    setParticles(prev => [
      ...prev,
      {
        x, y,
        type: 'ripple',
        color: 'rgba(100, 200, 255, 0.5)',
        vx: 0,
        vy: 0
      }
    ]);
    
    if (onInteraction) onInteraction();
  };

  return (
    <div className="earth-visualization">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        onClick={handleClick}
        className="earth-canvas"
        title="Click to interact with Earth view"
      />
      <div className="visualization-info">
        <div className="time-display">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="location"> | {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E</span>
        </div>
        <div className="weather-display">
          Weather: {weather} | {isDay ? '☀️ Daytime' : '🌙 Nighttime'}
        </div>
        <div className="mood-display">
          Mood mode: {mood} | Season: {getSeasonName(currentTime.getMonth())}
        </div>
      </div>
    </div>
  );
};

// Helper function
function getSeasonName(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

export default EarthVisualization;