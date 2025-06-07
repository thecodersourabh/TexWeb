import { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Loader } from 'lucide-react';
import { CameraAnalyzer } from '../../utils/CameraAnalyzer';

interface CapturePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (glbUrl: string) => void;
  isLoading?: boolean;
}

export function CapturePreviewModal({
  isOpen,
  onClose,
  onCapture
}: CapturePreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<CameraAnalyzer | null>(null);
  const [hasValidPose, setHasValidPose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [modelLoadingStatus, setModelLoadingStatus] = useState<string>('Loading face detection models...');
  const [loadingStage, setLoadingStage] = useState<'models' | 'camera' | 'ready' | 'error'>('models');

  useEffect(() => {
    if (isOpen && videoRef.current && canvasRef.current) {
      const initCamera = async () => {
        setIsInitializing(true);
        setError(null);
        setLoadingStage('models');
        
        try {
          console.log('Initializing camera...');
          analyzerRef.current = CameraAnalyzer.getInstance();
          
          // Set a callback to get model loading status
          (window as any).updateModelLoadingStatus = (status: string) => {
            console.log('Model loading status:', status);
            setModelLoadingStatus(status);
          };
          
          analyzerRef.current.setDebugCanvas(canvasRef.current);
          
          // First try to load models
          try {
            setLoadingStage('models');
            setModelLoadingStatus('Loading face detection models...');
            await analyzerRef.current.initializeCamera(videoRef.current!);
            console.log('Camera initialized, starting analysis...');
            setLoadingStage('camera');
            setModelLoadingStatus('Camera initialized, starting face detection...');
            
            analyzerRef.current.startAnalysis((validPose) => {
              setHasValidPose(validPose);
              if (validPose && loadingStage !== 'ready') {
                setLoadingStage('ready');
              }
            });
            
            console.log('Analysis started');
          } catch (modelError: any) {
            console.error('Failed to initialize face models:', modelError);
            setError(`Failed to load face detection models: ${modelError?.message || 'Unknown error'}. 
              Try reloading the page or using a different browser.`);
            setLoadingStage('error');
            // Don't close immediately to allow user to see error
            setTimeout(onClose, 5000);
            return;
          }
        } catch (error: any) {
          console.error('Failed to initialize camera:', error);
          setError(error?.message || 'Failed to access camera. Please ensure camera permissions are granted.');
          setLoadingStage('error');
          // Don't close immediately to allow user to see error
          setTimeout(onClose, 5000);
        } finally {
          setIsInitializing(false);
        }
      };

      initCamera();

      return () => {
        // Clean up the global callback
        (window as any).updateModelLoadingStatus = undefined;
        
        if (analyzerRef.current) {
          analyzerRef.current.cleanup();
          analyzerRef.current = null;
        }
      };
    }
  }, [isOpen, onClose]);

  const handleCapture = async () => {
    if (!analyzerRef.current || !hasValidPose) return;

    setError(null);
    setIsProcessing(true);
    
    try {
      console.log('Starting capture process...');
      const glbUrl = await analyzerRef.current.captureAndCreateGLB();
      
      if (glbUrl) {
        console.log('Capture successful, GLB URL length:', glbUrl.length);
        onCapture(glbUrl);
        onClose();
      } else {
        throw new Error('Failed to create GLB - no URL returned');
      }
    } catch (err) {
      console.error('Capture failed:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="relative aspect-video">
          {/* Loading overlays */}
          {(isProcessing || isInitializing) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-white text-center p-4 max-w-md">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                {isProcessing ? (
                  <p className="text-lg font-medium">Processing capture...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      {loadingStage === 'models' ? 'Loading face detection models...' :
                       loadingStage === 'camera' ? 'Initializing camera...' :
                       'Starting face detection...'}
                    </p>
                    <p className="text-sm opacity-80">{modelLoadingStatus}</p>
                    {loadingStage === 'models' && (
                      <p className="text-xs mt-4 opacity-70">
                        This may take a moment on first load. If it takes too long, try refreshing the page.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Hidden video element for camera input */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          
          {/* Debug canvas showing face detection */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Guide overlay for face positioning */}
          {!isInitializing && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-1/2 h-1/2 border-2 rounded-lg ${hasValidPose ? 'border-green-500' : 'border-yellow-500'} transition-colors`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg font-medium text-white text-center bg-black/50 px-4 py-2 rounded-lg">
                    {hasValidPose ? 'Perfect! Click capture.' : 'Position your face in the frame'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>        {error && (
          <div className="p-4 bg-red-50 border-t border-red-100">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-red-700 font-medium mb-1">Error</h4>
                <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
                {error.includes('models') && (
                  <div className="mt-2 text-xs text-red-500">
                    <p>Possible solutions:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Try refreshing the page</li>
                      <li>Try using a different browser (Chrome or Edge recommended)</li>
                      <li>Check your internet connection</li>
                      <li>Temporarily disable any content blockers</li>
                    </ul>
                  </div>
                )}
                {error.includes('camera') && (
                  <div className="mt-2 text-xs text-red-500">
                    <p>Possible solutions:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Make sure your camera is connected and working</li>
                      <li>Allow camera permissions in your browser</li>
                      <li>Close other apps that might be using your camera</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleCapture}
            disabled={!hasValidPose || isProcessing || isInitializing}
            className={`
              w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2
              ${hasValidPose && !isProcessing && !isInitializing
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
              transition-colors
            `}
          >
            <Camera className="w-5 h-5" />
            <span>
              {isInitializing ? 'Initializing...' : 
               isProcessing ? 'Processing...' : 
               'Capture'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
