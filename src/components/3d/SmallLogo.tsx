"use client";
import { LOGO_URL } from "@/lib/utils/utils3d";
import { useGLTF, Sampler } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";

class Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    originalPosition: THREE.Vector3 | null;
    repelled: boolean;
    color: THREE.Color;

    constructor(position: THREE.Vector3) {
        this.position = position;
        this.velocity = new THREE.Vector3();
        this.originalPosition = null;
        this.repelled = false;
        this.color = new THREE.Color(0xff0500); // Default color
    }

    applyRepulsion(mousePosition: THREE.Vector3, repulsionDistance: number) {
        const mousePos2D = new THREE.Vector3(mousePosition.x, mousePosition.y, 0);
        const particlePos2D = new THREE.Vector3(this.position.x, this.position.y, 0);
    const dx = mousePos2D.x - particlePos2D.x;
    const dy = mousePos2D.y - particlePos2D.y;
    const dz = mousePos2D.z - particlePos2D.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < repulsionDistance) {
            if (!this.originalPosition) {
                this.originalPosition = this.position.clone();
            }
            const direction = particlePos2D.clone().sub(mousePos2D).normalize();
            const hitStrength = (repulsionDistance - distance) / repulsionDistance;
            this.velocity.add(direction.multiplyScalar(hitStrength));
            this.repelled = true;
            this.color.set(0x00ff00); // Change color to green when repelled
        } else {
            this.repelled = false;
            this.color.set(0xff0500); // Reset color to default
        }
    }

    applyAttraction(gravity: number) {
        if (this.repelled && this.originalPosition) {
            const direction = this.originalPosition.clone().sub(this.position).normalize();
            this.velocity.add(direction.multiplyScalar(gravity));
        }
    }

    updatePosition() {
        this.position.add(this.velocity);
        this.velocity.multiplyScalar(0.95); // Apply some damping to the velocity to simulate friction
    }

    reset(threshold: number) {
        if (this.originalPosition && this.position.distanceTo(this.originalPosition) < threshold) {
            // Reset position to original
            this.position.copy(this.originalPosition);
            this.velocity.set(0, 0, 0);
            this.repelled = false;
            this.color.set(0xff0500); // Reset color to default
        }
    }
}

export const Fuck = () => {

    const gltf = useGLTF(LOGO_URL);
    const logo = gltf.scene.children[0];
    const count = 2000;
    const particles = useRef(new Array(count).fill(null).map(() => new Particle(new THREE.Vector3()))).current;

    
   

    return (
        <>

                <primitive object={logo}  />
               
        </>
    );
};