import { useRef, useEffect, useState, useCallback } from 'react';
import { Human } from '@vladmandic/human';
import './FaceCapture.css';

interface FaceCaptureProps {
  onCaptureComplete: (captureData: { landmarks: Array<[number, number, number]>; texture: string }) => void;
  onError: (error: string) => void;
}

export function FaceCapture({ onCaptureComplete, onError }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const humanRef = useRef<Human | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  useEffect(() => {
    const initHuman = async () => {
      try {
        // Use base URL from Vite config
        const baseUrl = import.meta.env.BASE_URL || '/';
        
        const config = {
          modelBasePath: `${baseUrl}models`,
          face: {
            enabled: true,
            detector: { 
              enabled: true,
              rotation: false,
              maxDetected: 1,
              return: true 
            },
            mesh: { enabled: true },
            iris: { enabled: true }
          },
          filter: { enabled: false }
        };

        humanRef.current = new Human(config);
        await humanRef.current.load();
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error initializing Human:', error);
        onError('Failed to load face detection models');
      }
    };

    initHuman();
  }, [onError]);

  useEffect(() => {
    if (!isModelLoaded) return;

    const startVideo = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 640,
              height: 480,
              facingMode: 'user',
              aspectRatio: 4/3
            } 
          });
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        onError('Failed to access camera');
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded, onError]);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !humanRef.current || !isModelLoaded) {
      return null;
    }

    const result = await humanRef.current.detect(videoRef.current);
    
    if (!result.face?.[0]?.mesh || result.face[0].mesh.length === 0) {
      setIsFaceDetected(false);
      return null;
    }

    setIsFaceDetected(true);

    // Draw results
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the video frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Draw face mesh points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;

      const mesh = result.face[0].mesh;
      for (const point of mesh) {
        const x = point[0] * canvas.width;
        const y = point[1] * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }

    return result.face[0];
  }, [isModelLoaded]);

  // Run continuous face detection for preview
  useEffect(() => {
    if (!isModelLoaded) return;

    let animationFrame: number;
    const updatePreview = async () => {
      await detectFace();
      animationFrame = requestAnimationFrame(updatePreview);
    };

    updatePreview();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isModelLoaded, detectFace]);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      const face = await detectFace();
      
      if (!face || !face.mesh || !canvasRef.current) {
        onError('No face detected. Please center your face in the frame.');
        return;
      }

      // Get the face texture from the video frame
      const texture = canvasRef.current.toDataURL('image/jpeg');
      
      onCaptureComplete({
        landmarks: face.mesh as Array<[number, number, number]>,
        texture: texture
      });
    } catch (error) {
      onError('Failed to capture face');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="face-capture-container">
      {!isModelLoaded && <div className="loading">Loading face detection models...</div>}
      
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={640}
          height={480}
          className="camera-feed"
          onLoadedMetadata={(e) => {
            if (canvasRef.current) {
              canvasRef.current.width = e.currentTarget.videoWidth;
              canvasRef.current.height = e.currentTarget.videoHeight;
            }
          }}
        />
        <canvas ref={canvasRef} className="landmark-overlay" />
        
        <div className="capture-guide">
          <div className={`guide-oval ${isFaceDetected ? 'detected' : ''}`} />
          <p className="guide-text">
            {isFaceDetected 
              ? 'Face detected - Click capture when ready'
              : 'Position your face within the oval'}
          </p>
        </div>
      </div>

      <button
        className="capture-button"
        onClick={handleCapture}
        disabled={!isModelLoaded || isCapturing || !isFaceDetected}
      >
        {isCapturing ? 'Capturing...' : 'Capture Face'}
      </button>
    </div>
  );
}