"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { useControls, folder } from 'leva';

export const CoreCamera = ({ follow = null }) => {
    const cameraRef = useRef();
    const { set, size } = useThree();

  const {
    type,
    position,
    lookAt,
    fadeIn,
    fadeOut,
    near,
    far,
    fov,
    zoom,
      orthographicProps,
    rotationSpeed,
    damping,
    lerpFactor
  } = useControls({
    Camera: folder({
      type: {
        value: 'perspective',
        options: ['perspective', 'orthographic']
      },
      position: {
        value: [0, 0, 5],
        step: 0.1
      },
      lookAt: {
        value: [0, 0, 0],
        step: 0.1
      },
      fadeIn: false,
      fadeOut: false,
      near: {
        value: 0.1,
        min: 0.1,
        max: 100,
        step: 0.1
      },
      far: {
        value: 1000,
        min: 100,
        max: 10000,
        step: 100
      },
      fov: {
        value: 75,
        min: 1,
        max: 180,
        step: 1
      },
      zoom: {
        value: 1,
        min: 0.1,
        max: 10,
        step: 0.1
      },
      rotationSpeed: {
        value: 0,
        min: -1,
        max: 1,
        step: 0.01
      },
      damping: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01
      },
      lerpFactor: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01
      }
    }),
    Orthographic: folder({
      left: {
        value: -1,
        step: 0.1
      },
      right: {
        value: 1,
        step: 0.1
      },
      top: {
        value: 1,
        step: 0.1
      },
      bottom: {
        value: -1,
        step: 0.1
      }
    })
  });

  const [fadeOpacity, setFadeOpacity] = useState(fadeIn ? 0 : 1);

  const { opacity } = useSpring({
    opacity: fadeOpacity,
    config: { duration: 1000 }
  });

    useEffect( () => {
        if ( cameraRef.current ) {
            set( { camera: cameraRef.current } );
        }
    }, [ set ] );

  useEffect(() => {
    if (fadeIn) {
      setFadeOpacity(1);
    }
    if (fadeOut) {
      setFadeOpacity(0);
    }
  }, [fadeIn, fadeOut]);

  useFrame((state, delta) => {
    if (cameraRef.current) {
      // Rotation
      if (rotationSpeed !== 0) {
        cameraRef.current.rotation.y += rotationSpeed * delta;
      }

      // Follow target
      if (follow) {
        const targetPosition = follow.current ? follow.current.position : follow;
        cameraRef.current.position.lerp(
          new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + 5,
            targetPosition.z + 10
          ),
          lerpFactor
        );
      }

      // Look at target
      const lookAtVector = new THREE.Vector3(...lookAt);
      cameraRef.current.lookAt(lookAtVector);

      // Apply damping to camera movement
      if (damping > 0) {
        cameraRef.current.position.lerp(new THREE.Vector3(...position), damping);
      } else {
        cameraRef.current.position.set(...position);
      }
    }
  });

  const CameraComponent = type === 'orthographic' ? OrthographicCamera : PerspectiveCamera;

  return (
      <a.group ref={ cameraRef } opacity={ opacity }>
      <CameraComponent
        makeDefault
        near={near}
        far={far}
        fov={fov}
        zoom={zoom}
              { ...( type === 'orthographic' ? orthographicProps : {} ) }
      />
    </a.group>
  );
};

