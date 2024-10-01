import { LOGO_URL } from "@/lib/utils/utils3d"
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

export const getDataTexture = (size) => {
  let number = size * size;
  const gltf = useGLTF(LOGO_URL);
  const mesh = gltf.scene.children[0];
  const data = new Float32Array(4 * number);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;

      // generate point on a sphere
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.acos(Math.random() * 2 - 1); // 
      // let phi = Math.random()*Math.PI; // 
      let x = Math.sin(phi) * Math.cos(theta);
      let y = Math.sin(phi) * Math.sin(theta);
      let z = Math.cos(phi);

      data[4 * index] = 6 * (i / size - 0.5);
      data[4 * index + 1] = 6 * (j / size - 0.5);
      data[4 * index + 2] = 0;
      data[4 * index + 3] = 0;
    }
  }


  let dataTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  dataTexture.needsUpdate = true;

  return dataTexture
}

export function getSphereTexture(size) {
  let number = size * size;
  const data = new Float32Array(4 * number);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;

      // generate point on a sphere
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.acos(Math.random() * 2 - 1); // 
      // let phi = Math.random()*Math.PI; // 
      let x = Math.sin(phi) * Math.cos(theta);
      let y = Math.sin(phi) * Math.sin(theta);
      let z = Math.cos(phi);

      data[4 * index] = x;
      data[4 * index + 1] = y;
      data[4 * index + 2] = z;
      data[4 * index + 3] = 0;
    }
  }


  let dataTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  dataTexture.needsUpdate = true;

  return dataTexture
}

export function getVelocityTexture(size) {
  let number = size * size;
  const data = new Float32Array(4 * number);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      data[4 * index] = 0;
      data[4 * index + 1] = 0;
      data[4 * index + 2] = 0;
      data[4 * index + 3] = 0;
    }
  }


  let dataTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  dataTexture.needsUpdate = true;

  return dataTexture
}






export function getMeshTexture(mesh, size) {
  let number = size * size;
  const data = new Float32Array(4 * number);

  const sampler = new MeshSurfaceSampler(mesh).build();
  const tempPosition = new THREE.Vector3();

  for (let i = 0; i < number; i++) {
    sampler.sample(tempPosition); // Sample a random point on the mesh surface

    data[4 * i] = tempPosition.x;
    data[4 * i + 1] = tempPosition.y;
    data[4 * i + 2] = tempPosition.z;
    data[4 * i + 3] = 0;
  }
console.log(data)
  const dataTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType,

  );
  dataTexture.needsUpdate = true;

  return dataTexture;
}