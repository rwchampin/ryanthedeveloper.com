"use client";
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import {
    getMaterials,
    getGeometries,
    getMaterial,
    getGeometry,
} from '@/lib/utils/utils3d';
import { MeshReflectorMaterial } from '@react-three/drei';
export const MovingLight = (props) => { 
  const lightRef = useRef<any>();
  const lightSphereRef = useRef<any>();
  const prevPositionRef = useRef<any>({ x: 0, y: 0 });
  const prevTimeRef = useRef<any>(0);
  const calculatedPositionRef = useRef<any>({ x: 0, y: 0 });
  const calculatedScaleRef = useRef<any>({ x: 1, y: 1 });

    const movingLightControls = useControls( 'Follower Light', {
    intensity: 1,
    color: 'darkred',
        // multiplier: {
        //     value: 200,
        //     onChange: ( value ) => {
        //         if ( !lightRef.current || !lightSphereRef.current ) return
        //         // lightRef.current.color.multiplyScalar( value )
        //         // lightSphereRef.current.intensity.multiplyScalar( value )

        //         // lightSphereRef.current.material.color.multiplyScalar( value )
        //     }
        // },
        material: {
            value: 'standard',
            options: getMaterials(),
            onChange: ( value ) => {
                if ( !lightSphereRef.current ) return
                lightSphereRef.current.material = getMaterial( value )
            }
        },
        geometry: {
            value: 'icosahedron',
            options: getGeometries(),
            onChange: ( value ) => {
                if ( !lightSphereRef.current ) return
                lightSphereRef.current.geometry = getGeometry( value )
            }
        }
    } );

    const debounce = ( func, wait ) => {
        let timeout;
        return function executedFunction( ...args ) {
            const later = () => {
                clearTimeout( timeout );
                func( ...args );
            };
            clearTimeout( timeout );
            timeout = setTimeout( later, wait );
        };
    }
    useEffect( () => {

    const handlePointerMove = (event) => {
      const currentTime = performance.now() / 1000; // Convert to seconds
      const deltaTime = currentTime - prevTimeRef.current;

      const currentPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      // Calculate velocity
      const velocity = {
        x: (currentPosition.x - prevPositionRef.current.x) / deltaTime,
        y: (currentPosition.y - prevPositionRef.current.y) / deltaTime,
      };

      // Calculate direction magnitude
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

      // Normalize direction
      const direction = {
        x: velocity.x / speed,
        y: velocity.y / speed,
      };

      // Apply scaling based on velocity
      const scaleFactor = 1 + speed * 0.1; // Adjust the multiplier as needed
      calculatedScaleRef.current = {
        x: 1 + Math.abs(direction.x) * scaleFactor,
        y: 1 + Math.abs(direction.y) * scaleFactor,
      };

      // Update calculated position
      calculatedPositionRef.current = currentPosition;

      // Update previous position and time
      prevPositionRef.current = currentPosition;
      prevTimeRef.current = currentTime;
    };

        const debouncedHandlePointerMove = debounce( handlePointerMove, 100 );
        window.addEventListener( 'pointermove', debouncedHandlePointerMove );

    return () => {
        window.removeEventListener( 'pointermove', debouncedHandlePointerMove );
    };
  }, []);

  useFrame(() => {
    if (lightRef.current && lightSphereRef.current) {
      // Apply the calculated position and scale
      lightRef.current.position.x = calculatedPositionRef.current.x;
      lightRef.current.position.y = calculatedPositionRef.current.y;
      lightRef.current.scale.set(
        calculatedScaleRef.current.x,
        calculatedScaleRef.current.y,
        1
      );
      lightSphereRef.current.position.x = calculatedPositionRef.current.x;
        lightSphereRef.current.position.y = calculatedPositionRef.current.y;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={movingLightControls.intensity}
      color={movingLightControls.color}
    >
      <mesh
        ref={lightSphereRef}
        >
              <icosahedronGeometry
                  args={ [

                      32,
                  ] } />
              <meshBasicMaterial
                  color={ 0xff0000 }
              />
              {/* <MeshReflectorMaterial
                  blur={ [ 0, 0 ] } // Blur ground reflections (width, height), 0 skips blur
                  mixBlur={ 0 } // How much blur mixes with surface roughness (default = 1)
                  mixStrength={ 1 } // Strength of the reflections
                  mixContrast={ 1 } // Contrast of the reflections
                  resolution={ 256 } // Off-buffer resolution, lower=faster, higher=better quality, slower
                  mirror={ 0 } // Mirror environment, 0 = texture colors, 1 = pick up env colors
                  depthScale={ 0 } // Scale the depth factor (0 = no depth, default = 0)
                  minDepthThreshold={ 0.9 } // Lower edge for the depthTexture interpolation (default = 0)
                  maxDepthThreshold={ 1 } // Upper edge for the depthTexture interpolation (default = 0)
                  depthToBlurRatioBias={ 0.25 } // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
                  distortion={ 1 } // Amount of distortion based on the distortionMap texture
                  distortionMap={ null } // The red channel of this texture is used as the distortion map. Default is null
                  //   debug={ 0 } // Depending on the assigned value, one of the following channels is shown:
                  //0 = no debug
                  //1 = depth channel
                  //2 = base channel
                  //3 = distortion channel
                  //4 = lod channel (based on the roughness)
                  //
                  reflectorOffset={ -0.2 } // Offsets the virtual camera that projects the reflection. Useful when the reflective surface is some distance from the object's origin (default = 0)
              /> */}
          </mesh>
    </pointLight>
  );
};