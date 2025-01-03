// components/galaxy/CameraController.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

interface Props {
  targetPosition: THREE.Vector3;
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

const CameraController = ({ targetPosition, isTransitioning, onTransitionComplete }: Props) => {
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isTransitioning) {
      setProgress(0);
    }
  }, [isTransitioning]);

  useFrame(() => {
    if (isTransitioning && progress < 1) {
      // Store initial positions
      const startPosition = camera.position.clone();
      // Calculate an extremely close end position near the target star
      const endPosition = targetPosition.clone().add(new THREE.Vector3(0.1, 0.1, 0.1));
      const midPoint = startPosition.clone().lerp(endPosition, 0.5);
      midPoint.y += 2; // Add arc to path

      // Update progress
      setProgress(prev => {
        const newProgress = prev + 0.005;
        if (newProgress >= 1 && camera.position.distanceTo(targetPosition) < 0.5) {
          onTransitionComplete();
          return 1;
        }
       return Math.min(newProgress, 1);
      });

      // Calculate new camera position
      const p1 = startPosition.clone().lerp(midPoint, progress);
      const p2 = midPoint.clone().lerp(endPosition, progress);
      const currentPos = new THREE.Vector3();
      currentPos.lerpVectors(p1, p2, progress);

      camera.position.copy(currentPos);
      camera.lookAt(targetPosition);
    }
  });

  return null;
};

export default CameraController;
