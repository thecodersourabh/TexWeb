import { Text } from '@react-three/drei';

interface ModelLoadingOverlayProps {
  progress: number;
}

export function ModelLoadingOverlay({ progress }: ModelLoadingOverlayProps) {
  return (
    <>
      <mesh>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial color="black" transparent opacity={0.5} />
      </mesh>
      <group position={[0, 0, 0.1]}>
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Loading Model
        </Text>
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${Math.round(progress * 100)}%`}
        </Text>
      </group>
    </>
  );
}
