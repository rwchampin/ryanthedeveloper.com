"use client";
import { useRef } from 'react';
import { useFrame ,
    extend
} from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

const VeronoiMaterial = () => {
  const materialRef = useRef<any>();
  const settings = { wireframe: false };

  useFrame((_, delta) => {
    materialRef.current.uniforms.u_time.value += delta;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={{
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      }}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 vUv;

        float voronoi(vec2 uv) {
          vec2 g = floor(uv);
          vec2 f = fract(uv);
          float res = 8.0;
          for (float y = -1.0; y <= 1.0; y++) {
            for (float x = -1.0; x <= 1.0; x++) {
              vec2 lattice = vec2(x, y);
              vec2 point = vec2(rand(g + lattice), rand(g + lattice + 1.0));
              vec2 diff = lattice + point - f;
              float dist = length(diff);
              res = min(res, dist);
            }
          }
          return res;
        }

        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv * u_resolution.xy / u_resolution.y;
          float noise = voronoi(uv * 10.0 + u_time * 0.1);
          vec3 color = vec3(0.0, 0.5, 1.0) * noise;
          gl_FragColor = vec4(color, 1.0);
        }
      `}
      side={THREE.DoubleSide}
      wireframe={settings.wireframe}
    />
  );
};



export const World = ({
    children
}) => {


    const ref = useRef<any>(null);

    const settings = useControls("World", {
        show: true,
        color: '#ff0000',
        emissive: 'green',
        emissiveIntensity: .5,
        opacity: 1,
        transparent: false,
        side: 'DoubleSide',
        wireframe: false,
        scale: [1, 1, 1],
        position: [0, 0, 0  ],
        rotation: [0, 0, 0],
        receiveShadow: true,
        castShadow: true,
        radius: 50,
        detail: 4
    })

    const lightSettings = useControls("World Light", {
        show: true,
        intensity: 40.5,
        color: '#ffffff',
        castShadow: true,
    })
 
    return (
        <mesh ref={ref}
         position={settings.position}
            scale={settings.scale}
            rotation={settings.rotation}
            receiveShadow={settings.receiveShadow}
            castShadow={settings.castShadow}
            visible={settings.show}
            >
            <icosahedronGeometry args={[settings.radius, settings.detail]} />
           <meshStandardMaterial 
           color={settings.color}
           side={THREE.DoubleSide}
                />
 
       
            <hemisphereLight
            color={0x444444}
    groundColor={'blue'}
    intensity={ 0.5}
                />  
                {children}
        </mesh>
    );
}
 

