import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, useGLTF } from '@react-three/drei';
import './SimpleHumanModel.css';
import { useEffect, useRef, useState } from 'react';
import { ManGLBModel } from './ManGLBModel';
import { Backdrop } from './Backdrop';
import { CameraRig } from './CameraRig';
import * as THREE from 'three';

function DirectionalLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);

  return (
    <group>
      <directionalLight
        ref={lightRef}
        position={[4, 4, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <object3D ref={targetRef} position={[0, 0, -1]} />
      </directionalLight>
    </group>
  );
}

interface IHumanModelProps {
  modelUrl?: string | null;
  color: string;
  zoom: number;
  modelType?: string; 
}

export function SimpleHumanModel({ modelUrl, modelType = "T-shirt", ...props }: IHumanModelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimize camera and controls setup
  useEffect(() => {
    if (controlsRef.current) {
      // Reset camera position
      controlsRef.current.target.set(0, 0, 0);

      // Optimize for mobile vs desktop
      if (isMobile) {
        controlsRef.current.minDistance = 1.5;
        controlsRef.current.maxDistance = 4;
        controlsRef.current.enablePan = false;
      } else {
        controlsRef.current.minDistance = 2;
        controlsRef.current.maxDistance = 5;
        controlsRef.current.enablePan = true;
      }

      controlsRef.current.update();
    }
  }, [isMobile]);
  const modelProps = {
    color: props.color,
    zoom: props.zoom,
    modelType
  };

  return (
    <div className="human-model-canvas-container">
      <Canvas
        shadows={true}
        camera={{ 
          position: [0, modelType === "Full Body" ? 1 : 0, isMobile ? 2 : 2.5], 
          fov: isMobile ? 50 : 45,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#f9fafb']} />
        <fog attach="fog" args={['#f9fafb', 5, 15]} />
        
        {/* Replace ambient light with multiple directional lights for better coverage */}
        <directionalLight
          intensity={0.5}
          position={[0, 1, 0]}
          color="#ffffff"
        />
        <directionalLight
          intensity={0.3}
          position={[-5, 5, -5]}
          color="#ffffff"
        />
        <DirectionalLight />
        <Environment 
          preset="studio"
          background={false}
        />
        <CameraRig>
          <Backdrop />
          <Center>
            <ManGLBModel modelUrl={modelUrl} {...modelProps} />
          </Center>
        </CameraRig>
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3/4}
        />
      </Canvas>
    </div>
  );
}

// Preload the default model
useGLTF.preload(new URL('shirt_baked_collapsed.glb', window.location.origin + import.meta.env.BASE_URL).href);

