"use client"

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useTexture, Effects } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, SSAO, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uCurlFreq;
  uniform vec3 uMousePosition;
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vDistance;
  
  // Simplex 3D Noise
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
// return a vec3

    return vec3(0.0,0.0,0.0);
  }
  
  vec3 snoiseVec3(vec3 x) {
    float s  = snoise(x);
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
}
  
  vec3 curlNoise( vec3 p ){
    const float e = .1;
    vec3 dx = vec3( e   , 0.0 , 0.0 );
    vec3 dy = vec3( 0.0 , e   , 0.0 );
    vec3 dz = vec3( 0.0 , 0.0 , e   );
  
    vec3 p_x0 = snoiseVec3( p - dx );
    vec3 p_x1 = snoiseVec3( p + dx );
    vec3 p_y0 = snoiseVec3( p - dy );
    vec3 p_y1 = snoiseVec3( p + dy );
    vec3 p_z0 = snoiseVec3( p - dz );
    vec3 p_z1 = snoiseVec3( p + dz );
  
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  
    return   vec3( x , y , z )  ;
  }
  
  void main() {
    vColor = color;
    vec3 curl = curlNoise(position * uCurlFreq + uTime * 0.1);
    vec3 newPosition = position + curl * 0.1;
    
    vec3 toMouse = uMousePosition - newPosition;
    float distanceToMouse = length(toMouse);
    vDistance = distanceToMouse;
    
    if (distanceToMouse < 2.0) {
      newPosition -= normalize(toMouse) * (2.0 - distanceToMouse) * 0.5;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
 
  varying vec3 vColor;
  varying float vDistance;
  uniform sampler2D pointTexture;
  
  void main() {
    vec4 color = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
    float alpha = smoothstep(0.0, 2.0, vDistance);
    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`

function Particles({ count = 5000 }) {
  const mesh = useRef()
  const light = useRef()
  const [texture] = useTexture(['/img/particle.png'])
  const { mouse, viewport } = useThree()

  const [uniforms] = useState({
    uTime: { value: 0 },
    uCurlFreq: { value: 0.25 },
    uMousePosition: { value: new THREE.Vector3() },
    pointTexture: { value: texture }
  })

  const [particles, setParticles] = useState(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 20,
        (Math.random() - 0.5) * 20
      )
      const color = new THREE.Color(Math.random() < 0.25 ? 0x00ffff : 0x000000)
      const size = Math.random() * 0.5 + 0.1
      temp.push({ position, color, size })
    }
    return temp
  })

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    particles.forEach((particle, i) => {
      positions.set([particle.position.x, particle.position.y, particle.position.z], i * 3)
      colors.set([particle.color.r, particle.color.g, particle.color.b], i * 3)
      sizes[i] = particle.size
    })
    return [positions, colors, sizes]
  }, [particles])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    uniforms.uTime.value = time
    uniforms.uMousePosition.value.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    )
  })

  return (
    <>
      <pointLight ref={light} distance={50} intensity={1.5} color="white" />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <ShaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </>
  )
}

function MouseFollower() {
  const mesh = useRef()
  const { mouse, viewport } = useThree()

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.set(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0
      )
    }
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="white" />
      <pointLight distance={6} intensity={2} color="white" />
    </mesh>
  )
}

export default function Advanced() {
  return (
     <>
        <OrbitControls enablePan={false} enableZoom={false} />
        <Particles />
        <MouseFollower />
        <EffectComposer enableNormalPass={true}>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <SSAO samples={31} radius={0.1} intensity={20} luminanceInfluence={0.6} color={new THREE.Color(0x000000)} />
          <ToneMapping
            adaptive={true}
            resolution={256}
            middleGrey={0.6}
            maxLuminance={16.0}
            averageLuminance={1.0}
            adaptationRate={1.0}
          />
        </EffectComposer>
      </>
  )
}