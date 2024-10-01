"use client";
import { useRef, useEffect,useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';


const vertexShader = /* glsl */ ` 
    attribute float size;
    varying vec3 vColor;
    varying vec2 vUv;
    void main() {
        vColor = color;

        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = /* glsl */ `
    varying vec3 vColor;    
    uniform sampler2D pointTexture;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    }
`;
export const useFbo = (options:any) => {

    const { gl, scene, camera, size } = options;
    const { width, height } = size;

    /**
     * fBO
     * */
    const texture = new THREE.WebGLRenderTarget(width, height);

    /**
     * setup
     */
    const renderTarget = new THREE.WebGLRenderTarget(width, height);
    const composer = new EffectComposer(gl, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const mousePosition = useRef(new THREE.Vector2(0, 0));
    const prevMousePosition = useRef(new THREE.Vector2(0, 0));
    const mouseVelocity = useRef(new THREE.Vector2(0, 0));
    const mouseAcceleration = useRef(new THREE.Vector2(0, 0));
    const uniforms = useMemo(() => {
        return {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(width, height) },
            mouse: { value: new THREE.Vector2(0, 0) },
            velocity: { value: new THREE.Vector2(0, 0) },
            acceleration: { value: new THREE.Vector2(0, 0) }
        }
    });

    /**
     * set camera
    * */
    camera.position.z = 1;
    camera.aspect = width / height;
    camera.near = 0.1;
    camera.far = 10;
    camera.updateProjectionMatrix();

    /**
     * setup
     */
    addObjects(scene);

    /**
     * render
     */
    const renderScene = () => {
        gl.setRenderTarget(null);
        gl.render(scene, camera);

        composer.render();


    }

    /**
     * add objects
     */
    function addObjects(scene:THREE.Scene) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    /**
     *  events
     * */
    const mouseMove = (event:MouseEvent) => {
        const x = (event.clientX / width) * 2 - 1;
        const y = -(event.clientY / height) * 2 + 1;

    }

    /**
     * animate
     */

    useFrame(() => {

    });

}