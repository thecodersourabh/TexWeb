import * as THREE from 'three';

interface Face3DGeneratorOptions {
  resolution?: number;
}

interface FaceData {
  landmarks: Array<[number, number, number]>;
  texture: string;
}

export class Face3DGenerator {
  private resolution: number;

  constructor(options: Face3DGeneratorOptions = {}) {
    this.resolution = options.resolution || 128;
  }

  public async generateModel({ landmarks }: FaceData): Promise<THREE.BufferGeometry> {
    // Create a geometry for the face
    const geometry = new THREE.BufferGeometry();
    
    // Convert landmarks array to vertices
    const { vertices, indices, uvs } = this.processLandmarks(landmarks);

    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Compute vertex normals for proper lighting
    geometry.computeVertexNormals();

    return geometry;
  }

  private processLandmarks(landmarks: Array<[number, number, number]>): { 
    vertices: number[]; 
    indices: number[]; 
    uvs: number[];
  } {
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    // Process face mesh points
    landmarks.forEach((point) => {
      vertices.push(
        (point[0] - 0.5) * 2, // x: convert from [0,1] to [-1,1]
        -(point[1] - 0.5) * 2, // y: convert from [0,1] to [-1,1] and flip
        -point[2] * 3 // z: scale depth for better visualization and invert
      );

      // Generate UV coordinates from normalized positions
      uvs.push(
        point[0], // u
        1 - point[1] // v (flip y)
      );
    });

    // Generate triangles using simple triangulation
    // This assumes the landmarks are arranged in a grid-like pattern
    const width = Math.sqrt(landmarks.length);
    for (let i = 0; i < width - 1; i++) {
      for (let j = 0; j < width - 1; j++) {
        const index = i * width + j;
        // First triangle
        indices.push(
          index,
          index + 1,
          index + width
        );
        // Second triangle
        indices.push(
          index + 1,
          index + width + 1,
          index + width
        );
      }
    }

    return { vertices, indices, uvs };
  }

  public async createTexture(imageData: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = true;
        resolve(texture);
      };
      image.onerror = reject;
      image.src = imageData;
    });
  }
}