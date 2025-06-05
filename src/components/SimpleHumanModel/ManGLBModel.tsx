import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { easing } from 'maath';

interface ManGLBModelProps {
  color: string;
}

export function ManGLBModel({ color }: ManGLBModelProps) {
  const { nodes } = useGLTF('/TexWeb/shirt_baked_collapsed.glb') as any;

  useFrame((_, delta) => {
    if (nodes.T_Shirt_male && nodes.T_Shirt_male.material) {
      easing.dampC(nodes.T_Shirt_male.material.color, color, 0.25, delta);
    }
  });

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={nodes.T_Shirt_male.material}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={1}
      dispose={null}
    />
  );
}
