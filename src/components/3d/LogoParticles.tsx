"use client";
"use client";
"use client";
// import React, { useEffect } from "react";
// import Stats from "stats.js";
// import * as THREE from "three";

// export default function Page() {
//   useEffect(() => {
//     function runSketch() {
//       var renderer,
//         renderTarget1,
//         renderTarget2,
//         sceneShader,
//         sceneScreen,
//         camera,
//         clock,
//         stats,
//         uniforms,
//         materialScreen;

//       init();
//       animate();

//       /*
//        * Initializes the sketch
//        */
//       function init() {
//         // Initialize the WebGL renderer
//         renderer = new THREE.WebGLRenderer();
//         renderer.setPixelRatio(window.devicePixelRatio);
//         renderer.setSize(window.innerWidth, window.innerHeight);
//         renderer.setClearColor(new THREE.Color(0, 0, 0));

//         // Add the renderer to the sketch container

//         document.body.appendChild(renderer.domElement);

//         // Initialize the render targets
//         var size = renderer.getDrawingBufferSize();
//         var options = {
//           minFilter: THREE.NearestFilter,
//           magFilter: THREE.NearestFilter,
//           format: THREE.RGBAFormat,
//           type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
//             ? THREE.HalfFloatType
//             : THREE.FloatType,
//         };
//         renderTarget1 = new THREE.WebGLRenderTarget(
//           size.width,
//           size.height,
//           options
//         );
//         renderTarget2 = new THREE.WebGLRenderTarget(
//           size.width,
//           size.height,
//           options
//         );

//         // Initialize the scenes
//         sceneShader = new THREE.Scene();
//         sceneScreen = new THREE.Scene();

//         // Initialize the camera
//         camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

//         // Initialize the clock
//         clock = new THREE.Clock(true);

//         // Initialize the statistics monitor and add it to the sketch container
//         stats = new Stats();
//         stats.dom.style.cssText = "";
//         document.body.appendChild(stats.dom);
//         // Create the plane geometry
//         var geometry = new THREE.PlaneGeometry(2, 2);

//         // Define the shader uniforms
//         uniforms = {
//           u_time: {
//             type: "f",
//             value: 0.0,
//           },
//           u_frame: {
//             type: "f",
//             value: 0.0,
//           },
//           u_resolution: {
//             type: "v2",
//             value: new THREE.Vector2(
//               window.innerWidth,
//               window.innerHeight
//             ).multiplyScalar(window.devicePixelRatio),
//           },
//           u_mouse: {
//             type: "v2",
//             value: new THREE.Vector2(
//               0.7 * window.innerWidth,
//               window.innerHeight
//             ).multiplyScalar(window.devicePixelRatio),
//           },
//           u_texture: {
//             type: "t",
//             value: null,
//           },
//         };

//         // Create the shader material
//         var materialShader = new THREE.ShaderMaterial({
//           uniforms: uniforms,
//           vertexShader: document.getElementById("vertexShader").textContent,
//           fragmentShader: document.getElementById("fragmentShader").textContent,
//         });

//         // Create the screen material
//         materialScreen = new THREE.MeshBasicMaterial();

//         // Create the meshes and add them to the scenes
//         var meshShader = new THREE.Mesh(geometry, materialShader);
//         var meshScreen = new THREE.Mesh(geometry, materialScreen);
//         sceneShader.add(meshShader);
//         sceneScreen.add(meshScreen);

//         // Add the event listeners
//         window.addEventListener("resize", onWindowResize, false);
//         renderer.domElement.addEventListener("mousemove", onMouseMove, false);
//         renderer.domElement.addEventListener("touchstart", onTouchMove, false);
//         renderer.domElement.addEventListener("touchmove", onTouchMove, false);
//       }

//       /*
//        * Animates the sketch
//        */
//       function animate() {
//         requestAnimationFrame(animate);
//         render();
//         stats.update();
//       }

//       /*
//        * Renders the sketch
//        */
//       function render() {
//         // Start rendering an empty screen scene on the first render target
//         if (!uniforms.u_texture.value) {
//           materialScreen.visible = false;
//           renderer.render(sceneScreen, camera, renderTarget1);
//           materialScreen.visible = true;
//         }

//         // Update the uniforms
//         uniforms.u_time.value = clock.getElapsedTime();
//         uniforms.u_frame.value += 1.0;
//         uniforms.u_texture.value = renderTarget1.texture;

//         // Render the shader scene
//         renderer.render(sceneShader, camera, renderTarget2);

//         // Update the screen material texture
//         materialScreen.map = renderTarget2.texture;
//         materialScreen.needsUpdate = true;

//         // Render the screen scene
//         renderer.render(sceneScreen, camera);

//         // Swap the render targets
//         var tmp = renderTarget1;
//         renderTarget1 = renderTarget2;
//         renderTarget2 = tmp;
//       }

//       /*
//        * Updates the renderer size and the uniforms when the window is resized
//        */
//       function onWindowResize(event) {
//         // Update the renderer
//         renderer.setSize(window.innerWidth, window.innerHeight);

//         // Update the render targets
//         var size = renderer.getDrawingBufferSize();
//         renderTarget1.setSize(size.width, size.height);
//         renderTarget2.setSize(size.width, size.height);

