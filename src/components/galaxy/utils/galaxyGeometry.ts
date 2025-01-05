// galaxyGeometry.ts
import * as THREE from 'three';
import { GalaxyConfig, LODLevel } from '../types';

const LOD_LEVELS: LODLevel[] = [
  { distance: 5, particleCount: 500000, size: 0.006 },   // Closest view
  { distance: 15, particleCount: 200000, size: 0.008 },  // Mid-range
  { distance: 30, particleCount: 100000, size: 0.012 },  // Far view
  { distance: 50, particleCount: 50000, size: 0.018 },   // Ultra far
];

export const generateGalaxyGeometry = (cameraDistance: number, config: GalaxyConfig) => {
  // Find appropriate LOD level
  const lodLevel = LOD_LEVELS.find(level => cameraDistance <= level.distance) 
    || LOD_LEVELS[LOD_LEVELS.length - 1];

  const positions = new Float32Array(lodLevel.particleCount * 3);
  const colors = new Float32Array(lodLevel.particleCount * 3);
  const sizes = new Float32Array(lodLevel.particleCount);

  // Generate core particles (always high detail)
  const coreParticleCount = Math.floor(lodLevel.particleCount * 0.35);
  let currentIndex = 0;

  // Core generation remains unchanged for consistent appearance
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = currentIndex * 3;
    const r = Math.pow(Math.random(), 2) * config.radius * config.bulgeSize;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;

    positions[i3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i3 + 2] = r * Math.cos(theta);

    const intensity = (1 - r / (config.radius * config.bulgeSize)) * config.coreIntensity;
    const color = new THREE.Color(config.insideColor);
    color.multiplyScalar(intensity);

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[currentIndex] = lodLevel.size;
    currentIndex++;
  }

  // Adaptive spiral arm generation based on LOD
  const armParticleSpacing = config.radius / (lodLevel.particleCount - coreParticleCount);
  
  for (let i = currentIndex; i < lodLevel.particleCount; i++) {
    const i3 = i * 3;
    const armRadius = (Math.floor((i - coreParticleCount) * armParticleSpacing) + config.radius * config.bulgeSize);
    const branchAngle = ((i % config.branches) / config.branches) * Math.PI * 2;
    const spinAngle = armRadius * config.spin;
    
    // Merge nearby particles in lower LOD levels
    const randomOffset = Math.pow(Math.random(), config.randomnessPower) * 
      (cameraDistance < 15 ? 1 : 0.5);

    positions[i3] = Math.cos(branchAngle + spinAngle) * armRadius + 
      (Math.random() - 0.5) * randomOffset;
    positions[i3 + 1] = (Math.random() - 0.5) * randomOffset;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * armRadius + 
      (Math.random() - 0.5) * randomOffset;

    const mixedColor = new THREE.Color();
    if (config.dustLanes && Math.random() < 0.3 && cameraDistance < 20) {
      mixedColor.set(config.dustColor);
    } else {
      const radiusPercent = armRadius / config.radius;
      mixedColor.lerpColors(
        new THREE.Color(config.insideColor),
        new THREE.Color(config.outsideColor),
        radiusPercent
      );
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    sizes[i] = lodLevel.size * (1 + Math.random() * 0.2);
  }

  return { positions, colors, sizes, particleCount: lodLevel.particleCount };
};