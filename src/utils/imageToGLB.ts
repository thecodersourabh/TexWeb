import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export class ImageToGLBConverter {  
  static isValidImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private static async createMaterialFromImage(imageFile: File): Promise<{
    material: THREE.MeshStandardMaterial;
    aspectRatio: number;
  }> {
    const imageUrl = URL.createObjectURL(imageFile);
    
    try {
      // First, load the image to get dimensions
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
      });

      const aspectRatio = img.width / img.height;

      // Create texture with proper settings
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        new THREE.TextureLoader().load(
          imageUrl,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.encoding = THREE.sRGBEncoding;
            texture.needsUpdate = true;

            // Generate mipmaps for better quality
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            resolve(texture);
          },
          undefined,
          reject
        );
      });

      // Create an optimized material
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.5,
        metalness: 0.0,
        side: THREE.DoubleSide,
        envMapIntensity: 1.0,
        color: 0xffffff,
      });

      return { material, aspectRatio };
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  static async convertImageToTexture(imageFile: File): Promise<string | null> {
    try {
      const { material, aspectRatio } = await this.createMaterialFromImage(imageFile);
      
      // Create a plane geometry that matches the image aspect ratio
      const geometry = new THREE.PlaneGeometry(aspectRatio, 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'ImagePlane';

      // Set up scene with proper lighting
      const scene = new THREE.Scene();
      
      // Add ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light for better material rendering
      const mainLight = new THREE.DirectionalLight(0xffffff, 1);
      mainLight.position.set(5, 5, 5);
      mainLight.castShadow = true;
      scene.add(mainLight);

      scene.add(mesh);

      // Export with optimized settings
      const exporter = new GLTFExporter();
      const glbBlob = await new Promise<Blob>((resolve, reject) => {
        exporter.parse(
          scene,
          (gltf: ArrayBuffer | object) => {
            if (gltf instanceof ArrayBuffer) {
              resolve(new Blob([gltf], { type: 'model/gltf-binary' }));
            } else {
              reject(new Error('Failed to export GLB'));
            }
          },
          (error) => reject(error),
          {
            binary: true,
            includeCustomExtensions: true,
            embedImages: true
          }
        );
      });

      // Convert blob to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(glbBlob);
      });

    } catch (error) {
      console.error('Error converting image to GLB:', error);
      return null;
    }
  }
}
