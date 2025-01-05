// GalaxyParticlesOptimized.tsx
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { generateGalaxyGeometry } from './utils/galaxyGeometry';

// Custom shader for galaxy particles
const galaxyVertexShader = `
  attribute float size;
  varying vec3 vColor;
  uniform float uTime;
  
  void main() {
    vColor = color;
    
    // Rotation animation in shader
    float angle = uTime * 0.05;
    float c = cos(angle);
    float s = sin(angle);
    vec3 pos = position;
    pos.xz = mat2(c, -s, s, c) * pos.xz;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Frustum culling in shader
    float distanceToCamera = length(mvPosition.xyz);
    float visibility = 1.0;
    if(distanceToCamera > 30.0) {
      visibility = 1.0 - (distanceToCamera - 30.0) / 10.0;
      visibility = clamp(visibility, 0.0, 1.0);
    }
    
    gl_PointSize = size * (300.0 / -mvPosition.z) * visibility;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const galaxyFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle shape
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if(r > 0.5) discard;
    
    // Smooth falloff
    float alpha = 1.0 - smoothstep(0.3, 0.5, r);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface Props {
  targetPosition: THREE.Vector3;
  onTargetClick: () => void;
}

const GalaxyParticlesOptimized = ({ targetPosition, onTargetClick }: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const galaxyRef = useRef<THREE.Points>(null);
  const detailsRef = useRef<THREE.Group>(null);
  const timeUniform = useRef({ value: 0 });
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Generate main galaxy geometry
  const { positions, colors, sizes } = useMemo(() => generateGalaxyGeometry(true), []);

  // Create instanced geometry for repeated elements
  const instancedGeometry = useMemo(() => {
    const baseGeometry = new THREE.SphereGeometry(0.002, 8, 8);
    const instancedGeo = new THREE.InstancedBufferGeometry();
    
    // Copy attributes from base geometry
    Object.keys(baseGeometry.attributes).forEach(key => {
      instancedGeo.attributes[key] = baseGeometry.attributes[key];
    });
    
    // Add instancing attributes
    const instancePositions = new Float32Array(positions);
    const instanceColors = new Float32Array(colors);
    const instanceSizes = new Float32Array(sizes);
    
    instancedGeo.setAttribute('position', new THREE.InstancedBufferAttribute(instancePositions, 3));
    instancedGeo.setAttribute('color', new THREE.InstancedBufferAttribute(instanceColors, 3));
    instancedGeo.setAttribute('size', new THREE.InstancedBufferAttribute(instanceSizes, 1));
    
    return instancedGeo;
  }, [positions, colors, sizes]);

  // Custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms: {
        uTime: timeUniform.current
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
  }, []);

  // Frustum culling check
  const updateFrustumCulling = useCallback((camera: THREE.Camera) => {
    if (!groupRef.current) return;
    
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
    
    // Update visibility based on frustum
    const positions = instancedGeometry.attributes.position;
    const visibility = new Float32Array(positions.count);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const point = new THREE.Vector3(x, y, z);
      point.applyMatrix4(groupRef.current.matrixWorld);
      
      visibility[i] = frustum.containsPoint(point) ? 1 : 0;
    }
    
    instancedGeometry.setAttribute(
      'visibility',
      new THREE.BufferAttribute(visibility, 1)
    );
  }, [frustum, projScreenMatrix, instancedGeometry]);

  useFrame((state) => {
    const { camera, clock } = state;
    
    // Update shader time
    timeUniform.current.value = clock.getElapsedTime();
    
    // Update frustum culling
    updateFrustumCulling(camera);
    
    // Update details positioning
    if (detailsRef.current) {
      const progress = Math.min(1, (clock.elapsedTime - 2) * 0.5);
      detailsRef.current.scale.setScalar(progress);
      
      if (progress === 1) {
        detailsRef.current.position.y = Math.sin(clock.elapsedTime) * 0.02;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main galaxy using instanced mesh */}
      <instancedMesh
        args={[instancedGeometry, shaderMaterial, positions.length / 3]}
        frustumCulled={true}
      />
      
      {/* Target star with label */}
      <group ref={detailsRef} position={targetPosition} scale={0}>
        <mesh onClick={onTargetClick}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        <Text
          position={[0, 1.5, 0]}
          color="white"
          fontSize={0.2}
          anchorX="center"
          anchorY="middle"
          opacity={0.8}
          onClick={onTargetClick}
        >
          Level 1
        </Text>
      </group>
    </group>
  );
};

export default GalaxyParticlesOptimized;
