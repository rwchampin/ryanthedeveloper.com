import * as THREE from 'three';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { shaderMaterial } from '@react-three/drei';

// Create the custom shader material using shaderMaterial from drei
const blueWorleyNoiseMaterial =  {
  uniforms:{
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() }
  },
  // Vertex Shader
  vertexShader: `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader (adapted from ShaderToy code)
  fragmentShader:`
  uniform float iTime;
  uniform vec3 iResolution;
  varying vec2 vUv;

  vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4)); // Example Color Animation
    fragColor = vec4(col, 1.0);
  }

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
  `
};


// The Shader Component
const BlueWorleyNoiseMesh = () => {
  const shaderRef = useRef<any>();

  useFrame(({ clock, size }) => {
    shaderRef.current.iTime = clock.getElapsedTime();
    shaderRef.current.iResolution.set(size.width, size.height, 1);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
       ref={shaderRef} 
       uniforms={blueWorleyNoiseMaterial.uniforms}
        vertexShader={blueWorleyNoiseMaterial.vertexShader}
        fragmentShader={blueWorleyNoiseMaterial.fragmentShader}
      />
    </mesh>
  );
};
 
export {
    BlueWorleyNoiseMesh,
}