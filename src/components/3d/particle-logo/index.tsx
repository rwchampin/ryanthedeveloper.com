"use client";
import React, { useEffect,useMemo, useState } from 'react';

import * as THREE from 'three';
import { useRef,  } from 'react';
import { useFrame } from '@react-three/fiber';


export const Particle = ({ position, velocity, onClick, hovered }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      // Update particle position based on velocity
      meshRef.current.position.add(velocity);
      
      // Handle visual effects on hover or click
      if (hovered) {
        meshRef.current.scale.set(1.2, 1.2, 1.2);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      scale={[1, 1, 1]}
    >
      <boxGeometry args={[0.005, 0.007, 0.005]} />
      <meshStandardMaterial color={hovered ? 'red' : 'blue'} />
    </mesh>
  );
};

export const ParticleLogo = () => {
  const SIZE = 1024;
  const [particles, setParticles] = useState(() => {
    const tempParticles = [];
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        tempParticles.push({
          id: i * SIZE + j,
          position: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
          velocity: new THREE.Vector3(Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01),
        });
      }
    }
    return tempParticles;
  });

  const handleClick = (id) => {
    console.log(`Particle ${id} clicked`);
  };

  return (
    <>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          position={particle.position}
          velocity={particle.velocity}
          onClick={() => handleClick(particle.id)}
        />
      ))}
    </>
  );
};
