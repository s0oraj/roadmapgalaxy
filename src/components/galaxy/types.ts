// types.ts
export interface GalaxyConfig {
  particlesCount: number;
  radius: number;
  branches: number;
  spin: number;
  randomnessPower: number;
  insideColor: string;
  outsideColor: string;
  dustColor: string;
  bulgeSize: number;
  armWidth: number;
  dustLanes: boolean;
  coreIntensity: number;
}

export interface LODLevel {
  distance: number;
  particleCount: number;
  size: number;
}