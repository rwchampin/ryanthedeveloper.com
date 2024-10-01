import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const SimulationMaterial = shaderMaterial(
  {
    uPosition: null,
    uOriginalPosition: null,
    uMouse: new THREE.Vector3(-10, -10, 10),
    uTime: 0,
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 5.0;
    }
    `,
  `
    varying vec2 vUv;
    uniform sampler2D uPosition;
    uniform sampler2D uOriginalPosition;
    uniform vec3 uMouse;
    uniform float uTime;

    void main() {
      vec3 position = texture2D(uPosition, vUv).xyz;
      vec3 original = texture2D(uOriginalPosition, vUv).xyz;
      vec3 velocity = vec3(0.0);

      // Keep particles in their original position until interaction
      if (uTime > 0.0) {
        // Mouse repel force
        float mouseDistance = distance(position.xy, uMouse.xy);
        float maxDistance = 0.4;
        if (mouseDistance < maxDistance) {
          vec3 direction = normalize(vec3(position.xy - uMouse.xy, 0.0));
          velocity += direction * (1.0 - mouseDistance / maxDistance) * 0.01;
        }

        // Particle attraction to original position
        vec3 toOriginal = original - position;
        velocity += toOriginal * 0.01;
      }

      position += velocity;

      gl_FragColor = vec4(position, 1.0);
    }
    `
);

extend({ SimulationMaterial });
