import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export async function createGLBFromTexture(
  texture: THREE.Texture, 
  aspectRatio: number
): Promise<string> {
  console.log('Creating GLB from texture...');
  
  // Create a standard material that works well with GLB export
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Ensure texture settings are correct
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  // Create detailed face geometry using face landmark points
  const geometryWidth = aspectRatio;
  const geometryHeight = 1;
  let geometry: THREE.BufferGeometry;
  
  // Get face landmark points if available
  const landmarks = (window as any).lastFaceLandmarks;
  if (landmarks && Array.isArray(landmarks)) {
    console.log('Creating 3D face mesh from', landmarks.length, 'landmarks');
    
    // Convert 2D landmarks to 3D vertices
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    
    // Create vertices from landmarks with depth
    for (const point of landmarks) {
      // Calculate depth based on facial features
      const distFromCenter = Math.sqrt(
        Math.pow((point.x / texture.image.width - 0.5), 2) +
        Math.pow((point.y / texture.image.height - 0.5), 2)
      );
      
      // Create a bulge effect - more pronounced in the center
      const depth = 0.2 * Math.exp(-distFromCenter * 5) + point.z;
      
      vertices.push(
        (point.x / texture.image.width - 0.5) * geometryWidth,
        -(point.y / texture.image.height - 0.5) * geometryHeight,
        depth
      );
      
      // Add UV coordinates with better facial feature mapping
      uvs.push(
        point.x / texture.image.width,
        1 - (point.y / texture.image.height)
      );
    }
    
    // Create triangles using Delaunay triangulation patterns for face
    // These indices are based on the standard 68-point face landmarks
    // Jaw section
    for (let i = 0; i < 16; i++) {
      indices.push(i, i + 1, 36);
    }
    // Right eye
    indices.push(36, 37, 41);
    indices.push(37, 38, 41);
    indices.push(38, 39, 41);
    indices.push(39, 40, 41);
    // Left eye
    indices.push(42, 43, 47);
    indices.push(43, 44, 47);
    indices.push(44, 45, 47);
    indices.push(45, 46, 47);
    // Nose bridge
    indices.push(27, 28, 29);
    indices.push(28, 29, 30);
    indices.push(29, 30, 31);
    indices.push(30, 31, 32);
    indices.push(31, 32, 33);
    // Nose tip
    indices.push(31, 33, 34);
    indices.push(33, 34, 35);
    // Mouth
    for (let i = 48; i < 59; i++) {
      indices.push(i, i + 1, 66);
    }
    indices.push(59, 48, 66);
    for (let i = 60; i < 67; i++) {
      indices.push(i, i + 1, 66);
    }
    indices.push(67, 60, 66);
    
    // Create geometry with attributes
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
  } else {
    console.warn('No face landmarks available, falling back to simple plane geometry');
    // Fallback to simple plane if no landmarks
    geometry = new THREE.PlaneGeometry(geometryWidth, geometryHeight);
  }
  
  // Compute normals and smooth them
  geometry.computeVertexNormals();
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'CapturedFace';
  mesh.rotation.y = Math.PI; // Rotate to face forward
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // Smooth the normals at shared vertices
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const positionArray = positions.array as Float32Array;
  const normalArray = normals.array as Float32Array;
  const vertexMap = new Map<string, number[]>();
  
  // Group vertices that share the same position
  for (let i = 0; i < positions.count; i++) {
    const key = [
      Math.round(positionArray[i * 3] * 1000) / 1000,
      Math.round(positionArray[i * 3 + 1] * 1000) / 1000,
      Math.round(positionArray[i * 3 + 2] * 1000) / 1000
    ].join(',');
    
    const indices = vertexMap.get(key) || [];
    indices.push(i);
    vertexMap.set(key, indices);
  }
  
  // Average normals for shared vertices
  vertexMap.forEach(indices => {
    if (indices.length > 1) {
      const avgNormal = new THREE.Vector3();
      indices.forEach(idx => {
        avgNormal.add(new THREE.Vector3(
          normalArray[idx * 3],
          normalArray[idx * 3 + 1],
          normalArray[idx * 3 + 2]
        ));
      });
      avgNormal.divideScalar(indices.length).normalize();
      
      indices.forEach(idx => {
        normalArray[idx * 3] = avgNormal.x;
        normalArray[idx * 3 + 1] = avgNormal.y;
        normalArray[idx * 3 + 2] = avgNormal.z;
      });
    }
  });
  
  normals.needsUpdate = true;

  // Set up scene
  const scene = new THREE.Scene();
  
  // Add lights for better visualization
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 0, 1);
  dirLight.target.position.set(0, 0, 0);
  scene.add(dirLight.target);
  scene.add(dirLight);

  // Add mesh to scene
  scene.add(mesh);

  // Set up camera
  const camera = new THREE.PerspectiveCamera(45, geometryWidth / geometryHeight, 0.1, 1000);
  camera.position.z = 2;
  scene.add(camera);

  // Export to GLB
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        // Convert ArrayBuffer to Blob
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      },
      (error) => {
        console.error('Error exporting GLB:', error);
        reject(error);
      },
      {
        binary: true,
        includeCustomExtensions: true,
        onlyVisible: true
      }
    );
  });
}
