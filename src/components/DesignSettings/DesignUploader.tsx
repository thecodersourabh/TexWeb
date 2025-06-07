import { Camera, Upload, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ImageToGLBConverter } from '../../utils/imageToGLB';
import { CapturePreviewModal } from './CapturePreviewModal';

interface DesignUploaderProps {
  onImageSelected: (glbUrl: string) => void;
}

export function DesignUploader({ onImageSelected }: DesignUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && ImageToGLBConverter.isValidImageFile(file)) {
      setIsLoading(true);
      try {
        const glbUrl = await ImageToGLBConverter.convertImageToTexture(file);
        if (glbUrl) {
          onImageSelected(glbUrl);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [onImageSelected]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    if (videoRef.current) {
      setIsLoading(true);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, 'image/jpeg')
          );
          
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            const glbUrl = await ImageToGLBConverter.convertImageToTexture(file);
            if (glbUrl) {
              onImageSelected(glbUrl);
            }
          }
        }
      } finally {
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsLoading(false);
        setIsModalOpen(false);
      }
    }
  }, [onImageSelected]);
  return (
    <>      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {isLoading && (
          <div className="px-3 py-1 bg-white/90 rounded-full text-sm text-gray-700 shadow-lg backdrop-blur-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing image...
          </div>
        )}
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload image"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-700" />
          )}
        </button>

        <button
          onClick={startCamera}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Take photo"
          disabled={isLoading}
        >
          <Camera className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <CapturePreviewModal
        isOpen={isModalOpen}
        onClose={() => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          setIsModalOpen(false);
        }}
        onCapture={takePhoto}
        isLoading={isLoading}
      />

      {/* Hidden video element for size reference */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
      />
    </>
  );
}
