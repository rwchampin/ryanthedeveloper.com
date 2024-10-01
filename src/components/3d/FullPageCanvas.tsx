"use client";
import { useFrame, useThree,extend } from "@react-three/fiber";
import { useEffect, useRef ,
    Suspense
 } from "react";
import * as THREE from "three";
import { EffectComposer, FXAA, SSAO } from "@react-three/postprocessing";
import dynamic from 'next/dynamic'


const BlackSmokeSphere = dynamic(() => import('@/components/3d/BlackSmokeSphere').then((mod) => mod.BlackSmokeSphere), {
  ssr: false
})
export const FullPageCanvas = () => {
    const mesh = useRef<any>(null);
    const { camera ,
        scene
    } = useThree();
    const light = useRef<any>(null);
    const v3 = new THREE.Vector3();

    useEffect(() => {
        const move = (e: MouseEvent) => {
            v3.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
                0.5
            );
            v3.unproject(camera);
            const dir = v3.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));
            v3.set(pos.x, pos.y, pos.z);
        };

        window.addEventListener("mousemove", move);

        return () => {
            window.removeEventListener("mousemove", move);
        };
    }, [camera, mesh, light, v3]);

    useFrame(() => {
        if (!mesh.current) return;
        mesh.current.position.copy(v3);
    });

    return (
        
           <BlackSmokeSphere />
    
    );
};
