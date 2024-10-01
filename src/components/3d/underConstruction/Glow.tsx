"use client";
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { LayerMaterial, Depth } from 'lamina';
import { useControls } from 'leva';

export const Glow = ({ color=0xCCCCFF,detail, scale = 0.5, near = -2, far = 1.4 }) => {

    const settings = useControls({
        color: { value: 0x6495ED,
         onChange: (value) => { color = value } },
        scale: { value: 0.5, min: 0, max: 1, onChange: (value) => { scale = value } },
        near: { value: -2, min: -10, max: 0, onChange: (value) => { near = value } },
        far: { value: 1.4, min: 0, max: 10, onChange: (value) => { far = value } },
        detail: { value: 16, min: 3, max: 64 }
    })
  const bool = false
  if (bool) {
    return (
      <Billboard>
        <mesh>
          <circleGeometry args={[2 * scale, detail]} />
          <LayerMaterial
            transparent
            // depthWrite={false}
            blending={THREE.CustomBlending}
            blendEquation={THREE.AddEquation}
            blendSrc={THREE.SrcAlphaFactor}
            blendDst={THREE.DstAlphaFactor}>
            <Depth colorA={color} colorB="black" alpha={1} mode="normal" near={near * scale} far={far * scale} origin={[0, 0, 0]} />
            <Depth colorA={color} colorB="black" alpha={0.5} mode="add" near={-40 * scale} far={far * 1.2 * scale} origin={[0, 0, 0]} />
            <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-15 * scale} far={far * 0.7 * scale} origin={[0, 0, 0]} />
            <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-10 * scale} far={far * 0.68 * scale} origin={[0, 0, 0]} />
          </LayerMaterial>
        </mesh>
      </Billboard>
    )
  }

  return (
    <mesh>
      <circleGeometry args={[2 * scale, 16]} />
      <LayerMaterial
        transparent
        depthWrite={false}
        blending={THREE.CustomBlending}
        blendEquation={THREE.AddEquation}
        blendSrc={THREE.SrcAlphaFactor}
        blendDst={THREE.DstAlphaFactor}>
        <Depth colorA={color} colorB="black" alpha={1} mode="normal" near={near * scale} far={far * scale} origin={[0, 0, 0]} />
        <Depth colorA={color} colorB="black" alpha={0.5} mode="add" near={-40 * scale} far={far * 1.2 * scale} origin={[0, 0, 0]} />
        <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-15 * scale} far={far * 0.7 * scale} origin={[0, 0, 0]} />
        <Depth colorA={color} colorB="black" alpha={1} mode="add" near={-10 * scale} far={far * 0.68 * scale} origin={[0, 0, 0]} />
      </LayerMaterial>
    </mesh>
  )
}