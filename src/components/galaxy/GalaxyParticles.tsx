
// GalaxyParticles.tsx
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';
import { createParticleTexture } from './utils/particleTexture';
import { debounce } from 'lodash';

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
  cameraDistance: number;
}

const GalaxyParticles = ({ targetPosition, onTargetClick, cameraDistance }: Props) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const detailsRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [geometry, setGeometry] = useState<any>(null);
  
  const particleTexture = useMemo(() => createParticleTexture(), []);
  
  const linePoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.2, 0)
  ];

  // Debounced geometry update to prevent too frequent regeneration
  const updateGeometry = useCallback(
    debounce((distance: number) => {
      const newGeometry = generateGalaxyGeometry(distance, {
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
        dustColor: '#4a2d05'
      });
      setGeometry(newGeometry);
    }, 200),
    []
  );

  useEffect(() => {
    updateGeometry(cameraDistance);
  }, [cameraDistance, updateGeometry]);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
    
    if (detailsRef.current) {
      detailsRef.current.rotation.y = galaxyRef.current?.rotation.y || 0;
      const progress = Math.min(1, (state.clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        detailsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
      }
    }
  });

  if (!geometry) return null;

  return (
    <group>
      <motion.points
        ref={galaxyRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 2, 
          ease: "easeOut",
          type: "spring",
          damping: 20 
        }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={geometry.positions.length / 3}
            array={geometry.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={geometry.colors.length / 3}
            array={geometry.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={geometry.sizes.length}
            array={geometry.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.006}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors={true}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
          opacity={1.2}
          transparent={true}
        />
      </motion.points>

      {/* Target Star */}
      <group position={targetPosition}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={1}
              array={new Float32Array([0, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.006}
            sizeAttenuation={true}
            depthWrite={false}
            color="#ffffff"
            opacity={hovered ? 1.2 : 1}
            transparent={true}
            blending={THREE.AdditiveBlending}
            map={particleTexture}
          />
        </points>

        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      <group ref={detailsRef} position={targetPosition} scale={0}>
        <line geometry={new THREE.BufferGeometry().setFromPoints(linePoints)}>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </line>

        <Text
          position={[0, 1.5, 0]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          opacity={0.8}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onTargetClick}
        >
          Level 1
        </Text>
      </group>
    </group>
  );
};

export default GalaxyParticles;