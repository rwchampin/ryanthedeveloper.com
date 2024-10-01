
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
export const Lighting = () => {
    const lightRef = useRef();
    useHelper(lightRef, THREE.PointLightHelper, 0.5, 'red');
    const { intensity, color, position } = useControls('Core Scene Light', {
        intensity: { value: 1, min: 0, max: 10, step: 0.1 },
        color: '#ffffff',
        position: { value: [5, 5, 5], step: 0.1 },
    });

    useFrame((state, delta) => {
        if (lightRef.current) {
            lightRef.current.intensity = intensity;
            lightRef.current.color = new THREE.Color(color);
            lightRef.current.position.set(position[0], position[1], position[2]);
        }

        // rotate the light around the scene
        lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
        lightRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.5) * 5;
        lightRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 5;
    });

    return <pointLight ref={lightRef} intensity={intensity} color={color} position={position} />;
};
