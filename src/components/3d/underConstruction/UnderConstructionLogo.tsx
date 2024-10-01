"use client";
import React, { useRef, useEffect
 } from 'react';
import {
  useFrame,
 } from '@react-three/fiber';
import { useGLTF ,

} from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';

import { LOGO_URL, } from '@/lib/utils/utils3d';


const generatePoints = ( numPoints, radius ) => {
  const points = [];
  for ( let i = 0; i < numPoints; i++ ) {
    const phi = Math.acos( 2 * Math.random() - 1 );
    const theta = 2 * Math.PI * Math.random();
    const x = radius * Math.sin( phi ) * Math.cos( theta );
    const y = radius * Math.sin( phi ) * Math.sin( theta );
    const z = radius * Math.cos( phi );
    points.push( new THREE.Vector3( x, y, z ) );
  }
  return points;
};

const Swarm = ( { numSpheres, pointsPerSphere, sphereRadius, centerRadius } ) => {
  const logoRefRef = useRef<any>( null );
  const spheres = useRef<any>( [] );

  useEffect( () => {
    spheres.current = Array.from( { length: numSpheres }, () => ( {
      points: generatePoints( pointsPerSphere, sphereRadius ),
      rotationSpeed: Math.random() * 0.01 + 0.01,
    } ) );
  }, [ numSpheres, pointsPerSphere, sphereRadius ] );

  useFrame( ( state, delta ) => {
    if ( logoRefRef.current ) {
      logoRefRef.current.rotation.y += 0.01;
    }
    spheres.current.forEach( ( sphere, index ) => {
      const spherelogoRef = logoRefRef.current.children[ index ];
      if ( spherelogoRef ) {
        spherelogoRef.rotation.y += sphere.rotationSpeed;
      }
    } );
  } );

  return (
    <group ref={ logoRefRef }>
      { spheres.current.map( ( sphere, index ) => (
        <group key={ index } position={ new THREE.Vector3(
          centerRadius * Math.cos( ( index / numSpheres ) * 2 * Math.PI ),
          0,
          centerRadius * Math.sin( ( index / numSpheres ) * 2 * Math.PI )
        ) }>
          <points>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach='attributes-position'
                array={ new Float32Array( sphere.points.flatMap( p => [ p.x, p.y, p.z ] ) ) }
                count={ sphere.points.length }
                itemSize={ 3 }
              />
            </bufferGeometry>
            <pointsMaterial
              size={ 0.5 }
              color="#ff0000"
              blending={ THREE.AdditiveBlending }
            />
          </points>
        </group>
      ) ) }
    </group>
  );
};

// const vertexShader = /* glsl */ `
// varying vec2 vUv;
// void main() {
//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }
// `;

// const fragmentShader = /* glsl */ `
// uniform vec2 uMouse;
// uniform float time;
// uniform vec2 resolution;
// varying vec2 vUv;

// void main() {
//   vec2 p = (2.0 * gl_FragCoord.xy - resolution) / min(resolution.x, resolution.y);
//   float a = atan(p.y, p.x);
//   float r = length(p);
//   vec3 col = 0.5 + 0.5 * cos(time + r + vec3(0, 2, 4));
//   col.r += sin(uMouse.x * 10.0) * 0.1;
//     col.g += sin(uMouse.y * 10.0) * 0.1;
//   gl_FragColor = vec4(col, 1.0);
// }
// `;

export const UnderConstructionLogo = () => {
    const logoRef = useRef<THREE.Mesh>(null);
  const { nodes } = useGLTF(LOGO_URL);
  const logo: any = nodes.Scene.children[0];
  // const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
 
  /**
   * Logo Controls
   */

  const logoGeometryControls = useControls("Logo Geometry", {

   
    scale: [.5, .5, .5],
    position: [0, 0, 0],
    rotation: [Math.PI/2, 0, 0],
    receiveShadow: true,
    castShadow: true,
    visible: true
  })

    // const logoMaterialControls = useControls("Logo Material", {
    //     color: '#ffffff',
    //     roughness: 0.5,
    //     metalness: 0.8,
    //     emissive: '#000000',
    //     emissiveIntensity: 0.1,
    //     fog: true,
        
    // })




  

//   useEffect(() => {
//     if (logo && logo.geometry) {
//       const newMaterial = new THREE.ShaderMaterial({
//         uniforms:{
//             time: { value: 0 },
//             resolution: { value: new THREE.Vector2(1, 1) },
//             uMouse: { value: null  }
//         },
//         vertexShader: /* glsl */ `
//             varying vec2 vUv;
//             void main() {
//                 vUv = uv;
//                 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//             }
//             `,
//         fragmentShader: /* glsl */ `
//             uniform float time;
//             uniform vec2 uMouse;
//             uniform vec2 resolution;
//             varying vec2 vUv;
//             void main() {
//                 vec2 p = (2.0 * gl_FragCoord.xy - resolution) / min(resolution.x, resolution.y);
//                 float a = atan(p.y, p.x);
//                 float r = length(p);
//                 vec3 col = 0.5 + 0.5 * cos(time + r + vec3(0, 2, 4));
//                 col.r += sin(uMouse.x * 10.0) * 0.1;
//                 col.g += sin(uMouse.y * 10.0) * 0.1;

//                 gl_FragColor = vec4(col, 1.0);
//             }
//             `,
//             });

//     }
//   }, [logo, logoControls]);

  

  if (!logo) return null;
  
  return (
 
      <primitive object={logo}
      ref={logoRef}
       receiveShadow={logoGeometryControls.receiveShadow}
       castShadow={logoGeometryControls.castShadow}
      scale={ 1 }
       position={logoGeometryControls.position} 
       rotation={logoGeometryControls.rotation}
       
       >
<meshPhysicalMaterial

  color={0x000000}
  emissive={0x000000}
  emissiveIntensity={0.1}
  roughness={0.5}
  metalness={0}
  fog={true}
  />
      {/* <Sparkles
        color={ 0xffffff }
        opacity={ .4 }
        count={ 100 }
        scale={ 1 }
      /> */}
      <Swarm numSpheres={ 10 } pointsPerSphere={ 100 } sphereRadius={ 0.1 } centerRadius={ 5 } />
      </primitive>
 
  );
};

useGLTF.preload(LOGO_URL);