import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

class Particle {
    originalPos: THREE.Vector3;
    pos: THREE.Vector3;
    prevPos: { x: number; y: number; z: number };
    vel: { x: number; y: number; z: number };
    angle: number;
    speed: number;
    friction: number;
    radius: number;
    force: number;
    gravity: number;
    axis: THREE.Vector3;
    group: number;

    constructor () {
        this.originalPos = new THREE.Vector3().setFromSphericalCoords( .01, Math.random() * Math.PI, Math.random() * Math.PI );
        this.pos = this.originalPos.clone();
        this.prevPos = { x: 0, y: 0, z: 0 };
        this.vel = { x: 0, y: 0, z: 0 };
        this.radius = 0.5;
        this.angle = 0;
        this.speed = 0;
        this.friction = 0.99;
        this.radius = 0.5;
        this.force = 0.01;
        this.gravity = 0.01;
        this.axis = new THREE.Vector3( 0, 0, 0 );
        this.group = Math.floor( Math.random() * 4 );
    }

    move() {
        this.pos.applyAxisAngle( this.axis, this.angle );
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.pos.z += this.vel.z;

        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        this.prevPos.z = this.pos.z;

        this.vel.x += this.force * ( Math.random() - 0.5 );
        this.vel.y += this.force * ( Math.random() - 0.5 );
        this.vel.z += this.force * ( Math.random() - 0.5 );

        // Apply gravity
        this.vel.y -= this.gravity;

        // Apply friction
        this.vel.x *= this.friction;
        this.vel.y *= this.friction;
        this.vel.z *= this.friction;

        // Update angle
        this.angle += this.speed;

        // Update position
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.pos.z += this.vel.z;
    }
}

export const Swirl = () => {
    const total = 5000;
    const particles = useMemo( () => {
        const particlesArray = [];
        for ( let i = 0; i < total; i++ ) {
            particlesArray.push( new Particle() );
        }
        return particlesArray;
    }, [ total ] );

    const particlePositionsToFloat32Array = useMemo( () => {
        const vecs = particles.map( ( p ) => p.pos );
        const geometry = new THREE.BufferGeometry().setFromPoints( vecs );
        return geometry;
    }, [ particles ] );

    useFrame( () => {
        for ( let i = 0; i < total; i++ ) {
            const p = particles[ i ];
            p.move();
            particlePositionsToFloat32Array.attributes.position.setXYZ( i, p.pos.x, p.pos.y, p.pos.z );
        }
        particlePositionsToFloat32Array.attributes.position.needsUpdate = true;
    } );

    return (
        <points>
            <bufferGeometry attach="geometry" { ...particlePositionsToFloat32Array } />
            <pointsMaterial attach="material" color="green" size={ .05 } />
        </points>
    );
};