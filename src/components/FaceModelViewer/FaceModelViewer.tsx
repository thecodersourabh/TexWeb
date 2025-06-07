import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { FaceCapture } from '../FaceCapture/FaceCapture';
import { Face3DGenerator } from '../../utils/Face3DGenerator';
import * as THREE from 'three';
import './FaceModelViewer.css';

interface FaceModelProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
}

function FaceModel({ geometry, texture }: FaceModelProps) {
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        normalScale={new THREE.Vector2(0.15, 0.15)} // Adjust normal mapping intensity
      />
    </mesh>
  );
}

export function FaceModelViewer() {
  const [faceGeometry, setFaceGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [faceTexture, setFaceTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = useCallback(async (captureData: { landmarks: number[][]; texture: string }) => {
    setIsProcessing(true);
    setError(null);

    try {
      const generator = new Face3DGenerator({ resolution: 128 });
      
      // Generate 3D geometry from landmarks
      const geometry = await generator.generateModel({
        landmarks: captureData.landmarks.map(lm => [lm[0], lm[1], lm[2] ?? 0] as [number, number, number]),
        texture: captureData.texture
      });

      // Create texture from captured image
      const texture = await generator.createTexture(captureData.texture);
      
      setFaceGeometry(geometry);
      setFaceTexture(texture);
    } catch (err) {
      setError('Failed to generate 3D model');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  return (
    <div className="face-model-viewer">
      {!faceGeometry && (
        <FaceCapture 
          onCaptureComplete={handleCapture}
          onError={handleError}
        />
      )}

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-message">
            Generating 3D model...
          </div>
        </div>
      )}

      {faceGeometry && faceTexture && (
        <div className="model-view">
          <Canvas
            camera={{ position: [0, 0, 2], fov: 50 }}
            shadows
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Environment preset="studio" />
            
            <FaceModel geometry={faceGeometry} texture={faceTexture} />
            
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              enableZoom={true}
              minDistance={1}
              maxDistance={4}
              enablePan={false}
              target={[0, 0, 0]}
            />
          </Canvas>

          <button
            className="reset-button"
            onClick={() => {
              setFaceGeometry(null);
              setFaceTexture(null);
              setError(null);
            }}
          >
            Retake
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}