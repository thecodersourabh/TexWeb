import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ManGLBModelProps {
  modelUrl?: string | null;
  color: string;
  modelType?: string;
  zoom?: number;
}

export function ManGLBModel({ 
  color = '#ffffff', 
  modelType = "T-shirt",
  zoom = 1
}: ManGLBModelProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [currentModelPath, setCurrentModelPath] = useState(getModelPath(modelType));

  function getModelPath(type: string) {
    console.log('Getting model path for type:', type);
    if (type === "Full Body") {
      return `${baseUrl}man.glb`;
    }
    return `${baseUrl}shirt_baked_collapsed.glb`;
  }

  // Update model path when type changes
  useEffect(() => {
    console.log('Model type changed to:', modelType);
    const newPath = getModelPath(modelType);
    console.log('New model path:', newPath);
    setCurrentModelPath(newPath);
  }, [modelType, baseUrl]);

  // Load the model with the current path
  const { nodes } = useGLTF(currentModelPath);
  
  // Reference for color animation
  const materialRef = useRef<THREE.MeshStandardMaterial>();

  // Update material color smoothly
  useFrame((_, delta) => {
    if (materialRef.current) {
      easing.dampC(materialRef.current.color, new THREE.Color(color), 0.2, delta);
    }
  });

  // Early return if nodes aren't loaded yet
  if (!nodes) {
    console.log('Nodes not loaded yet');
    return null;
  }

  // Find the first mesh in the loaded model
  const firstMesh = Object.values(nodes).find(
    (node: any) => node instanceof THREE.Mesh
  ) as THREE.Mesh;

  if (!firstMesh) {
    console.log('No mesh found in model');
    return null;
  }

  // Create and configure the material
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.7,
    metalness: 0.1,
  });
  materialRef.current = material;  // Apply only zoom scaling
  const scale = zoom;

  console.log('Rendering model with zoom scale:', scale);
  
  return (
    <group dispose={null}>
      <mesh
        geometry={firstMesh.geometry}
        material={material}
        scale={scale}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Preload both models
const baseUrl = import.meta.env.BASE_URL || '/';
useGLTF.preload(`${baseUrl}shirt_baked_collapsed.glb`);
useGLTF.preload(`${baseUrl}man.glb`);
