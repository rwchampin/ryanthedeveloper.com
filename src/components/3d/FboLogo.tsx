"use client";
import { LOGO_URL } from "@/lib/utils/utils3d";
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
 const count = 100000; 
const Particles = ({ logo }) => {
  const particlesRef = useRef();

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
 
  useMemo(() => {
    const sampler = new MeshSurfaceSampler(logo).build();

    for (let i = 0; i < count; i++) {
      const newPosition = new THREE.Vector3();
      sampler.sample(newPosition);
      positions.set([newPosition.x, newPosition.y, newPosition.z], i * 3);

      // Assign random colors to each particle
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }
  }, [logo, positions, colors]);

  useFrame(({ clock, pointer }) => {
    if (particlesRef.current) {
      // loop over attribute arrays and lerp values to new positions
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        const p = new THREE.Vector3(x, y, z);

        // lerp the position
        p.lerp(new THREE.Vector3(x, y, z), 0.1);
        positions[i3] = p.x;
        positions[i3 + 1] = p.y;
        positions[i3 + 2] = p.z;
      }

      // particlesRef.current.geometry.attributes.position.needsUpdate = true;
      // particlesRef.current.material.uniforms.uTime.value = clock.elapsedTime;
      // particlesRef.current.material.uniforms.uMouse.value = pointer;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial 
        uniforms={{
          pointSize: { value: 0.02 },
          color: { value: new THREE.Color('#000000') },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
        }}
        vertexShader={`
          uniform float pointSize;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
            gl_PointSize = pointSize * (1.0 / - modelViewPosition.z);
            vColor = color;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying vec3 vColor;
          void main() {
            vec2 uv = gl_PointCoord.xy - 0.5;
            float aspect = 1.0;
            uv.x *= aspect;
            float dist = length(uv);
            float alpha = smoothstep(0.5, 0.48, dist);
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
};


export const FboLogo = () => {
  const { nodes } = useGLTF(LOGO_URL);
  const logo = nodes.Scene.children[0];

  return (
    <>
      <ambientLight />
       
      <Particles logo={logo} />/
    </>
  );
};
useGLTF.preload(LOGO_URL);