//         // Update the uniforms
//         uniforms.u_resolution.value
//           .set(window.innerWidth, window.innerHeight)
//           .multiplyScalar(window.devicePixelRatio);
//         uniforms.u_texture.value = null;

//         // Update the screen material texture
//         materialScreen.map = null;
//         materialScreen.needsUpdate = true;
//       }

//       /*
//        * Updates the uniforms when the mouse moves
//        */
//       function onMouseMove(event) {
//         // Update the mouse uniform
//         uniforms.u_mouse.value
//           .set(event.pageX, window.innerHeight - event.pageY)
//           .multiplyScalar(window.devicePixelRatio);
//       }

//       /*
//        * Updates the uniforms when the touch moves
//        */
//       function onTouchMove(event) {
//         event.preventDefault();

//         // Update the mouse uniform
//         uniforms.u_mouse.value
//           .set(
//             event.touches[0].pageX,
//             window.innerHeight - event.touches[0].pageY
//           )
//           .multiplyScalar(window.devicePixelRatio);
//       }
//     }

//     // window on load event
//     window.onload = runSketch;

//     // window resize event
//     window.onresize = runSketch;

//     return () => {
//       window.onload = null;
//       window.onresize = null;
//     };
//   }, []);
//   return null;
// }

import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import Stats from "stats.js";
import * as THREE from "three";

const Sketch = () => {
  const { gl, size } = useThree();
  const rendererRef = useRef();
  const sceneShaderRef = useRef(new THREE.Scene());
  const sceneScreenRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  const clockRef = useRef(new THREE.Clock(true));
  const statsRef = useRef(new Stats());
  const uniformsRef = useRef({
    u_time: { type: "f", value: 0.0 },
    u_frame: { type: "f", value: 0.0 },
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(size.width, size.height).multiplyScalar(
        window.devicePixelRatio
      ),
    },
    u_mouse: {
      type: "v2",
      value: new THREE.Vector2(0.7 * size.width, size.height).multiplyScalar(
        window.devicePixelRatio
      ),
    },
    u_texture: { type: "t", value: null },
  });
  const [renderTargets, setRenderTargets] = useState({
    renderTarget1: null,
    renderTarget2: null,
  });

  useEffect(() => {
    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
        ? THREE.HalfFloatType
        : THREE.FloatType,
    };
    setRenderTargets({
      renderTarget1: new THREE.WebGLRenderTarget(
        size.width,
        size.height,
        options
      ),
      renderTarget2: new THREE.WebGLRenderTarget(
        size.width,
        size.height,
        options
      ),
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const materialShader = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent,
    });
    const materialScreen = new THREE.MeshBasicMaterial();

    const meshShader = new THREE.Mesh(geometry, materialShader);
    const meshScreen = new THREE.Mesh(geometry, materialScreen);
    sceneShaderRef.current.add(meshShader);
    sceneScreenRef.current.add(meshScreen);

    statsRef.current.dom.style.cssText = "";
    document.getElementById("sketch-stats").appendChild(statsRef.current.dom);

    const onResize = () => {
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      renderTargets.renderTarget1.setSize(size.width, size.height);
      renderTargets.renderTarget2.setSize(size.width, size.height);
      uniformsRef.current.u_resolution.value
        .set(window.innerWidth, window.innerHeight)
        .multiplyScalar(window.devicePixelRatio);
      uniformsRef.current.u_texture.value = null;
      materialScreen.map = null;
      materialScreen.needsUpdate = true;
    };

    const onMouseMove = (event) => {
      uniformsRef.current.u_mouse.value
        .set(event.pageX, window.innerHeight - event.pageY)
        .multiplyScalar(window.devicePixelRatio);
    };

    window.addEventListener("resize", onResize);
    gl.domElement.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("resize", onResize);
      gl.domElement.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl, size, renderTargets]);

  useFrame(() => {
    if (
      rendererRef.current &&
      renderTargets.renderTarget1 &&
      renderTargets.renderTarget2
    ) {
      const { renderTarget1, renderTarget2 } = renderTargets;

      uniformsRef.current.u_time.value = clockRef.current.getElapsedTime();
      uniformsRef.current.u_frame.value += 1.0;
      uniformsRef.current.u_texture.value = renderTarget1.texture;

      rendererRef.current.render(
        sceneShaderRef.current,
        cameraRef.current,
        renderTarget2
      );

      const materialScreen = sceneScreenRef.current.children[0].material;
      materialScreen.map = renderTarget2.texture;
      materialScreen.needsUpdate = true;

      rendererRef.current.render(sceneScreenRef.current, cameraRef.current);

      setRenderTargets({
        renderTarget1: renderTarget2,
        renderTarget2: renderTarget1,
      });

      statsRef.current.update();
    }
  });

  return null;
};

export const LogoParticles= () => (
  <>
    <Canvas>
      <OrthographicCamera makeDefault ref={cameraRef} position={[0, 0, 1]} />
      <Sketch />
      <OrbitControls />
    </Canvas>
    <div id="sketch-stats"></div>
    <script id="vertexShader" type="x-shader/x-vertex">
      {`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `}
    </script>
    <script id="fragmentShader" type="x-shader/x-fragment">
      {`
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform sampler2D u_texture;
        varying vec2 vUv;
        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          vec3 color = texture2D(u_texture, vUv).rgb;
          gl_FragColor = vec4(color, 1.0);
        }
      `}
    </script>
  </>
);

 
