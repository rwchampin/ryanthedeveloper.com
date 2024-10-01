// "use client";
// import React, { useRef, useEffect, useCallback, useState } from 'react';
// import { Canvas, useFrame, useThree } from '@react-three/fiber';
// import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
// import { useSpring, a } from '@react-spring/three';
// import { createNoise3D } from 'simplex-noise';

// const simplex3 = createNoise3D();
// const Cube = ({ position, color }) => {
//   const meshRef = useRef<any>(null);
//   const [active, setActive] = useState(false);

//   const { scale } = useSpring({
//     scale: active ? [0.1, 0.1, 0.1] : [1, 1, 1],
//     // config: { duration: 2000, loop: true }
//   });

//   useFrame(() => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x += 0.01;
//       meshRef.current.rotation.y += 0.01;
//     }
//   });

//   useEffect(() => {
//     setActive(true);
//   }, []);

//   return (
//     <a.mesh ref={meshRef} position={position}>
//       <boxGeometry args={[10, 10, 10]} />
//       <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.5} shininess={50} />
//     </a.mesh>
//   );
// };

// const CubeGroup = () => {
//   const groupRef = useRef();
//   const [cubes, setCubes] = useState([]);
//   const [bgColor, setBgColor] = useState('#000000');

//   const createColor = useCallback((x, y, z) => {
//     const scaleFactor = 0.08;
//     const l = Math.round(Math.abs(simplex3(x * scaleFactor, y * scaleFactor, z * scaleFactor)) * 100);
//     return `hsl(${bgColor},50%,${l}%)`;
//   }, [bgColor]);

//   const createScene = useCallback(() => {
//     const newColor = Math.floor(Math.random() * 180) + 180;
//     setBgColor(`hsl(${newColor},50%,50%)`);
    
//     const newCubes = [];
//     const size = 10;
//     for (let x = -size * 0.5; x < size * 0.5; x++) {
//       for (let y = -size * 0.5; y < size * 0.5; y++) {
//         for (let z = -size * 0.5; z < size * 0.5; z++) {
//           newCubes.push({
//             position: [x * 15, y * 15, z * 15],
//             color: createColor(x, y, z)
//           });
//         }
//       }
//     }
//     setCubes(newCubes);
//   }, [createColor]);

//   useEffect(() => {
//     createScene();
//   }, [createScene]);

//   const updateScene = useCallback(() => {
//     // Animation logic for updating the scene
//     // This would involve manipulating the groupRef
//     // and potentially re-creating the cubes
//   }, []);

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = -state.clock.elapsedTime * 0.0002;
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       {cubes.map((cube, index) => (
//         <Cube key={index} position={cube.position} color={cube.color} />
//       ))}
//     </group>
//   );
// };

// const Scene = () => {
//   const { size } = useThree();

//   return (
//     <>
//       <PerspectiveCamera makeDefault position={[0, 200, 300]} />
//       <OrbitControls />
//       <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
//       <CubeGroup />
//     </>
//   );
// };

// const Page = () => {
//   return (
//     <Canvas>
//       <Scene />
//     </Canvas>
//   );
// };

// export default Page;

export default function Page() {
  return (
    <div>
      <h1>Under Construction</h1>
      <p>This page is under construction.</p>
    </div>
  );
}