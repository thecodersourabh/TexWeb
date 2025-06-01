import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import './SimpleHumanModel.css';

interface IHumanModelProps {
  color: string;
  chest: number;
  waist: number;
  hips: number;
  height: number;
}

function ManGLBModel() {
  const gltf = useGLTF('/TexWeb/man.glb') as any;

  // Traverse the model to ensure materials are applied correctly
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material.wireframe = true; // Enable wireframe mode to show mesh triangles
      child.material.color.set('black'); // Set a default color
      child.material.needsUpdate = true; // Ensure material updates
    }
  });

  return <primitive object={gltf.scene} />;
}

export function SimpleHumanModel(props: IHumanModelProps) {
  return (
    <div className="human-model-canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 1, 3], fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
        eventSource={document.getElementById('design-model-container') || undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={1 * Math.PI} />
        <Center>
          <ManGLBModel />
        </Center>
        <OrbitControls enablePan={true} enableZoom={true} />
      </Canvas>
    </div>
  );
}

// Required for useGLTF to avoid warnings
// @ts-ignore
useGLTF.preload('/TexWeb/man.glb') as any;
