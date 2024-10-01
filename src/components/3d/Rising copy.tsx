"use client";

import {
    dummy, vec3
} from "@/lib/utils/utils3d";
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Raycaster } from 'three';
const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vUv = uv;
            vNormal = normal;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }

        `;

const fragmentShader = `
        uniform sampler2D tMatCap;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewPosition = normalize(vViewPosition);
            vec3 r = reflect(viewPosition, normal);
            vec4 base = vec4(0.5, 0.5, 0.5, 1.0);
            gl_FragColor = base;
        }
        `;


const sizeRanges = [[1, 2], [2, 3], [3, 4]];

 

const LineInstances = ({ count=50, slowMotion }) => {
    const meshRef = useRef<THREE.InstancedMesh>();
    const risersRef = useRef<Riser[]>([]);
    const raycaster = useMemo(() => new Raycaster(), []);
    const mouse = useMemo(() => vec3(), []);
    const { camera, gl } = useThree();

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useMemo(() => {
        const risers: Riser[] = [];
        const dimension = 40;
        for (let i = 0; i < count; i++) {
            const position = vec3(
                Math.random() * (dimension * 15) - (dimension / 2 * 15),
                Math.random() * (dimension * 15) - (dimension / 2 * 15),
                (-600 * Math.random()) + 150
            );
            const sizeRange = sizeRanges[Math.floor(Math.random() * sizeRanges.length)];
            const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
            risers.push({
                position,
                size,
                modifier: 1 / size,
                isHovered: false,
                targetPosition: null,
                hasParticles: Math.random() < 0.2 // 20% chance of having particles
            });
        }
        risersRef.current = risers;
    }, [count]);

    useFrame((state) => {
        const risers = risersRef.current;
        for (let i = 0; i < count; i++) {
            const riser = risers[i];
            if (riser.isHovered && riser.targetPosition) {
                riser.position.lerp(riser.targetPosition, 0.1);
            } else {
                riser.position.y += (slowMotion ? 0.1 : 1) * riser.modifier;
                if (riser.position.y > 300) {
                    riser.position.y = -100;
                }
            }

            dummy().position.copy(riser.position);
            dummy().scale.setScalar(riser.size);
            dummy().updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy().matrix);
        }
        if (meshRef.current) {
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    const onPointerMove = useCallback((event: PointerEvent) => {
        const { clientX, clientY } = event;
        mouse.set(
            (clientX / gl.domElement.clientWidth) * 2 - 1,
            -(clientY / gl.domElement.clientHeight) * 2 + 1,
            0
        );
        raycaster.setFromCamera(mouse, camera);

        if (meshRef.current) {
            const intersects = raycaster.intersectObject(meshRef.current);
            if (intersects.length > 0) {
                const index = intersects[0].instanceId;
                if (index !== null && index !== undefined) {
                    setHoveredIndex(index);
                    const riser = risersRef.current[index];
                    riser.isHovered = true;
                    riser.targetPosition = vec3(mouse.x * 100, mouse.y * 100, 0);
                }
            } else {
                setHoveredIndex(null);
            }
        }
    }, [camera, gl.domElement.clientHeight, gl.domElement.clientWidth, mouse, raycaster]);

    const onDoubleClick = useCallback(() => {
        if (hoveredIndex !== null) {
            const riser = risersRef.current[hoveredIndex];
            riser.isHovered = false;
            riser.targetPosition = null;
            setHoveredIndex(null);
        }
    }, [hoveredIndex]);

    useEffect(() => {
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('dblclick', onDoubleClick);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('dblclick', onDoubleClick);
        };
    }, [onPointerMove, onDoubleClick]);

    const meshControls = useControls("Risers", {
        count: { value: count, min: 1, max: 1000, step: 1 },
        slowMotion: { value: slowMotion, min: 0, max: 1, step: 0.01 },
        color: '#ffffff',
        emissive: '#0000ff',
        emissiveIntensity: { value: .5, min: 0, max: 100, step: 0.1 },
        flatShading: { value: false },
    });
    
    return (
        
            <instancedMesh ref={meshRef} args={[null, null, count]} receiveShadow castShadow>
               <icosahedronGeometry args={[1, 5]} />
            <meshStandardMaterial
                color={meshControls.color}
                emissive={meshControls.emissive}
                emissiveIntensity={meshControls.emissiveIntensity}
                flatShading={meshControls.flatShading}
            />
            </instancedMesh>
           
        
    );
}

export const Rising = ({ count }) => {



    const { camera, viewport } = useThree();


    const [slowMotion, setSlowMotion] = useState(false);
    // const [zoom, setZoom] = useState(camera.position.z);
    // const initialCameraPosition = camera.position;/
    // const generateCube = useCallback(() => {
    //     const icosahdronGeometry = new THREE.IcosahedronGeometry(1, 3);
    //     // const texture1 = new THREE.TextureLoader().load('https://github.com/nidorx/matcaps/blob/master/128/2D2D2F_C6C2C5_727176_94949B-128px.png');
    //     const material = new ShaderMaterial({
    //         uniforms: {
    //             // tMatCap: { value: texture1 },
    //             time: { value: 0 },
    //         },
    //         vertexShader: vertexShader,
    //         fragmentShader: fragmentShader,
    //         // flatShading: true,
    //     });
    //     const mesh = new Mesh(geometry, material);
    //     mesh.position.x = 0;
    //     mesh.position.y = -50;
    //     mesh.position.z = Math.random() * 10;
    //     return mesh;
    // }, []);



    return (
        <>

            {/* <LineInstances count={count} slowMotion={slowMotion} /> */}

        


            </>

    );
};
