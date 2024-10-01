
"use client"
// components/3d/ParticleEmitter.tsx
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const ParticleEmitter = ({
  count = 1000,
  direction = [0, 0, 0],
  velocity = [0, 0, 0],
  acceleration = [0, 0, 0],
}) => {
  const points = useRef<THREE.Points>(null)

  const directionInRadians = new THREE.Vector3().fromArray(direction).normalize()
  const velocityInRadians = new THREE.Vector3().fromArray(velocity).normalize()
  const accelerationInRadians = new THREE.Vector3().fromArray(acceleration).normalize()
  const particleSystem = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      resetParticle(i, positions, velocities, lifetimes, directionInRadians)
    }

    return { positions, velocities, lifetimes }
  }, [count, directionInRadians])

  useFrame((state, delta) => {
    if (!points.current) return

    const { positions, velocities, lifetimes } = particleSystem

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      positions[i3] += velocities[i3] * delta
      positions[i3 + 1] += velocities[i3 + 1] * delta
      positions[i3 + 2] += velocities[i3 + 2] * delta

      lifetimes[i] -= delta

      if (lifetimes[i] <= 0) {
        resetParticle(i, positions, velocities, lifetimes, directionInRadians)
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true
    points.current.geometry.attributes.opacity.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleSystem.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={count}
          array={particleSystem.lifetimes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        // blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float opacity;
          varying float vOpacity;
          void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 0.1     * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vOpacity;
          void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, vOpacity);
          }
        `}
      />
    </points>
  )
}

function resetParticle(
  index: number,
  positions: Float32Array,
  velocities: Float32Array,
  lifetimes: Float32Array,
  directionInRadians: THREE.Vector3
) {
  const i3 = index * 3
  positions[i3] = 0
  positions[i3 + 1] = 0
  positions[i3 + 2] = 0

  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * 0.1 + 0.05

  // Calculate the opposite direction
  const oppositeDirection = directionInRadians.clone().negate()

  velocities[i3] = oppositeDirection.x * speed
  velocities[i3 + 1] = oppositeDirection.y * speed
  velocities[i3 + 2] = oppositeDirection.z * speed

  lifetimes[index] = Math.random() * 2 + 1
}

export default ParticleEmitter
