import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface EarthProps {
  size?: number;
  rotationSpeed?: number;
  showMarkers?: boolean;
  interactive?: boolean;
  onLandmarkClick?: (landmark: any) => void;
}

const Earth: React.FC<EarthProps> = ({ 
  size = 3, 
  rotationSpeed = 0.001,
  showMarkers = true,
  interactive = false,
  onLandmarkClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);

  // Simple landmarks for the reusable component
  const landmarks = [
    { name: "North America", lat: 40.0, lon: -100.0, color: 0x33aa44 },
    { name: "Europe", lat: 50.0, lon: 10.0, color: 0x44aaff },
    { name: "Asia", lat: 30.0, lon: 100.0, color: 0xff6b6b },
    { name: "Africa", lat: 0.0, lon: 20.0, color: 0xddaa44 },
  ];

  const convertLatLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  };

  const createProceduralTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Ocean
    ctx.fillStyle = '#2233ff';
    ctx.fillRect(0, 0, 512, 256);

    // Simple continents
    ctx.fillStyle = '#33aa44';
    ctx.fillRect(100, 50, 80, 60);   // Americas
    ctx.fillRect(250, 40, 150, 60);  // Europe/Asia
    ctx.fillRect(240, 100, 80, 90);  // Africa
    ctx.fillRect(375, 150, 60, 50);  // Australia

    return canvas.toDataURL();
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(size, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(createProceduralTexture());
    
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: new THREE.Color(0x222222),
      shininess: 5
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;

    // Add landmarks if enabled
    if (showMarkers) {
      landmarks.forEach(landmark => {
        const position = convertLatLonToVector3(landmark.lat, landmark.lon, size * 1.02);
        const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: landmark.color });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(position);
        marker.userData = landmark;
        scene.add(marker);
      });
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    camera.position.z = size * 3;

    // Interaction if enabled
    if (interactive && onLandmarkClick) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const handleClick = (event: MouseEvent) => {
        const rect = mountRef.current!.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        
        intersects.forEach(intersect => {
          if (intersect.object.userData.name) {
            onLandmarkClick(intersect.object.userData);
          }
        });
      };

      mountRef.current.addEventListener('click', handleClick);

      return () => {
        mountRef.current?.removeEventListener('click', handleClick);
      };
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (earthRef.current) {
        earthRef.current.rotation.y += rotationSpeed;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [size, rotationSpeed, showMarkers, interactive, onLandmarkClick]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full rounded-lg bg-gradient-to-br from-space-deep to-space-medium"
      style={{ minHeight: '300px' }}
    />
  );
};

export default Earth;