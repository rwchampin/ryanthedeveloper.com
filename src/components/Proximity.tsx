"use client";
import gsap from "gsap";
import Link from 'next/link';
import React, { useEffect } from 'react';

interface ProximityProps {
    children: React.ReactNode;
    distance?: number;
    cb?: () => void;

    href: string;
    className: string;
    triggerCallback?: boolean;
}
const coidedWithSiblings = (element: HTMLElement, siblings: HTMLCollection) => {
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i] as HTMLElement;
        if (sibling === element) continue;

        const bbox = element.getBoundingClientRect();
        const siblingBbox = sibling.getBoundingClientRect();

        const collides =
            bbox.left < siblingBbox.right &&
            bbox.right > siblingBbox.left &&
            bbox.top < siblingBbox.bottom &&
            bbox.bottom > siblingBbox.top;

        if (collides) {
            // return the sibiings position 
            return {
                x: siblingBbox.left + siblingBbox.width / 2,
                y: siblingBbox.top + siblingBbox.height / 2,
            };
        }
        
    }

    return false;
}
export default function Proximity({ children, cb, href, className, triggerCallback=true }:ProximityProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    // parent - check if eeent has siblings
    const parent = ref.current?.parentElement;

    // we se this to see if eeent collides with siblings
    const siblings = parent?.children;
    const [active, setActive] = React.useState(false);
    const hoverDistance = 110;
    const breakAwayDistance = 50;
    const hoverDistanceSquared = hoverDistance * hoverDistance;

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => setActive(entry.isIntersecting),
            { threshold: 0.5 }
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };

    }, []);

    useEffect(() => {
        if (active) {
            setActive(false);
            console.log('Element is visible');
            const mouseMove = (e: MouseEvent) => {
                const x = e.clientX;
                const y = e.clientY;

                const bbox = ref.current?.getBoundingClientRect();

                if (!bbox) return;

                const cx = bbox.left + bbox.width / 2;
                const cy = bbox.top + bbox.height / 2;

                const dx = x - cx;
                const dy = y - cy;

                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < hoverDistanceSquared ) {

                    ref.current.classList.add('shadow-lg');

                    if (triggerCallback && cb) cb();


                    gsap.to(ref.current, {
                        x: e.clientX - cx,
                        y: e.clientY - cy,
                        z: 20,
                        scale: 1.1,
                        zIndex: 1,
                        duration: 0.5,
                        ease: 'power4.out',
                    });
                    return;
                }

               
                // ref.current.classList.remove('shadow-lg');
                gsap.to(ref.current, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    zIndex: 0,
                    duration: 0.85,
                    ease: 'elastic.out',
                });


            }
            window.addEventListener('mousemove', mouseMove);
        }

        if (!active) {
            console.log('Element is not visible');
            window.removeEventListener('mousemove', () => {});
        }

        return () => {
            if (active) window.removeEventListener('mousemove', () => {});
        };

    }, [active, triggerCallback, cb, hoverDistanceSquared]);

  return (
    
      <Link  href={href} className={className}>
          {children}
    </Link>
  )
}




// import { useThree } from '@react-three/fiber';
// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import ParticleSystem from './ParticleSystem';

// const Logo = () => {
//   const ref = useRef();
//   const particleSystemRef = useRef();
//   const { raycaster, camera, viewport, scene } = useThree();
//   const { nodes } = useGLTF('black-logo.glb');
//   const logo = nodes.Scene.children[0];
//   const mouse = new THREE.Vector2();
//   const prevMouse = new THREE.Vector2();

//   // Paint the logo with vertex colors
//   useEffect(() => {
//     if (ref.current) {
//       const geometry = ref.current.geometry;
//       const count = geometry.attributes.position.count;
//       const colors = new Float32Array(count * 3);

//       for (let i = 0; i < count; i++) {
//         colors[i * 3] = Math.random();
//         colors[i * 3 + 1] = Math.random();
//         colors[i * 3 + 2] = Math.random();
//       }

//       geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
//     }
//   }, []);

//   // Scale the logo to fit the viewport
//   useEffect(() => {
//     if (ref.current) {
//       const bbox = new THREE.Box3().setFromObject(ref.current);
//       const logoSize = new THREE.Vector3();
//       bbox.getSize(logoSize);
      
//       const maxScale = Math.min(viewport.width / logoSize.x, viewport.height / logoSize.y) * 0.8; // 0.8 to leave some padding
//       ref.current.scale.set(maxScale, maxScale, maxScale);
//     }
//   }, [viewport.width, viewport.height]);

//   const onMouseMove = (event) => {
//     prevMouse.copy(mouse);
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//   };

//   useEffect(() => {
//     window.addEventListener('mousemove', onMouseMove, false);
//     return () => {
//       window.removeEventListener('mousemove', onMouseMove, false);
//     };
//   }, []);

//   const handlePointerOver = (event) => {
//     if (particleSystemRef.current) {
//       const intersects = raycaster.intersectObject(ref.current, true);
//       if (intersects.length > 0) {
//         const pointOfIntersection = intersects[0].point;
//         const mouseDirection = new THREE.Vector3(mouse.x - prevMouse.x, mouse.y - prevMouse.y, 0).normalize();
        
//         // Emit particles from the breaking point
//         particleSystemRef.current.createParticles(pointOfIntersection, mouseDirection);
//       }
//     }
//   };

//   return (
//     <>
//       <Center>
//         <AccumulativeShadows temporal frames={100} scale={10}>
//           <RandomizedLight amount={8} position={[5, 5, -10]} />
//         </AccumulativeShadows>
//         <primitive
//           position={[0, 0, 0]}
//           ref={ref}
//           object={logo}
//           receiveShadow
//           castShadow
//           onPointerOver={handlePointerOver} // Add pointer over event
//         />
//         <ParticleSystem ref={particleSystemRef} />
//       </Center>
//     </>
//   );
// };

// useGLTF.preload('/black-logo.glb');
// export default Logo;
