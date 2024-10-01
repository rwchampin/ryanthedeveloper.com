"use client";
 
import { useEffect, useRef } from 'react'
import { useControls } from 'leva';
import * as THREE from 'three';

import {
    getGeometry,
    getMaterial,
} from '@/lib/utils/utils3d';
import {
    MeshReflectorMaterial,
} from '@react-three/drei';

export const Floor = ({ viewPort }) => {
    const floorRef = useRef<any>(null)
    const wallRef = useRef<any>(null)
    const floorSettings = useControls("Floor", {
        visible: true,
        castShadow: false,
        receiveShadow: true,
        position: [0, -.995, 0],
        rotation: [Math.PI / 2+.01, 0, 0],
        scale: [ viewPort.width, viewPort.height, viewPort.distance ],

    })
    const floorGeometry = useControls("Floor Geometry", {
        geometry: {
        options: ['plane', 'box', 'sphere', 'torus', 'cone', 'cylinder'],
        value: 'plane',
        onChange: (value) => {
            floorRef.current.geometry = getGeometry(value)
        }
    },  
    })

    const floorMaterial = useControls("Floor Material", {
        blur: [300, 100],
        resolution: 2048,
        mixBlur: 1,
        mixStrength: 80,
        roughness: 1,
        depthScale: 1.2,
        minDepthThreshold: 0.4,
        maxDepthThreshold: 1.4,
        color: "#050505",
        metalness: 0.5,
    })
    

    
    return (
        <>
        <mesh
        ref={floorRef}
         receiveShadow={floorSettings.receiveShadow}
            castShadow={floorSettings.castShadow}
         position={floorSettings.position}
         rotation={[-Math.PI / 2+.02, 0, 0]}
         scale={floorSettings.scale}
         visible={floorSettings.visible}
        >
        <planeGeometry args={[
            viewPort.width,
            viewPort.height,
        ]} />
        <MeshReflectorMaterial
            mirror={0.5}
            blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
            />
        </mesh>

        </>
    )
    }