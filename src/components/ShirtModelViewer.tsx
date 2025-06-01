import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, AccumulativeShadows, RandomizedLight, Center, useGLTF, useTexture, Decal } from '@react-three/drei';
import { useRef } from 'react';

function Backdrop() {
  const shadows = useRef<any>();
  useFrame((state, delta) => {
    if (shadows.current) {
      // Optionally animate shadow color or other properties
    }
  });
  return (
    <AccumulativeShadows
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.85}
      scale={5}
      resolution={2048}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight amount={4} radius={9} intensity={0.55 * Math.PI} ambient={0.25} position={[5, 5, -10]} />
      <RandomizedLight amount={4} radius={5} intensity={0.25 * Math.PI} ambient={0.55} position={[-5, 5, -9]} />
    </AccumulativeShadows>
  );
}

function Shirt({ color = '#ffffff', decal = null }: { color?: string; decal?: string | null }) {
  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb') as any;
  console.log('GLB nodes:', nodes);
  console.log('GLB materials:', materials);
  const texture = decal ? useTexture(`/${decal}.png`) : undefined;
  // Animate color if needed
  useFrame(() => {
    if (materials.lambert1) {
      materials.lambert1.color.set(color);
    }
  });
  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male?.geometry}
      material={materials.lambert1}
      material-roughness={1}
      dispose={null}
    >
      {decal && <Decal position={[0, 0.04, 0.15]} rotation={[0, 0, 0]} scale={0.15} map={texture} />}
    </mesh>
  );
}

export function ShirtModelViewer({ color = '#ffffff', decal = null }) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 25 }} gl={{ preserveDrawingBuffer: true }} style={{ width: '100%', height: 400, borderRadius: '1rem' }}>
      <ambientLight intensity={0.5 * Math.PI} />
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
      <Backdrop />
      <Center>
        <Shirt color={color} decal={decal} />
      </Center>
    </Canvas>
  );
}

// Preload the GLB
useGLTF.preload('/shirt_baked_collapsed.glb');
