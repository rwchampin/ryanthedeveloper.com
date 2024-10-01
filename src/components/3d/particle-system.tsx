'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
    createNoise3D
} from 'simplex-noise'

const noise3D = createNoise3D( Math.random )

// Curl noise functionmb
const curl = ( x, y, z ) => {
    const eps = 0.0001

    let dx = noise3D( x + eps, y, z ) - noise3D( x - eps, y, z )
    let dy = noise3D( x, y + eps, z ) - noise3D( x, y - eps, z )
    let dz = noise3D( x, y, z + eps ) - noise3D( x, y, z - eps )

    const len = Math.sqrt( dx * dx + dy * dy + dz * dz ) + eps
    dx /= len
    dy /= len
    dz /= len

    return [ dy - dz, dz - dx, dx - dy ]
}

const Particles = ( { count = 100000 } ) => {
    const points = useRef()
    const particlePositions = useMemo( () => {
        const positions = new Float32Array( count * 3 )
        for ( let i = 0; i < count; i++ ) {
            positions[ i * 3 ] = ( Math.random() - 0.5 ) * 10
            positions[ i * 3 + 1 ] = ( Math.random() - 0.5 ) * 10
            positions[ i * 3 + 2 ] = ( Math.random() - 0.5 ) * 10
        }
        return positions
    }, [ count ] )

    const particleVelocities = useMemo( () => {
        return new Float32Array( count * 3 ).fill( 0 )
    }, [ count ] )

    const time = useRef( 0 )

    useFrame( ( state, delta ) => {
        if ( !points.current ) return
        debugger
        time.current += delta * 0.5 // Adjust this value to change the speed of the animation

        const positions = points.current.geometry.attributes.position.array
        for ( let i = 0; i < count; i++ ) {
            const i3 = i * 3

            // Get current position
            let x = positions[ i3 ]
            let y = positions[ i3 + 1 ]
            let z = positions[ i3 + 2 ]

            // Apply curl noise
            const scale = 0.1 // Adjust this to change the scale of the curl noise
            const [ dx, dy, dz ] = curl(
                x * scale + time.current,
                y * scale + time.current,
                z * scale + time.current
            )

            // Update velocity
            particleVelocities[ i3 ] += dx * 0.1
            particleVelocities[ i3 + 1 ] += dy * 0.1
            particleVelocities[ i3 + 2 ] += dz * 0.1

            // Apply velocity
            positions[ i3 ] += particleVelocities[ i3 ]
            positions[ i3 + 1 ] += particleVelocities[ i3 + 1 ]
            positions[ i3 + 2 ] += particleVelocities[ i3 + 2 ]

            // Damping
            particleVelocities[ i3 ] *= 0.95
            particleVelocities[ i3 + 1 ] *= 0.95
            particleVelocities[ i3 + 2 ] *= 0.95

            // Boundary conditions (wrap around)
            const bound = 5
            positions[ i3 ] = ( positions[ i3 ] + bound ) % ( bound * 2 ) - bound
            positions[ i3 + 1 ] = ( positions[ i3 + 1 ] + bound ) % ( bound * 2 ) - bound
            positions[ i3 + 2 ] = ( positions[ i3 + 2 ] + bound ) % ( bound * 2 ) - bound
        }
        points.current.geometry.attributes.position.needsUpdate = true
    } )

    return (
        <points ref={ points }>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={ particlePositions.length / 3 }
                    array={ particlePositions }
                    itemSize={ 3 }
                />
            </bufferGeometry>
            <pointsMaterial size={ 0.02 } color="#ff88ff" />
        </points>
    )
}

export const ParticleSystem = () => {
    return (
        <Canvas camera={ { position: [ 0, 0, 10 ] } }>
            <OrbitControls />
            <ambientLight intensity={ 0.5 } />
            <pointLight position={ [ 10, 10, 10 ] } />
            <Particles />
        </Canvas>
    )
}

export default ParticleSystem