import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Environment, useGLTF } from '@react-three/drei';
import './SimpleHumanModel.css';
import { useEffect, useRef, useState } from 'react';
import { ManGLBModel } from './ManGLBModel';
import { Backdrop } from './Backdrop';
import { CameraRig } from './CameraRig';

interface IHumanModelProps {
  color: string;
  chest: number;  
  waist: number;  
  hips: number;   
  height: number; 
}

const inchToCm = (inch: number) => inch * 2.54;

export function SimpleHumanModel(props: IHumanModelProps) {
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

  // Convert measurements to centimeters for the 3D model
  const modelProps = {
    color: props.color,
    chest: inchToCm(props.chest),
    waist: inchToCm(props.waist),
    hips: inchToCm(props.hips),
    height: inchToCm(props.height),
  };

  return (
    <div className="human-model-canvas-container">
      <Canvas
        shadows={true}
        camera={{ 
          position: [0, 0, isMobile ? 2 : 2.5], 
          fov: isMobile ? 50 : 45,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true 
        }}
        dpr={[1, 2]} // Optimize performance while maintaining quality
      >
        <ambientLight intensity={0.5 * Math.PI} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        <CameraRig>
          <Backdrop />
          <Center>
            <ManGLBModel {...modelProps} />
          </Center>
        </CameraRig>
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4} // Limit vertical rotation
          maxPolarAngle={Math.PI * 3/4}
        />
      </Canvas>
    </div>
  );
}

// @ts-ignore
useGLTF.preload('/TexWeb/shirt_baked_collapsed.glb');

