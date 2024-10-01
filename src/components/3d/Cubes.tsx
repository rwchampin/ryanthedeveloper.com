// https://discourse.threejs.org/t/meshes-push-away-from-mouse-hover/68397

import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Instances, Instance } from '@react-three/drei'
import { EffectComposer, N8AO, Bloom, GodRays, KernelSize } from '@react-three/postprocessing'
import { RoundedBoxGeometry } from 'three-stdlib'
import { easing } from 'maath'
import { BlendFunction, Resizer } from 'postprocessing'
import {
  BlueWorleyNoiseMaterial,
  BlueWorleyNoiseMesh
} from "materials/BlueWorleyMaterial";
extend({ RoundedBoxGeometry })

export function Cubes() {
  const sunRef = useRef()
  return (
    <>
      <color attach="background" args={['#151520']} />
      <ambientLight ref={sunRef} intensity={Math.PI / 2} />
      <spotLight position={[-10, 20, 20]} angle={0.15} penumbra={1} decay={0} intensity={2} castShadow />
      <CC gap={0.1} stride={4} displacement={3} intensity={1} />
      <EffectComposer multisampling={0} depthBuffer={true} stencilBuffer={false} enableNormalPass={true}>
        <N8AO aoRadius={1} intensity={1} />
        {/* {sunRef && sunRef.current && <GodRays
          sun={sunRef}
          blendFunction={BlendFunction.Screen} // The blend function of this effect.
          samples={60} // The number of samples per pixel.
          density={0.96} // The density of the light rays.
          decay={0.9} // An illumination decay factor.
          weight={0.4} // A light ray weight factor.
          exposure={0.6} // A constant attenuation coefficient.
          clampMax={1} // An upper bound for the saturation of the overall effect.
          width={Resizer.AUTO_SIZE} // Render width.
          height={Resizer.AUTO_SIZE} // Render height.
          //kernelSize={KernelSize.SMALL} // The blur kernel size. Has no effect if blur is disabled.
          blur={true} // Whether the god rays should be blurred to reduce artifacts.
        />} */}
        <Bloom mipmapBlur luminanceThreshold={1} levels={7} intensity={1} />
      </EffectComposer>
      {/* <OrbitControls /> */}
    </>
  )
}

function CC({ gap = 0.1, stride = 4, displacement = 3, intensity = 1 }) {
  const cursor = new THREE.Vector3()
  const oPos = new THREE.Vector3()
  const vec = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const ref = useRef()

  const positions = useMemo(() => {
    const temp = []
    const center = stride / 2 - stride * gap + gap
    for (let x = 0; x < stride; x++)
      for (let y = 0; y < stride; y++)
        for (let z = 0; z < stride; z++) temp.push([x + x * gap - center, y + y * gap - center, z + z * gap - center])
    return temp
  }, [stride, gap])

  useFrame(({ pointer, camera, clock }, delta) => {
    cursor.set(pointer.x, pointer.y, 0.5).unproject(camera)
    dir.copy(cursor).sub(camera.position).normalize()
    cursor.add(dir.multiplyScalar(camera.position.length()))
    let count = 0
    for (let child of ref.current.children) {
      oPos.set(...positions[count++])
      dir.copy(oPos).sub(cursor).normalize()
      const dist = oPos.distanceTo(cursor)
      const distInv = displacement - dist
      const col = Math.max(0.5, distInv) / 1.5
      const mov = 1 + Math.sin(clock.elapsedTime * 2 + 1000 * count)
      easing.dampC(child.color, dist > displacement * 1.1 ? 'white' : [col / 2, col * 2, col * 4], 0.1, delta)
      easing.damp3(
        child.position,
        dist > displacement ? oPos : vec.copy(oPos).add(dir.multiplyScalar(distInv * intensity + mov / 4)),
        0.2,
        delta
      )
    }
  })

  return (
    <>
      <BlueWorleyNoiseMesh />

      <Instances key={stride} limit={stride * stride * stride} castShadow receiveShadow frames={Infinity} ref={ref}>
        <roundedBoxGeometry args={[1, 1, 1, 2, 0.15]} />
        <meshLambertMaterial />
        {Array.from({ length: stride * stride * stride }, (v, n) => (
          <Instance key={n} position={positions[n]} />
        ))}
      </Instances>
    </>
  )
}
