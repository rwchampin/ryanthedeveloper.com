"use client";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const BlackSmokeSphere = () => { 
    const meshRef = useRef<any>(null);

    const vertex = /* glsl */ `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
    `;

    const fragment = /* glsl */ `
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform sampler2D u_noise;
    uniform sampler2D u_env;
  
    // ... (keep all the existing constants and functions)

    void main() {
        rotmat = rotationMatrix(vec3(0., 1., 0.), u_time);
      
        vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0);
        vec2 uv = (2.0*gl_FragCoord.xy/u_resolution.xy - 1.0)*aspect;
      
        uv *= 1. + dot(uv, uv) * 0.4;
      
        movement = vec3(0.);
      
        vec3 lookAt = vec3(0., 0., 0.);
        vec3 camera_position = vec3(0., 0., -2.0);
      
        vec3 forward = normalize(lookAt-camera_position);
        vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
        vec3 up = normalize(cross(forward,right));

        float FOV = 0.4;

        vec3 ro = camera_position; 
        vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
      
        const float clipNear = 0.0;
        const float clipFar = 16.0;
        float field = 0.;
        float dist = rayMarching(ro, rd, clipNear, clipFar, field);
        
        if (dist >= clipFar) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);  // Transparent background
            return;
        }

        vec3 sp = ro + rd*dist;

        vec3 sceneColor = lighting(sp, camera_position, 0, dist, field, rd);

        // Apply some transparency based on the smoke density
        float alpha = smoothstep(0.0, 0.5, field);
        
        gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), alpha);
    }
    `;

    const [texture, environment] = useTexture([
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/env_lat-lon.png'
    ]);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    environment.wrapS = THREE.RepeatWrapping;
    environment.wrapT = THREE.RepeatWrapping;

    const uniforms:any = useMemo(() => ({
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_noise: { type: "t", value: texture },
        u_env: { type: "t", value: environment },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    }), [texture, environment]);

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true
    });
    material.extensions.derivatives = true;

    useEffect(() => {
        if(!window) return;
        const handleResize = () => {
            uniforms.u_resolution.value.x = window.innerWidth;
            uniforms.u_resolution.value.y = window.innerHeight;
        };
        handleResize();

        const handleMouseMove = (e: any) => {
            let ratio = window.innerHeight / window.innerWidth;
            uniforms.u_mouse.value.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
            uniforms.u_mouse.value.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1;
            e.preventDefault();
        }
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [uniforms]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.u_time.value += 0.0081;
            
            // Update mesh position to follow mouse
            meshRef.current.position.x = state.mouse.x * 2;
            meshRef.current.position.y = state.mouse.y * 2;
        }
    });

    return (
        <mesh ref={meshRef} material={material}>
            <planeGeometry args={[2, 2]} />
        </mesh>
    );
}