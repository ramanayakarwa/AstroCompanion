// Mathematical functions to generate Earth visuals

// Calculate if it's day or night at given coordinates
export function isDaytime(lat: number, lng: number, currentTime: Date): boolean {
  // Simplified day/night calculation
  const hour = currentTime.getUTCHours() + (lng / 15);
  const normalizedHour = ((hour % 24) + 24) % 24;
  return normalizedHour >= 6 && normalizedHour < 18;
}

// Generate sky color based on time and weather
export function generateSkyColor(
  time: Date, 
  weather: 'clear' | 'cloudy' | 'rain' | 'snow' = 'clear'
): string {
  const hour = time.getHours();
  const minute = time.getMinutes();
  const totalMinutes = hour * 60 + minute;
  
  let r, g, b;
  
  // Day cycle colors
  if (totalMinutes >= 5*60 && totalMinutes < 8*60) {
    // Dawn (5-8 AM)
    r = 255; g = 150 + Math.sin(totalMinutes/60)*50; b = 100;
  } else if (totalMinutes >= 8*60 && totalMinutes < 17*60) {
    // Day (8 AM - 5 PM)
    r = 135; g = 206; b = 235; // Sky blue
  } else if (totalMinutes >= 17*60 && totalMinutes < 20*60) {
    // Dusk (5-8 PM)
    r = 255; g = 100 + Math.cos(totalMinutes/60)*70; b = 50;
  } else {
    // Night (8 PM - 5 AM)
    r = 10; g = 10; b = 40; // Deep blue
  }
  
  // Adjust for weather
  if (weather === 'cloudy') {
    r = Math.floor(r * 0.8);
    g = Math.floor(g * 0.8);
    b = Math.floor(b * 0.9);
  } else if (weather === 'rain') {
    r = Math.floor(r * 0.6);
    g = Math.floor(g * 0.6);
    b = Math.floor(b * 0.8);
  } else if (weather === 'snow') {
    r = Math.floor(r * 1.2);
    g = Math.floor(g * 1.2);
    b = Math.floor(b * 1.3);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Generate cloud positions (Perlin-like noise simplified)
export function generateClouds(numClouds: number): Array<{x: number, y: number, size: number, speed: number}> {
  const clouds = [];
  for (let i = 0; i < numClouds; i++) {
    clouds.push({
      x: Math.random() * 800,
      y: 50 + Math.random() * 150,
      size: 30 + Math.random() * 70,
      speed: 0.2 + Math.random() * 0.5
    });
  }
  return clouds;
}

// Generate star positions for night
export function generateStars(numStars: number): Array<{x: number, y: number, brightness: number}> {
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 300,
      brightness: 0.3 + Math.random() * 0.7
    });
  }
  return stars;
}

// Generate aurora effect
export function generateAuroraPoints(): Array<{x: number, y: number, color: string}> {
  const points = [];
  const baseY = 50;
  for (let x = 0; x <= 800; x += 10) {
    const y = baseY + Math.sin(x / 50) * 30 + Math.cos(x / 30) * 15;
    const hue = 120 + Math.sin(x / 100) * 40; // Green-purple range
    points.push({
      x,
      y,
      color: `hsl(${hue}, 100%, 60%)`
    });
  }
  return points;
}

// Generate city lights for night view
export function generateCityLights(): Array<{x: number, y: number, intensity: number}> {
  const lights = [];
  // Simulate city clusters
  const clusters = [100, 300, 500, 700];
  clusters.forEach(x => {
    for (let i = 0; i < 20; i++) {
      lights.push({
        x: x - 40 + Math.random() * 80,
        y: 250 + Math.random() * 50,
        intensity: 0.3 + Math.random() * 0.7
      });
    }
  });
  return lights;
}

// Generate seasonal elements
export function getSeasonalElements(date: Date, weather: string): {
  particles: Array<{x: number, y: number, type: string, color: string}>,
  groundColor: string
} {
  const month = date.getMonth();
  const particles = [];
  let groundColor = '';
  
  // Determine season
  if (month >= 2 && month <= 4) { // Spring
    groundColor = '#7CFC00'; // Green
    if (weather !== 'snow') {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * 800,
          y: 250 + Math.random() * 50,
          type: 'blossom',
          color: `hsl(${300 + Math.random() * 60}, 100%, 70%)` // Pink/white
        });
      }
    }
  } else if (month >= 5 && month <= 7) { // Summer
    groundColor = '#32CD32'; // Lime green
  } else if (month >= 8 && month <= 10) { // Autumn
    groundColor = '#D2691E'; // Chocolate
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * 800,
        y: 200 + Math.random() * 100,
        type: 'leaf',
        color: `hsl(${20 + Math.random() * 40}, 100%, 50%)` // Orange/red
      });
    }
  } else { // Winter
    groundColor = '#F0FFFF'; // Azure white
    if (weather === 'snow') {
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * 800,
          y: Math.random() * 300,
          type: 'snow',
          color: '#FFFFFF'
        });
      }
    }
  }
  
  return { particles, groundColor };
}

// Generate sun/moon position
export function getCelestialPosition(time: Date): {x: number, y: number, type: 'sun' | 'moon'} {
  const hour = time.getHours();
  const minute = time.getMinutes();
  const totalMinutes = hour * 60 + minute;
  
  // Sun rises at 6 AM, sets at 6 PM
  const isDay = totalMinutes >= 6*60 && totalMinutes < 18*60;
  
  if (isDay) {
    // Sun arc from left to right
    const progress = (totalMinutes - 6*60) / (12*60); // 0 to 1
    const x = 100 + progress * 600; // Moves across screen
    const y = 300 - Math.sin(progress * Math.PI) * 250; // Arc motion
    return { x, y, type: 'sun' as const };
  } else {
    // Moon arc (opposite of sun for simplicity)
    const nightMinutes = totalMinutes < 6*60 ? totalMinutes + 6*60 : totalMinutes - 18*60;
    const progress = nightMinutes / (12*60);
    const x = 100 + progress * 600;
    const y = 300 - Math.sin(progress * Math.PI) * 250;
    return { x, y, type: 'moon' as const };
  }
}