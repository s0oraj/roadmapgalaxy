// galaxyGeometry.ts
import * as THREE from 'three';
import { GalaxyConfig, LODLevel, GalaxyGeometryData } from '../types';

const LOD_LEVELS: LODLevel[] = [
  { distance: 5, particleCount: 500000, particleSize: 0.006, sizeFactor: 1.0 },
  { distance: 15, particleCount: 250000, particleSize: 0.006, sizeFactor: 1.0 }, // Maintain consistent size
  { distance: 30, particleCount: 125000, particleSize: 0.006, sizeFactor: 1.0 },
  { distance: 50, particleCount: 62500, particleSize: 0.006, sizeFactor: 1.0 },
];

const DEFAULT_CONFIG: GalaxyConfig = {
  particlesCount: 500000,
  radius: 20,
  branches: 5,
  spin: 1.5,
  randomnessPower: 2.05,
  bulgeSize: 0.25,
  armWidth: 0.3,
  dustLanes: true,
  coreIntensity: 2.5,
  insideColor: '#ffab4d',
  outsideColor: '#3b7bcc',
  dustColor: '#4a2d05',
};

// New function to generate spiral arm particles
const generateSpiralArm = (
  currentIndex: number,
  arm: number,
  particlesPerArm: number,
  positions: Float32Array,
  colors: Float32Array,
  sizes: Float32Array,
  centerColor: THREE.Color,
  outerColor: THREE.Color,
  config: GalaxyConfig
) => {
  const armAngle = (arm / config.branches) * Math.PI * 2;
  const radiusStep = (config.radius - config.radius * config.bulgeSize) / particlesPerArm;

  for (let i = 0; i < particlesPerArm; i++) {
    const i3 = currentIndex * 3;
    const armRadius = config.radius * config.bulgeSize + i * radiusStep;
    const spinAngle = armRadius * config.spin;
    const rotationAngle = armAngle + spinAngle;

    // Controlled randomness for consistent look
    const randomX = Math.pow(Math.random(), config.randomnessPower) * (armRadius * 0.1);
    const randomY = Math.pow(Math.random(), config.randomnessPower) * (armRadius * 0.05);
    const randomZ = Math.pow(Math.random(), config.randomnessPower) * (armRadius * 0.1);

    // Tighter spiral formation
    positions[i3] = Math.cos(rotationAngle) * armRadius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(rotationAngle) * armRadius + randomZ;

    // Enhanced color blending
    const mixedColor = new THREE.Color();
    const progressAlongArm = i / particlesPerArm;
    mixedColor.lerpColors(centerColor, outerColor, Math.pow(progressAlongArm, 0.5));

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Consistent particle sizes
    sizes[currentIndex] = config.particleSize * (0.8 + Math.random() * 0.4);
    currentIndex++;
  }

  return currentIndex;
};

export const generateGalaxyGeometry = (
  cameraDistance: number,
  config: Partial<GalaxyConfig> = {}
): GalaxyGeometryData => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Find appropriate LOD level
  const lodLevel = LOD_LEVELS.find((level) => cameraDistance <= level.distance) 
    || LOD_LEVELS[LOD_LEVELS.length - 1];

  const positions = new Float32Array(lodLevel.particleCount * 3);
  const colors = new Float32Array(lodLevel.particleCount * 3);
  const sizes = new Float32Array(lodLevel.particleCount);

  const centerColor = new THREE.Color(finalConfig.insideColor);
  const outerColor = new THREE.Color(finalConfig.outsideColor);
  const dustLaneColor = new THREE.Color(finalConfig.dustColor);

  // Generate bulge particles (35% of total)
  const bulgeCount = Math.floor(lodLevel.particleCount * 0.35);
  let currentIndex = 0;

  for (let i = 0; i < bulgeCount; i++) {
    const i3 = currentIndex * 3;
    const r = Math.pow(Math.random(), 2) * finalConfig.radius * finalConfig.bulgeSize;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1); // Better spherical distribution

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const intensity = (1 - r / (finalConfig.radius * finalConfig.bulgeSize)) 
      * finalConfig.coreIntensity;
    const color = new THREE.Color(finalConfig.insideColor);
    color.multiplyScalar(intensity);

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[currentIndex] = lodLevel.particleSize * lodLevel.sizeFactor 
      * (Math.random() * 0.5 + 0.5);
    currentIndex++;
  }

  // Generate spiral arms
  const remainingParticles = lodLevel.particleCount - bulgeCount;
  const particlesPerArm = Math.floor(remainingParticles / finalConfig.branches);

  for (let arm = 0; arm < finalConfig.branches; arm++) {
    currentIndex = generateSpiralArm(
      currentIndex,
      arm,
      particlesPerArm,
      positions,
      colors,
      sizes,
      centerColor,
      outerColor,
      finalConfig
    );
  }

  return {
    positions,
    colors,
    sizes,
    particleCount: currentIndex,
  };
};
