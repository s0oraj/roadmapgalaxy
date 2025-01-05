// CameraController.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CameraControlProps } from '../types';

const CameraController = ({ 
  targetPosition, 
  isTransitioning, 
  onTransitionComplete,
  onCameraMove,
  minDistance = 2,
  maxDistance = 100
}: CameraControlProps) => {
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);

  const updateCameraDistance = useCallback(() => {
    const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    onCameraMove?.(distance);
  }, [camera, onCameraMove]);

  useEffect(() => {
    if (isTransitioning) {
      setProgress(0);
    }
    updateCameraDistance();
  }, [isTransitioning, updateCameraDistance]);

  useFrame(() => {
    if (isTransitioning && progress < 1) {
      const startPosition = new THREE.Vector3(0, 3, 10);
      const midPoint = startPosition.clone().lerp(targetPosition, 0.5);
      midPoint.y += 2;

      setProgress(prev => {
        const newProgress = prev + 0.004;
        if (newProgress >= 1) {
          onTransitionComplete();
          return 1;
        }
        return newProgress;
      });

      const p1 = startPosition.clone().lerp(midPoint, progress);
      const p2 = midPoint.clone().lerp(targetPosition, progress);
      const currentPos = new THREE.Vector3();
      currentPos.lerpVectors(p1, p2, progress);

      camera.position.copy(currentPos);
      camera.lookAt(targetPosition);
    }

    // Update camera distance for LOD
    updateCameraDistance();

    // Ensure camera stays within bounds
    const distance = camera.position.length();
    if (distance < minDistance || distance > maxDistance) {
      const clampedDistance = THREE.MathUtils.clamp(distance, minDistance, maxDistance);
      camera.position.setLength(clampedDistance);
    }
  });

  return null;
};

export default CameraController;