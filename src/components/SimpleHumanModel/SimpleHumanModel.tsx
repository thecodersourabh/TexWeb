import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, AccumulativeShadows, RandomizedLight, Environment } from '@react-three/drei';
import './SimpleHumanModel.css';
import { easing } from 'maath';
import { useEffect, useRef } from 'react';

interface IHumanModelProps {
  color: string;
  chest: number;
  waist: number;
  hips: number;
  height: number;
}

function ManGLBModel({ color }: { color: string }) {
  const { nodes } = useGLTF('/TexWeb/shirt_baked_collapsed.glb') as any;

  useFrame((_, delta) => {
    if (nodes.T_Shirt_male && nodes.T_Shirt_male.material) {
      easing.dampC(nodes.T_Shirt_male.material.color, color, 0.25, delta); // Smoothly update color
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={nodes.T_Shirt_male.material}
      position={[0, 0, 0]} 
      rotation={[0, 0, 0]}
      scale={1}
      dispose={null}
    />
  );
}

function Backdrop() {
  const shadows = useRef<any>(null);
  useFrame((state, delta) => {
    if (shadows.current) {
      easing.dampC(shadows.current.getMesh().material.color, '#ffffff', 0.25, delta); // Replace '#ffffff' with your desired color
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

function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<any>(null);
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta);
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 5, 0], 0.25, delta);
  });
  return <group ref={group}>{children}</group>;
}

export function SimpleHumanModel(props: IHumanModelProps) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0); 
      controlsRef.current.update(); // Update controls
    }
  }, [props.color]); 

  return (
    <div className="human-model-canvas-container">
      <Canvas
        shadows={true}
        camera={{ position: [0, 0, 2.5], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
        eventSource={document.getElementById('root') || undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={0.5 * Math.PI} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        <CameraRig>
          <Backdrop />
          <Center>
            <ManGLBModel color={props.color} />
          </Center>
        </CameraRig>
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
}


// @ts-ignore
useGLTF.preload('/TexWeb/shirt_baked_collapsed.glb');

