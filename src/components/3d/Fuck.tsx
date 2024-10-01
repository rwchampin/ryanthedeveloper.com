"use client";
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Instances, Instance } from '@react-three/drei';

const vertexShader = `
  attribute vec3 color;
  attribute vec3 velocity;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vColor = color;
    vNormal = normal;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 cameraPosition;
  uniform mat4 orientationMatrix;
  uniform float mirror;
  uniform float lightIntensity;
  uniform sampler3D voxelTexture;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec4 sampleVoxels(vec3 pos, float lod) {
    return texture(voxelTexture, pos);
  }

  vec4 voxelConeTracing(vec3 startPos, vec3 direction, float tanHalfAngle) {
    float lod = 0.0;
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    float occlusion = 0.0;
    float voxelWorldSize = 0.001;
    float dist = voxelWorldSize;
    float maxDist = 10.0;
    float maxAlpha = 0.95;

    for(int i = 0; i < 50; i++) {
      if(dist >= maxDist || alpha >= maxAlpha) break;
      float diameter = max(voxelWorldSize, 2.0 * tanHalfAngle * dist);
      float lodLevel = log2(2.0 * diameter / voxelWorldSize);
      vec4 voxelColor = sampleVoxels(startPos + dist * direction, lodLevel);
      float sub = 1.0 - alpha;
      float aa = voxelColor.a;
      alpha += sub * aa;
      occlusion += sub * aa / (1.0 + 0.03 * diameter);
      color += voxelColor.rgb * alpha;
      dist += diameter;
    }
    return vec4(color, clamp(1.0 - occlusion, 0.0, 1.0));
  }

  void main() {
    vec3 normal = normalize(vNormal);
    normal = (orientationMatrix * vec4(normal, 1.0)).xyz;

    vec3 light = vec3(0.0, 1.0, 0.0);
    vec3 R = reflect(light, normal);
    vec3 eye = normalize(cameraPosition - vPosition);
    float specular = pow(max(dot(eye, R), 0.0), 2.0);

    vec4 coneTrace = voxelConeTracing(vPosition * 0.1, normal, 0.1);
    vec3 color = vColor * (0.3 * max(dot(normal, light), 0.0) + 0.4 + 0.3 * specular);
    color += coneTrace.rgb * lightIntensity;

    if (mirror > 0.5) {
      color *= clamp(1.0 - 1.5 * vPosition.y / 136.0, 0.0, 1.0);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createVoxelTexture(size) {
  const data = new Float32Array(size * size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.random() * 0.1;     // R
    data[i + 1] = Math.random() * 0.1; // G
    data[i + 2] = Math.random() * 0.1; // B
    data[i + 3] = Math.random() * 0.5; // A
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.FloatType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

function AdvancedSpheres() {
  const instancesRef = useRef();
  const { camera } = useThree();

  const [sphereData, uniforms, voxelTexture] = useMemo(() => {
    const count = 50;
    const sphereData = new Array(count).fill().map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ),
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      scale: Math.random() * 0.5 + 0.5
    }));

    const voxelTexture = createVoxelTexture(64);

    const uniforms = {
      cameraPosition: { value: camera.position },
      orientationMatrix: { value: new THREE.Matrix4() },
      mirror: { value: 1.0 },
      lightIntensity: { value: 1.0 },
      voxelTexture: { value: voxelTexture }
    };

    return [sphereData, uniforms, voxelTexture];
  }, [camera]);

  useFrame((state) => {
    if (instancesRef.current) {
      sphereData.forEach((data, i) => {
        data.position.add(data.velocity);
        
        if (Math.abs(data.position.x) > 10) data.velocity.x *= -1;
        if (Math.abs(data.position.y) > 10) data.velocity.y *= -1;
        if (Math.abs(data.position.z) > 10) data.velocity.z *= -1;

        instancesRef.current.setMatrixAt(i, new THREE.Matrix4().setPosition(data.position));
      });
      instancesRef.current.instanceMatrix.needsUpdate = true;
    }
    uniforms.cameraPosition.value.copy(camera.position);
    uniforms.orientationMatrix.value.copy(camera.matrixWorld);
  });

  return (
    <Instances ref={instancesRef} limit={50}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
      {sphereData.map((data, i) => (
        <Instance key={i} scale={data.scale} color={data.color} />
      ))}
    </Instances>
  );
}

export function Fuck() {
  return (
     
     <>

      <AdvancedSpheres />
      </>
      
  );
}

 