'use client'

import { r3f } from 'helpers/global'
import { useDebugStore } from '@/stores/useDebugStore'
import { OrbitControls, Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { EffectComposer } from 'three-stdlib'

export default function Scene({...props}) {
  const debugMode = useDebugStore((state) => state.debugMode)
  const cameraControls = useControls("Camera",{
      fov: 75,
      near: 0.1,
      far: 500,
      position: [0, 0, 3 ],
      zoom: 0,
      rotation: [0, 0, 0],
      target: [0, 0, 0],
      shadows: true,
      antialiasing: false,
      clearColor: '#fff',
      alpha: true,
  })

  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}
      shadows={cameraControls.shadows}
      dpr={cameraControls.dpr}                                                                                                                                                                                                                                                                                                                                                                                                            
      gl={{
        alpha: cameraControls.alpha,
        antialias: cameraControls.antialiasing,
        powerPreference: 'high-performance'
      }}
    camera={{
        fov: cameraControls.fov,
        near: cameraControls.near,
        far: cameraControls.far,
        position: cameraControls.position,
        zoom: cameraControls.zoom,
        rotation: cameraControls.rotation,
      }}
      
      className="the-canvas h-screen w-screen fixed top-0 left-0"
      onCreated={(state) => {
        state.gl.toneMapping = THREE.AgXToneMapping;

        // state.camera.lookAt(0, 0, 0)
      }
}
    >
      {/* @ts-ignore */}
     <axesHelper args={[10]} /> 
      {debugMode && <gridHelper args={[10, 10]} />}
      {debugMode && <OrbitControls  />}
        <r3f.Out />
      <Preload all />

    </Canvas>
  )
}