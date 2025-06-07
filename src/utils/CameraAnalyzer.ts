import * as THREE from 'three';
import * as faceapi from '@vladmandic/face-api';
import { createGLBFromTexture } from './GLBExporter';

interface AnalysisResult {
  imageData: ImageData;
  aspectRatio: number;
  hasValidPose: boolean;
  faceDetection?: faceapi.FaceDetection;
  faceLandmarks?: { x: number; y: number; z: number }[];
}

export class CameraAnalyzer {
  private static instance: CameraAnalyzer;
  private videoElement: HTMLVideoElement | null = null;
  private analysisCanvas: HTMLCanvasElement;
  private analysisContext: CanvasRenderingContext2D;
  private debugCanvas: HTMLCanvasElement | null = null;
  private debugContext: CanvasRenderingContext2D | null = null;
  private isAnalyzing: boolean = false;
  private lastAnalysis: AnalysisResult | null = null;
  private onFrameAnalyzed: ((hasValidPose: boolean) => void) | null = null;
  private modelsLoaded: boolean = false;

  private constructor() {
    this.analysisCanvas = document.createElement('canvas');
    const context = this.analysisCanvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.analysisContext = context;
  }
  static getInstance(): CameraAnalyzer {
    if (!CameraAnalyzer.instance) {
      CameraAnalyzer.instance = new CameraAnalyzer();
    }
    return CameraAnalyzer.instance;
  }  private async loadFaceDetectionModels() {
    if (this.modelsLoaded) {
      console.log('Models already loaded, skipping');
      return;
    }

    console.log('Starting face detection model loading...');
    
    try {
      // Reset tensorflow engine to prevent memory issues
      try {
        console.log('Attempting to reset TensorFlow engine...');
        if (faceapi.tf && typeof (faceapi.tf as any).engine === 'function') {
          const engine = (faceapi.tf as any).engine();
          if (engine && typeof engine.reset === 'function') {
            engine.reset();
            console.log('TensorFlow engine reset successful');
          }
        }
        
        // Try to set backend to webgl for better performance
        if (faceapi.tf && 'setBackend' in faceapi.tf && typeof (faceapi.tf as any).setBackend === 'function') {
          await (faceapi.tf as any).setBackend('webgl');
          console.log('Set TensorFlow backend to WebGL');
        }
      } catch (err) {
        console.warn('Could not reset TensorFlow engine:', err);
      }      // Try multiple model sources - put CDN paths first for reliability
      const possiblePaths = [
        // Try the CDN with specific version first (most reliable)
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model',
        // Try unpkg CDN next
        'https://unpkg.com/@vladmandic/face-api@1.7.15/model',
        // Try direct vladmandic GitHub URLs
        'https://vladmandic.github.io/face-api/model',
        // Local paths (fallback)
        '/models',
        '/TexWeb/models'
      ];
      
      // Function to update loading status
      const updateStatus = (status: string) => {
        console.log(status);
        // Use the global callback if available
        if (window && typeof (window as any).updateModelLoadingStatus === 'function') {
          (window as any).updateModelLoadingStatus(status);
        }
      };
        // Function to load a model with timeout
      const loadModelWithTimeout = async (model: any, name: string, path: string, timeoutMs = 20000) => {
        return new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.error(`Timeout: Loading ${name} from ${path} timed out after ${timeoutMs / 1000} seconds`);
            reject(new Error(`Loading ${name} from ${path} timed out after ${timeoutMs / 1000} seconds`));
          }, timeoutMs);
          
          try {
            console.log(`Starting to load ${name} from ${path}...`);
            updateStatus(`Loading ${name} from ${path}...`);
            
            model.loadFromUri(path)
              .then(() => {
                console.log(`SUCCESS: ${name} loaded successfully from ${path}`);
                updateStatus(`${name} loaded successfully from ${path}`);
                clearTimeout(timeoutId);
                resolve();
              })
              .catch((error: any) => {
                console.error(`ERROR: Failed to load ${name} from ${path}:`, error);
                clearTimeout(timeoutId);
                reject(error);
              });
          } catch (error) {
            console.error(`EXCEPTION: Error loading ${name} from ${path}:`, error);
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      };
        // Try each path until one succeeds
      let lastError = null;
      for (const path of possiblePaths) {
        console.log(`Attempting to load models from: ${path}`);
        try {
          // First try to load TinyFaceDetector
          await loadModelWithTimeout(faceapi.nets.tinyFaceDetector, 'TinyFaceDetector', path);
          
          // Load landmark detection
          await loadModelWithTimeout(faceapi.nets.faceLandmark68Net, 'FaceLandmark68', path);
          
          // Load face recognition net
          await loadModelWithTimeout(faceapi.nets.faceRecognitionNet, 'FaceRecognition', path);
          
          // If we reach here, both models loaded successfully
          console.log(`All face detection models loaded successfully from ${path}`);
          this.modelsLoaded = true;
          return; // Exit the function early on success
        } catch (error: any) {
          console.warn(`Failed to load models from ${path}:`, error);
          lastError = error;
          // Continue to try the next path
        }
      }
      
      // If we get here, all paths failed
      console.error('Failed to load models from all paths:', lastError);
      const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
      throw new Error(`Failed to load face detection models from all paths: ${errorMessage || 'Unknown error'}`);
      
    } catch (error: any) {
      console.error('Error during model loading:', error);
      throw new Error('Failed to load face detection models. Please ensure model files are correctly installed.');
    }
  }

  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;
    await this.loadFaceDetectionModels();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      this.videoElement.srcObject = stream;
      await new Promise<void>((resolve) => {
        if (this.videoElement) {
          this.videoElement.onloadedmetadata = () => {
            if (this.videoElement) {
              this.videoElement.play();
              this.analysisCanvas.width = this.videoElement.videoWidth;
              this.analysisCanvas.height = this.videoElement.videoHeight;
              if (this.debugCanvas) {
                this.debugCanvas.width = this.videoElement.videoWidth;
                this.debugCanvas.height = this.videoElement.videoHeight;
              }
            }
            resolve();
          };
        }
      });
    } catch (error) {
      console.error('Error initializing camera:', error);
      throw error;
    }
  }

  setDebugCanvas(canvas: HTMLCanvasElement | null): void {
    this.debugCanvas = canvas;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get debug canvas 2D context');
      }
      this.debugContext = context;
      if (this.videoElement) {
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
      }
    } else {
      this.debugContext = null;
    }
  }

  startAnalysis(onFrameAnalyzed?: (hasValidPose: boolean) => void): void {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.onFrameAnalyzed = onFrameAnalyzed || null;
    requestAnimationFrame(() => this.analyze());
  }

  stopAnalysis(): void {
    this.isAnalyzing = false;
    this.onFrameAnalyzed = null;
  }
  private validateFacePosition(detection: faceapi.FaceDetection): boolean {
    if (!detection || !this.analysisCanvas) return false;

    const { box } = detection;
    const canvasWidth = this.analysisCanvas.width;
    const canvasHeight = this.analysisCanvas.height;

    // Check if face is roughly centered (within middle 50% of frame)
    const centerXRange = { min: canvasWidth * 0.25, max: canvasWidth * 0.75 };
    const centerYRange = { min: canvasHeight * 0.25, max: canvasHeight * 0.75 };
    
    const faceCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };

    // Check size (face should be at least 20% of frame height)
    const minFaceSize = canvasHeight * 0.2;
    const isFaceBigEnough = box.height >= minFaceSize;

    // Check position
    const isCentered = 
      faceCenter.x >= centerXRange.min && 
      faceCenter.x <= centerXRange.max &&
      faceCenter.y >= centerYRange.min && 
      faceCenter.y <= centerYRange.max;

    // Log validation details
    if (!isFaceBigEnough) {
      console.log(`Face too small: ${box.height.toFixed(0)}px, minimum required: ${minFaceSize.toFixed(0)}px`);
    }
    
    if (!isCentered) {
      console.log(`Face not centered: position (${faceCenter.x.toFixed(0)}, ${faceCenter.y.toFixed(0)}), 
        valid X range: ${centerXRange.min.toFixed(0)}-${centerXRange.max.toFixed(0)}, 
        valid Y range: ${centerYRange.min.toFixed(0)}-${centerYRange.max.toFixed(0)}`);
    }

    return isFaceBigEnough && isCentered;
  }private async detectFace(canvas: HTMLCanvasElement): Promise<faceapi.FaceDetection | null> {
    try {
      console.log('Starting face detection process...');
      
      // Try with landmarks first (preferred approach)
      try {
        console.log('Attempting face detection with TinyFaceDetector...');
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        });
        
      console.log('Detector options:', JSON.stringify(options));
      
    const detectionWithLandmarks = await faceapi
        .detectSingleFace(canvas, options)
        .withFaceLandmarks() // Get landmarks first
        .withFaceDescriptor(); // Then get descriptor for better face analysis

      console.log('Detection result:', detectionWithLandmarks ? 'Found face' : 'No face found');
      
      if (detectionWithLandmarks) {
        console.log('Face landmarks found:', detectionWithLandmarks.landmarks.positions.length);
      
        const detection = detectionWithLandmarks?.detection;
        if (detection) {
          console.log('Face detected with score:', detection.score, 'at position:', JSON.stringify(detection.box));
          
          // Validate face position and size
          const isValid = this.validateFacePosition(detection);
          console.log('Face position valid:', isValid);
          
          if (isValid) {
            return detection;
          } else {
            console.log('Face detected but position is invalid');
            return null;
          }
        }
      }
    } // <-- Add this closing brace to end the try block
    catch (landmarkError) {
      console.warn('Face landmark detection failed:', landmarkError);
      // Continue to fallback method
    }
      
      // Fallback: Try without landmarks
      console.log('Falling back to basic face detection...');
      const basicDetection = await faceapi.detectSingleFace(
        canvas, 
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320, // Smaller input size for better performance
          scoreThreshold: 0.4 // Slightly lower threshold
        })
      );
      
      if (basicDetection) {
        console.log('Face detected with basic detection');
        
        // Validate face position and size
        if (this.validateFacePosition(basicDetection)) {
          return basicDetection;
        } else {
          console.log('Face detected but position is invalid');
          return null;
        }
      }
      
      console.log('No face detected');
      return null;
    } catch (error) {
      console.error('Error in face detection pipeline:', error);
      return null;
    }
  }

  private async analyze(): Promise<void> {
    if (!this.isAnalyzing || !this.videoElement) return;

    try {
      // Draw current video frame to analysis canvas
      this.analysisContext.drawImage(
        this.videoElement,
        0,
        0,
        this.analysisCanvas.width,
        this.analysisCanvas.height
      );

      // Detect face in the frame
      const faceDetection = await this.detectFace(this.analysisCanvas);
      const hasValidPose = !!faceDetection;      // Get image data and store face landmarks
      const imageData = this.analysisContext.getImageData(
        0,
        0,
        this.analysisCanvas.width,
        this.analysisCanvas.height
      );

      const faceLandmarks = await this.getFaceLandmarks(this.analysisCanvas);
      if (faceLandmarks) {
        (window as any).lastFaceLandmarks = faceLandmarks;
      }

      this.lastAnalysis = {
        imageData,
        aspectRatio: this.analysisCanvas.width / this.analysisCanvas.height,
        hasValidPose,
        faceDetection: faceDetection ?? undefined,
        faceLandmarks: faceLandmarks ?? undefined
      };

      // Draw debug visualization
      this.drawDebugView();

      // Notify callback
      if (this.onFrameAnalyzed) {
        this.onFrameAnalyzed(hasValidPose);
      }
    } catch (error) {
      console.error('Error in analysis:', error);
    }

    // Continue analysis loop
    requestAnimationFrame(() => this.analyze());
  }

  private drawDebugView(): void {
    if (!this.debugContext || !this.lastAnalysis) return;

    // Clear previous frame
    this.debugContext.clearRect(0, 0, this.debugCanvas!.width, this.debugCanvas!.height);

    // Draw the current frame
    this.debugContext.drawImage(this.analysisCanvas, 0, 0);

    // Draw face detection box if available
    if (this.lastAnalysis.faceDetection) {
      const { box } = this.lastAnalysis.faceDetection;
      this.debugContext.strokeStyle = '#00ff00';
      this.debugContext.lineWidth = 2;
      this.debugContext.strokeRect(box.x, box.y, box.width, box.height);

      // Draw status text
      this.debugContext.fillStyle = '#00ff00';
      this.debugContext.font = '20px Arial';
      this.debugContext.fillText('Face Detected', 10, 30);
    } else {
      // Draw status text when no face is detected
      this.debugContext.fillStyle = '#ff0000';
      this.debugContext.font = '20px Arial';
      this.debugContext.fillText('No Face Detected', 10, 30);
    }  }  async captureAndCreateGLB(): Promise<string | null> {
    if (!this.lastAnalysis || !this.lastAnalysis.hasValidPose) {
      console.warn('No valid pose detected for capture');
      return null;
    }

    try {
      console.log('Starting GLB creation...');
      
      // Create texture from the last analyzed frame
      const blob = await new Promise<Blob>((resolve) => {
        this.analysisCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      console.log('Created image blob:', blob.size, 'bytes');

      const imageUrl = URL.createObjectURL(blob);
      let texture: THREE.Texture | null = null;
      
      try {
        texture = await this.createTextureFromUrl(imageUrl);
        console.log('Texture created successfully');
        
        // Use our new GLBExporter utility
        const dataUrl = await createGLBFromTexture(
          texture,
          this.lastAnalysis.aspectRatio
        );

        console.log('GLB processing complete');
        return dataUrl;

      } finally {
        // Clean up resources
        URL.revokeObjectURL(imageUrl);
        if (texture) {
          texture.dispose();
        }
      }

    } catch (error: any) {
      console.error('Error creating GLB from camera:', error);
      throw error;
    }
  }private async createTextureFromUrl(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      
      // Set cross-origin to anonymous to avoid CORS issues
      textureLoader.setCrossOrigin('anonymous');
      
      // Add a timeout to avoid hanging if the texture fails to load
      const timeoutId = setTimeout(() => {
        reject(new Error('Texture loading timed out after 10 seconds'));
      }, 10000);
      
      textureLoader.load(
        url,
        (texture) => {
          clearTimeout(timeoutId);
          
          // Set texture properties for optimal display
          texture.colorSpace = THREE.SRGBColorSpace;
          // Handle compatibility with older Three.js versions
          if ('encoding' in texture) {
            texture.encoding = THREE.sRGBEncoding;
          }
          
          // Set additional texture properties
          texture.needsUpdate = true;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          
          console.log('Texture loaded successfully with dimensions:', 
            texture.image.width, 'x', texture.image.height);
          
          resolve(texture);
        },
        // Progress callback
        (progress) => {
          console.log(`Texture loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        },
        // Error callback
        (error) => {
          clearTimeout(timeoutId);
          console.error('Error loading texture:', error);
          reject(error);
        }
      );
    });
  }

  private async getFaceLandmarks(canvas: HTMLCanvasElement): Promise<{ x: number; y: number; z: number }[] | null> {
    try {
      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        return null;
      }

      // Get landmarks and convert to 3D points
      const landmarks = detection.landmarks.positions;
      const points = landmarks.map(point => {
        // Estimate Z based on face analysis (you can make this more sophisticated)
        const zOffset = this.estimateDepthFromLandmark(point, detection.landmarks);
        return {
          x: point.x,
          y: point.y,
          z: zOffset
        };
      });

      return points;
    } catch (error) {
      console.error('Error getting face landmarks:', error);
      return null;
    }
  }

  private estimateDepthFromLandmark(point: { x: number, y: number }, landmarks: faceapi.FaceLandmarks68): number {
    // This is a simple depth estimation. You can make it more sophisticated.
    // For now, we'll create a simple bulge effect for the nose and cheeks
    
    const nose = landmarks.getNose();
    const noseBase = nose[3]; // Tip of nose
    
    // Calculate distance from nose
    const dx = point.x - noseBase.x;
    const dy = point.y - noseBase.y;
    const distanceFromNose = Math.sqrt(dx * dx + dy * dy);
    
    // Create a bulge effect
    const maxDepth = 0.2; // Maximum depth offset
    const bulgeRadius = 100; // Size of the bulge effect
    const depth = maxDepth * Math.exp(-(distanceFromNose * distanceFromNose) / (2 * bulgeRadius * bulgeRadius));
    
    return depth;
  }

  cleanup(): void {
    this.stopAnalysis();
    if (this.videoElement?.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    this.videoElement = null;
    this.debugCanvas = null;
    this.debugContext = null;
    this.lastAnalysis = null;
  }
}
