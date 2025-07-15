import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { useRef } from 'react';

interface CameraRigProps {
  children: React.ReactNode;
}

export function CameraRig({ children }: CameraRigProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const group = useRef<any>(null);

  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta);
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 5, 0], 0.25, delta);
  });

  return <group ref={group}>{children}</group>;
}
