import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrthographicCamera, useCursor } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { LOGO_URL } from '@/lib/utils/utils3d';

const ExplodeScene = () => {
  const { nodes } = useGLTF(LOGO_URL);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fragmentsRef = useRef();
  const { mouse } = useThree();

  useCursor(hovered);

  useFrame((state) => {
    state.camera.position.lerp(new THREE.Vector3(clicked ? -10 : 0, clicked ? 10 : 0, 20), 0.1);
    state.camera.lookAt(0, 0, 0);
  });

  const fragments = useMemo(() => {
    if (!nodes) return [];
    const geometry = nodes.Scene.children[0].geometry;
    const voxelSize = 0.1;
    const fragments = [];

    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;

    for (let x = min.x; x < max.x; x += voxelSize) {
      for (let y = min.y; y < max.y; y += voxelSize) {
        for (let z = min.z; z < max.z; z += voxelSize) {
          const detail = Math.floor(Math.random() * 3); // Random detail value between 0 and 2
          const fragmentGeometry = new THREE.IcosahedronGeometry(voxelSize, detail);
          const fragmentMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
          const fragment = { geometry: fragmentGeometry, material: fragmentMaterial, position: [x, y, z] };
          fragments.push(fragment);
        }
      }
    }

    return fragments;
  }, [nodes]);

  const handleMouseMove = (event) => {
    if (fragmentsRef.current) {
      fragmentsRef.current.children.forEach((fragment) => {
        const force = new THREE.Vector3((mouse.x - fragment.position.x) * 10, (mouse.y - fragment.position.y) * 10, 0);
        fragment.api.applyForce(force.toArray(), [0, 0, 0]);
      });
    }
  };

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={300} />
      {clicked ? (
        <Physics>
          <Plane />
          <group ref={fragmentsRef} onPointerMove={handleMouseMove}>
            {fragments.map((fragment, index) => (
              <Fragment key={index} {...fragment} />
            ))}
          </group>
        </Physics>
      ) : (
        <primitive
          object={nodes.Scene}
          onClick={() => setClicked(true)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      )}
    </>
  );
};

const Fragment = ({ geometry, material, position }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [geometry.parameters.radius, geometry.parameters.radius, geometry.parameters.radius]
  }));

  return <mesh ref={ref} geometry={geometry} material={material} />;
};

const Plane = () => {
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0]
  }));

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

useGLTF.preload(LOGO_URL);

export const Explode = () => (
  <>
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} intensity={1} />
    <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
    <ExplodeScene modelPath="/path/to/your/model.glb" />
  </>
);

