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

// Scene.tsx
export const Scene = ({ targetPosition = new THREE.Vector3(6.67, 0.2, 4) }: Props) => {
  const [cameraDistance, setCameraDistance] = useState(10);
  
  const handleCameraMove = useCallback((distance: number) => {
    setCameraDistance(distance);
  }, []);

  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        camera={{
          position: [0, 3, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
      >
        <CameraController
          targetPosition={targetPosition}
          isTransitioning={isTransitioning}
          onTransitionComplete={handleTransitionComplete}
          onCameraMove={handleCameraMove}
          minDistance={2}
          maxDistance={50}
        />
        <OrbitControls
          enabled={!isTransitioning}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
          minDistance={2}
          maxDistance={50}
          minPolarAngle={Math.PI * 0.25}
          maxPolarAngle={Math.PI * 0.75}
        />
        <Background />
        <GalaxyParticles
          targetPosition={targetPosition}
          onTargetClick={handleStarClick}
          cameraDistance={cameraDistance}
        />
      </Canvas>
    </div>
  );
};