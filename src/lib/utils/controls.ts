// import {
//     useControls
// } from 'leva';
// import * as THREE from 'three';
// // import { useRef, useEffect } from 'react';
// // import { useFrame, useGLTF } from '@react-three/fiber';
// import {
//     MeshRefractionMaterial,
//     MeshWobbleMaterial,
//     MeshDistortMaterial,
//     // MeshReflectorMaterial,  
// } from '@react-three/drei';
// import { LayerMaterial, Depth } from 'lamina'

// export const geometryControls = () => {
//     // const getGeometry = () => {
//     //     return switch (geometry) {
//     //         case 'box':
//     //             geometry = <boxGeometry args={[1, 1, 1]} />;
//     //             break;
//     //         case 'sphere':
//     //             geometry = <sphereGeometry args={[0.5, 32, 32]} />;
//     //             break;
//     //         case 'torus':
//     //             geometry = <torusGeometry args={[0.5, 0.2, 16, 100]} />;
//     //             break;
//     //         case 'cone':
//     //             geometry = <coneGeometry args={[0.5, 1, 32]} />;
//     //             break;
//     //         case 'cylinder':
//     //             geometry = <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
//     //             break;
//     //         case 'logo':
//     //             geometry = <bufferGeometry attach="geometry" {...logo.geometry} />;
//     //             break;
//     //         case customGeometry.type:
//     //             geometry = customGeometry.geometry;
//     //             break;
//     //         default:
//     //             geometry = <boxGeometry args={[1, 1, 1]} />;
//     //             break;
//     //     };
//     // }
//     const getSettings = () => {
//         return switch (type) {
//             case 'box':
//                 return {
//                     width: 1,
//                     height: 1,
//                     depth: 1
//                 };
//                 break;
//             case 'sphere':
//                 return {
//                     radius: 0.5,
//                     widthSegments: 32,
//                     heightSegments: 32
//                 };
//                 break;
//             case 'torus':
//                 return {
//                     radius: 0.5,
//                     tube: 0.2,
//                     radialSegments: 16,
//                     tubularSegments: 100
//                 };
//                 break;
//             case 'cone':
//                 return {
//                     radius: 0.5,
//                     height: 1,
//                     radialSegments: 32
//                 };
//                 break;
//             case 'cylinder':
//                 return {
//                     radiusTop: 0.5,
//                     radiusBottom: 0.5,
//                     height: 1,
//                     radialSegments: 32
//                 };
//                 break;
 
//             case customGeometry.type:
//                 return {
//                     geometry: customGeometry.geometry
//                 };
//                 break;
//             default:
//                 return {
//                     width: 1,
//                     height: 1,
//                     depth: 1
//                 };
//                 break;
//         };
//     }
//     return useControls('geometry', {
//         geometry: {
//             options: ['box', 'sphere', 'torus', 'cone', 'cylinder', 'logo'],
//             value: 'logo'
//         },
//         ...getSettings((get) => get('geometry'))
//     });

// }

// export const materialControls = ({ customMaterial }) => {
//     const getMaterial = () => {
//        return switch (material) {
//             case 'standard':
//                 const newMaterial = new THREE.MeshStandardMaterial({
//                     color: settings.color,
//                     roughness: settings.roughness,
//                     metalness: settings.metalness,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'phong':
//                 const newMaterial = new THREE.MeshPhongMaterial({
//                     color: settings.color,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'basic':
//                 const newMaterial = new THREE.MeshBasicMaterial({
//                     color: settings.color,
//                     fog: settings.fog
//                 });
//                 break;
           
//             case 'lambert':
//                 const newMaterial = new THREE.MeshLambertMaterial({
//                     color: settings.color,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//                 case 'toon':
//                 const newMaterial = new THREE.MeshToonMaterial({
//                     color: settings.color,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'physical':
//                 const newMaterial = new THREE.MeshPhysicalMaterial({
//                     color: settings.color,
//                     roughness: settings.roughness,
//                     metalness: settings.metalness,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'depth':
//                 const newMaterial = new THREE.MeshDepthMaterial();
//                 break;
//             case 'matcap':
//                 const newMaterial = new THREE.MeshMatcapMaterial({
//                     matcap: settings.matcap
//                 });
//                 break;
//             case 'distortion':
//                 const newMaterial = new THREE.MeshDistortionMaterial({
//                     color: settings.color,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'wobble':
//                 const newMaterial = new THREE.MeshWobbleMaterial({
//                     color: settings.color,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'refraction':
//                 const newMaterial = new THREE.MeshRefractionMaterial({
//                     color: settings.color,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'reflector':
//                 const newMaterial = new THREE.MeshReflectorMaterial({
//                     color: settings.color,
//                     fog: settings.fog
//                 });
//                 break;
//             case 'normal':
//                 const newMaterial = new THREE.MeshNormalMaterial();
//                 break;
//             case 'shadow':
//                 const newMaterial = new THREE.ShadowMaterial();
//                 break;
//             case 'lamina':
//                 const newMaterial = new LayerMaterial({
//                     color: settings.color,
//                     depth: settings.depth
//                 });
//                 break;
//             default:
//                 const newMaterial = new THREE.MeshStandardMaterial({
//                     color: settings.color,
//                     roughness: settings.roughness,
//                     metalness: settings.metalness,
//                     emissive: settings.emissive,
//                     emissiveIntensity: settings.emissiveIntensity,
//                     fog: settings.fog
//                 });
//                 break;
//         };
//     }

//     return useControls('material', {
//         material: {
//             options: ['standard', 'phong', 'basic', 'lambert', 'toon', 'physical', 'depth', 'matcap', 'distortion', 'wobble', 'refraction', 'reflector', 'normal', 'shadow', 'lamina'],
//             value: 'standard'
//         },
//         // ...getMaterial((get) => get('material'))
//     });

export {}