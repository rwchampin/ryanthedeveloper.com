"use client";
import { LOGO_URL } from "@/lib/utils/utils3d"
import { useFBO, useGLTF } from "@react-three/drei";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
const WIDTH = 1024;
const HEIGHT = 1024;

// Load GLB model and filter vertices
function useFilteredPositions(url) {
  const { scene } = useGLTF(LOGO_URL);
  const positions = useMemo(() => {
    const geom = scene.children[0].geometry;
    const posArray = geom.getAttribute("position").array;
    const filtered = [];
    for (let i = 0; i < posArray.length; i += 15) {
      filtered.push(posArray[i], posArray[i + 1], posArray[i + 2]);
    }
    return new Float32Array(filtered);
  }, [scene]);

  return positions;
}

function SimulationShaderMaterial({ initialPositions }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      positions: { value: initialPositions },
      time: { value: 0.0 },
      mouse: { value: new THREE.Vector2() },
    },
    vertexShader: /* GLSL */ `
      uniform float time;
      uniform vec2 mouse;
      attribute vec3 position;
      varying vec3 vPosition;
      void main() {
        // Use time and position for basic displacement (example)
        vec3 displaced = position + vec3(sin(time * 0.1), cos(time * 0.1), 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        vPosition = displaced;
      }
    `,
    fragmentShader: /* GLSL */ `
      varying vec3 vPosition;
      void main() {
        gl_FragColor = vec4(vPosition * 0.5 + 0.5, 1.0);
      }
    `,
  });
}

// Create the particle simulation
function ParticleSimulation({ initialPositions }) {
  const fbo1 = useFBO(WIDTH, HEIGHT);
  const fbo2 = useFBO(WIDTH, HEIGHT);
  const [fboCurrent, setFboCurrent] = useState(fbo1);
  const [fboNext, setFboNext] = useState(fbo2);

  const simulationMaterial = useMemo(() => {
    return SimulationShaderMaterial({ initialPositions });
  }, [initialPositions]);

  const meshRef = useRef();

  // Update simulation logic per frame
  useFrame((state, delta) => {
    // Alternate between FBOs for double buffering
    meshRef.current.material = simulationMaterial;
    setFboCurrent(fboNext);
    setFboNext(fboCurrent);

    // Render the current FBO to simulate the particles
    state.gl.setRenderTarget(fboCurrent);
    //@ts-ignore
    state.gl.render(meshRef.current, state.camera);
    state.gl.setRenderTarget(null);

    // Update uniforms
    simulationMaterial.uniforms.time.value += delta;
  });

  return createPortal(
    <mesh ref={meshRef}>
      <planeBufferGeometry args={[2, 2]} />
      <shaderMaterial args={[simulationMaterial]} />
    </mesh>,

  );
}

export function LogoParticles() {
  const positionData = useFilteredPositions("./logo-huge.glb");

  return (
    <Canvas>
      <ParticleSimulation initialPositions={positionData} />
    </Canvas>
  );
}
useGLTF.preload(LOGO_URL);
// "use client";
// import { useFBO, useGLTF } from "@react-three/drei";
// import { Canvas, createPortal, useFrame } from "@react-three/fiber";
// import { useMemo, useRef, useState } from "react";
// import * as THREE from "three";

// const WIDTH = 1024;
// const HEIGHT = 1024;

// // Load GLB model and filter vertices
// function useFilteredPositions(url) {
//   const { scene } = useGLTF(url);
//   const positions = useMemo(() => {
//     const geom = scene.children[0];
//     const posArray = geom.getAttribute("position").array;
//     const filtered = [];
//     for (let i = 0; i < posArray.length; i += 15) {
//       filtered.push(posArray[i], posArray[i + 1], posArray[i + 2]);
//     }
//     return new Float32Array(filtered);
//   }, [scene]);

//   return positions;
// }

// function SimulationShaderMaterial({ initialPositions }) {
//   return new THREE.ShaderMaterial({
//     uniforms: {
//       positions: { value: initialPositions },
//       time: { value: 0.0 },
//       mouse: { value: new THREE.Vector2() },
//     },
//     vertexShader: /* GLSL */ `
//       uniform float time;
//       uniform vec2 mouse;
//       attribute vec3 position;
//       varying vec3 vPosition;
//       void main() {
//         // Use time and position for basic displacement (example)
//         vec3 displaced = position + vec3(sin(time * 0.1), cos(time * 0.1), 0.0);
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
//         vPosition = displaced;
//       }
//     `,
//     fragmentShader: /* GLSL */ `
//       varying vec3 vPosition;
//       void main() {
//         gl_FragColor = vec4(vPosition * 0.5 + 0.5, 1.0);
//       }
//     `,
//   });
// }

// // Create the particle simulation
// function ParticleSimulation({ initialPositions }) {
//   const fbo1 = useFBO(WIDTH, HEIGHT);
//   const fbo2 = useFBO(WIDTH, HEIGHT);
//   const [fboCurrent, setFboCurrent] = useState(fbo1);
//   const [fboNext, setFboNext] = useState(fbo2);

//   const simulationMaterial = useMemo(() => {
//     return SimulationShaderMaterial({ initialPositions });
//   }, [initialPositions]);

//   const meshRef = useRef();

//   // Update simulation logic per frame
//   useFrame((state, delta) => {
//     // Alternate between FBOs for double buffering
//     meshRef.current.material = simulationMaterial;
//     setFboCurrent(fboNext);
//     setFboNext(fboCurrent);

//     // Render the current FBO to simulate the particles
//     state.gl.setRenderTarget(fboCurrent);
//     state.gl.render(meshRef.current, state.camera);
//     state.gl.setRenderTarget(null);

//     // Update uniforms
//     simulationMaterial.uniforms.time.value += delta;
//   });

//   return createPortal(
//     <mesh ref={meshRef}>
//       <planeBufferGeometry args={[2, 2]} />
//       <shaderMaterial args={[simulationMaterial]} />
//     </mesh>,
//     document.body // Change to suitable location
//   );
// }

// export default function Page() {
//   const positionData = useFilteredPositions("/logo-huge.glb");

//   return (
//     <Canvas>
//       <ambientLight color="gray" intensity={10} />
//       <ParticleSimulation initialPositions={positionData} />
//     </Canvas>
//   );
// }

// useGLTF.preload("/logo-huge.glb");
