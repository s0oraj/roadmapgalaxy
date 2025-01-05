// particleTexture.ts
export function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  
  // Enhanced gradient for better star appearance
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

