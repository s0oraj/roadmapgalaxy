// Scene.tsx
import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../store/navigationStore';
import GalaxyParticles from './GalaxyParticles';
import Background from './Background';
import CameraController from './CameraController';

interface Props {
  targetPosition?: THREE.Vector3;
}

const Scene = ({ targetPosition = new THREE.Vector3(6.67, 0.2, 4) }: Props) => {
  const navigate = useNavigate();
  const { 
    isTransitioning, 
    setIsTransitioning, 
    setCursorStyle,
    setCurrentScene 
  } = useNavigationStore();

  const [cameraDistance, setCameraDistance] = useState(10);

  const handleCameraMove = useCallback((distance: number) => {
    setCameraDistance(distance);
  }, []);

  useEffect(() => {
    setCurrentScene('galaxy');
    setCursorStyle('default');
    return () => {
      setIsTransitioning(false);
      setCursorStyle('default');
    };
  }, [setCurrentScene, setCursorStyle, setIsTransitioning]);

  const handleStarClick = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setCurrentScene('roadmap');
    navigate('/roadmap');
  };

  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        camera={{
          position: [0, 3, 10],
          fov: 65,
          near: 0.1,
          far: 2000,
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
          maxDistance={100}
        />

        <OrbitControls
          enabled={!isTransitioning}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
          minDistance={3}
          maxDistance={80}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
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

export default Scene;
