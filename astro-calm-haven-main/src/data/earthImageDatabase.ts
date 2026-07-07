// Preloaded Earth images metadata
// This maps lat/lng coordinates to image filenames

export interface EarthLocation {
  lat: number;
  lng: number;
  imageName: string;
  title: string;
  description: string;
  category: 'landmark' | 'nature' | 'city' | 'astronaut_home';
}

export const earthImageDatabase: EarthLocation[] = [
  // Example locations (expand to 5000+ before launch)
  {
    lat: 28.6139,
    lng: 77.2090,
    imageName: 'delhi_india.jpg',
    title: 'New Delhi, India',
    description: 'Capital city of India - home to historic Red Fort and Qutub Minar',
    category: 'city'
  },
  {
    lat: 40.7128,
    lng: -74.0060,
    imageName: 'newyork_usa.jpg',
    title: 'New York City, USA',
    description: 'The city that never sleeps - Statue of Liberty stands in the harbor',
    category: 'city'
  },
  {
    lat: 27.9881,
    lng: 86.9250,
    imageName: 'mount_everest.jpg',
    title: 'Mount Everest, Himalayas',
    description: 'Highest mountain on Earth - 8,848 meters above sea level',
    category: 'nature'
  },
  {
    lat: -14.2350,
    lng: -51.9253,
    imageName: 'amazon_rainforest.jpg',
    title: 'Amazon Rainforest, Brazil',
    description: 'Largest tropical rainforest - home to incredible biodiversity',
    category: 'nature'
  },
  {
    lat: 36.1069,
    lng: -112.1129,
    imageName: 'grand_canyon.jpg',
    title: 'Grand Canyon, USA',
    description: 'Vast canyon carved by Colorado River over millions of years',
    category: 'nature'
  },
  // Add more locations...
];

// Find nearest location to clicked coordinates
export function findNearestLocation(lat: number, lng: number): EarthLocation {
  let nearest = earthImageDatabase[0];
  let minDistance = Number.MAX_VALUE;

  for (const location of earthImageDatabase) {
    const distance = Math.sqrt(
      Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }
  
  return nearest;
}

// Get all locations for a specific category
export function getLocationsByCategory(category: EarthLocation['category']): EarthLocation[] {
  return earthImageDatabase.filter(loc => loc.category === category);
}