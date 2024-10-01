import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Icosahedron, Sphere, Box } from "@react-three/drei";

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shapes = [Icosahedron, Sphere, Box];

const easeInQuad = (t) => t * t; // Quadratic ease-in function

export const Risers = () => {
  const meshRefs = useRef([]);
    //   const dustRefs = useRef([]);
    const { viewport, size, camera } = useThree();

    // const getRandomPosInViewport = ( pos ) => {
    //     // pos canbe center or edges
    //     const { width, height, getCurrentViewport } = viewport;
    //     const v = getCurrentViewport( camera, new THREE.Vector3( 0, 0, 0 ), size )
    //     debugger;
    // };
    // getRandomPosInViewport( 'center' );
  const meshes = useMemo(() => {
    return new Array(50).fill(null).map((_, i) => {
      const Shape = shapes[getRandomInt(0, shapes.length - 1)];
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2, // Closer to the center
          -1 - Math.random() * 5, // Start below the viewport
        (Math.random() - 0.5) * 2 // Closer to the center
      );
      const distanceFromCenter = position.length();
      const speed = THREE.MathUtils.randFloat(0.000005, .01) * (1 - distanceFromCenter / 2); // Decrease speed near the center

      return {
        id: i,
        Shape,
        speed,
        position,
        initialY: position.y, // Store initial Y for easing
          targetY: viewport.height,
        scale: Math.random() * 0.1,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        isGlowing: Math.random() > 0.7, // Some meshes will glow
        progress: 0, // Keep track of progress for the easing curve
      };
    });
  }, []);

  // Update each frame
  useFrame((state, delta) => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      // Easing progression
      const meshData = meshes[i];
      meshData.progress += delta * meshData.speed;
      const easedProgress = easeInQuad(meshData.progress);

      // Calculate new position with easing
      mesh.position.y = THREE.MathUtils.lerp(meshData.initialY, meshData.targetY, easedProgress);

      // Reset when above the viewport
      if (mesh.position.y >= meshData.targetY) {
        meshData.progress = 0; // Reset progress
        mesh.position.y = meshData.initialY;
        // Keep x and z positions constant
      }

      // Optionally rotate the mesh
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;

      
    });
  });

   function generateGradient(colors, steps) {
  const result = [];
  const colorToVec3 = (color) => {
    // Convert color from hex to vec3 (RGB values)
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const vec3ToColor = (vec3) => {
    // Convert vec3 (RGB values) back to hex color
    const r = Math.round(vec3[0] * 255).toString(16).padStart(2, '0');
    const g = Math.round(vec3[1] * 255).toString(16).padStart(2, '0');
    const b = Math.round(vec3[2] * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  // Loop through colors and interpolate
  for (let i = 0; i < colors.length - 1; i++) {
    const startColor = colorToVec3(colors[i]);
    const endColor = colorToVec3(colors[i + 1]);

    // Generate gradient steps between two colors
    for (let j = 0; j < steps; j++) {
      const t = j / (steps - 1);
      const r = startColor[0] + t * (endColor[0] - startColor[0]);
      const g = startColor[1] + t * (endColor[1] - startColor[1]);
      const b = startColor[2] + t * (endColor[2] - startColor[2]);
      result.push(vec3ToColor([r, g, b]));
    }
  }

  return result;
}

 


const colorHighlight = ['violett', 'purple', 'navy', 'blue', 'cyan'];
const colorShadow = ['darkgray', 'gray', 'black', 'lightgray', 'darkgray', 'black'];


  return (
    <>
      {/* <hemisphereLight 
        color={0x000000}
        groundColor={0x080820}
        intensity={0.5}
        position={[0, 5, 0]}
      /> */}
      {meshes.map((mesh, index) => {
        const { id, Shape, position, scale, rotation, isGlowing } = mesh;
        const colors = generateGradient(colorHighlight, meshes.length);
        const shadowColors = generateGradient(colorShadow, meshes.length);
        return (
          <group key={id} ref={(el) => (meshRefs.current[index] = el)} position={position} rotation={rotation}>
            <mesh scale={[scale, scale, scale]}>
                    <icosahedronGeometry args={ [ .1, 4 ] } />
              <meshStandardMaterial
               color={colors[index]}
               emissive={shadowColors[index]}
                emissiveIntensity={isGlowing ? 1 : 0} />
            </mesh>

                {/* <pointLight color={colors[index]}
               intensity={1} distance={5} /> */}

           
          </group>
        );
      })}
    </>
  );
};

