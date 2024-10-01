"use client";
import {
    LOGO_URL,
} from "@/lib/utils/utils3d";
import {

    useGLTF,

} from "@react-three/drei";
import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const Displacement = () => {
    const { nodes } = useGLTF(LOGO_URL);
    debugger
    const logo = nodes.scene.children[0];
    const { camera, gl, viewport } = useThree();

    return (
        <mesh>
            <bufferGeometry attach="geometry" {...logo.geometry} />
            <shaderMaterial attach="material" args={[{
                vertexShader: `
                uniform vec2 uMouse;
                uniform float uRadius;
                uniform float uViscosity;
                uniform vec2 uResolution;
                
                varying vec3 vNormal;
              
                void main() {
                  vNormal = normal;
                  vec3 newPosition = position;
                  
                  vec2 mousePos = uMouse;
                  vec2 vertexPos = (projectionMatrix * modelViewMatrix * vec4(position, 1.0)).xy;
                  vertexPos = (vertexPos + 1.0) / 2.0;
              
                  float distance = length(vertexPos - mousePos);
                  if (distance < uRadius) {
                    float displacementStrength = 1.0 - pow(distance / uRadius, uViscosity);
                    vec3 direction = normalize(position - vec3(mousePos * 2.0 - 1.0, 0.0));
                    newPosition += direction * displacementStrength * 0.5;
                  }
              
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
                `,
                fragmentShader: `
                varying vec3 vNormal;
                uniform vec2 uMouse;
                void main() {
                  gl_FragColor = vec4(uMouse.x, uMouse.y, 0.0, 1.0);
                }
                `,
                uniforms: {
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uRadius: { value: .01 },
                    uViscosity: { value: .7 },
                    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
                },
            }]} />
        </mesh>
    );
}