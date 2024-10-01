'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import * as THREE from 'three'
export function CustomScene({ ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}
           
        
    shadows
    
      // onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}
    >
      {/* @ts-ignore */}
      <axesHelper args={[335]} />
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}
