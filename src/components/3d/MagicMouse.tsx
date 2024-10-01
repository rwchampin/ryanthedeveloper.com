import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMouseStore } from '@/@/stores/useMouseStore';

import { useSpring, a } from '@react-spring/three';

export function MouseFollower() {
  const ref = useRef();
  const { position } = useMouseStore();

  const { springPosition } = useSpring({
    springPosition: position,
    config: { tension: 280, friction: 60 }, // Customize easing settings here
  });

  useFrame(() => {
    ref.current.position.copy(springPosition.get());
  });

  return (
    <a.mesh ref={ref} position={springPosition}>
      <icosahedronGeometry args={[0.1, 5]} />
      <meshBasicMaterial color="yellow" />
    </a.mesh>
  );
}   // export function MouseFollower() {