"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, Vector2, Vector3, MathUtils, Object3D, Color } from 'three';
import { useTexture, Plane } from '@react-three/drei';

const conf = {
    size: 10,
    images: [
        { src: 'https://assets.codepen.io/33787/img1.jpg' },
        { src: 'https://assets.codepen.io/33787/img2.jpg' },
        { src: 'https://assets.codepen.io/33787/img3.jpg' },
        { src: 'https://assets.codepen.io/33787/img4.jpg' }
    ]
};

const limit = ( val, min, max ) => ( val < min ? min : val > max ? max : val );
const lerp = ( a, b, x ) => a + x * ( b - a );

const AnimatedPlane = ( { texture, size, anim, screen } ) => {
    const meshRef = useRef();
    const [ uProgress ] = useState( { value: 0 } );
    const [ uvScale ] = useState( new Vector2() );
    const [ bGeometry, setBGeometry ] = useState( null );

    useEffect( () => {
        const initGeometry = () => {
            const geometry = new Plane( size, size );
            setBGeometry( geometry );
        };

        initGeometry();
    }, [ size ] );

    useEffect( () => {
        if ( meshRef.current ) {
            meshRef.current.material.onBeforeCompile = ( shader ) => {
                shader.uniforms.progress = uProgress;
                shader.uniforms.uvScale = { value: uvScale };
                shader.vertexShader = `
          uniform float progress;
          uniform vec2 uvScale;

          attribute vec3 offset;
          attribute vec3 rotation;
          attribute vec2 uvOffset;

          mat3 rotationMatrixXYZ(vec3 r)
          {
            float cx = cos(r.x);
            float sx = sin(r.x);
            float cy = cos(r.y);
            float sy = sin(r.y);
            float cz = cos(r.z);
            float sz = sin(r.z);

            return mat3(
               cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz,
              -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz,
                    sy,               -sx * cy,                cx * cy
            );
          }
        ` + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace( '#include <uv_vertex>', `
          #include <uv_vertex>
          vUv = vUv * uvScale + uvOffset;
        `);

                shader.vertexShader = shader.vertexShader.replace( '#include <project_vertex>', `
          mat3 rotMat = rotationMatrixXYZ(progress * rotation);
          transformed = rotMat * transformed;

          vec4 mvPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
          #endif

          mvPosition.xyz += progress * offset;

          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;
        `);
            };
        }
    }, [ meshRef, uProgress, uvScale ] );

    return (
        <instancedMesh ref={ meshRef } args={ [ bGeometry, null, 1 ] }>
            <meshBasicMaterial attach="material" map={ texture } side={ DoubleSide } transparent />
        </instancedMesh>
    );
};

export const ParticleSlideShow = () => {
    const { size, viewport } = useThree();
    const textures = useTexture( conf.images.map( img => img.src ) );
    const [ progress, setProgress ] = useState( 0 );
    const [ targetProgress, setTargetProgress ] = useState( 0 );
    const planesRef = useRef<any>( null );
    const mouse = useRef<any>( new Vector2() );

    useEffect( () => {
        const handleMouseMove = ( { clientX, clientY } ) => {
            mouse.current.x = ( clientX / size.width ) * 2 - 1;
            mouse.current.y = -( clientY / size.height ) * 2 + 1;
        };

        const handleWheel = ( e ) => {
            e.preventDefault();
            if ( e.deltaY > 0 ) {
                setTargetProgress( prev => limit( prev + 1 / 20, 0, conf.images.length - 1 ) );
            } else {
                setTargetProgress( prev => limit( prev - 1 / 20, 0, conf.images.length - 1 ) );
            }
        };

        const handleClick = ( e ) => {
            if ( e.clientY < size.height / 2 ) {
                navPrevious();
            } else {
                navNext();
            }
        };

        const handleKeyUp = ( e ) => {
            if ( e.keyCode === 37 || e.keyCode === 38 ) {
                navPrevious();
            } else if ( e.keyCode === 39 || e.keyCode === 40 ) {
                navNext();
            }
        };

        window.addEventListener( 'mousemove', handleMouseMove );
        window.addEventListener( 'wheel', handleWheel );
        window.addEventListener( 'click', handleClick );
        window.addEventListener( 'keyup', handleKeyUp );

        return () => {
            window.removeEventListener( 'mousemove', handleMouseMove );
            window.removeEventListener( 'wheel', handleWheel );
            window.removeEventListener( 'click', handleClick );
            window.removeEventListener( 'keyup', handleKeyUp );
        };
    }, [ size ] );

    const navNext = () => {
        setTargetProgress( prev => {
            if ( Number.isInteger( prev ) ) return limit( prev + 1, 0, conf.images.length - 1 );
            return limit( Math.ceil( prev ), 0, conf.images.length - 1 );
        } );
    };

    const navPrevious = () => {
        setTargetProgress( prev => {
            if ( Number.isInteger( prev ) ) return limit( prev - 1, 0, conf.images.length - 1 );
            return limit( Math.floor( prev ), 0, conf.images.length - 1 );
        } );
    };

    useFrame( () => {
        if ( !planesRef.current ) return;
        const pr = planesRef.current.children;
        const progress1 = lerp( progress, targetProgress, 0.1 );
        const pdiff = progress1 - progress;
        if ( pdiff === 0 ) return;

        const p0 = progress % 1;
        const p1 = progress1 % 1;
        if ( ( pdiff > 0 && p1 < p0 ) || ( pdiff < 0 && p0 < p1 ) ) {
            const i = Math.floor( progress1 );
            pr[ 0 ].material.map = textures[ i ];
            pr[ 1 ].material.map = textures[ i + 1 ];
        }

        setProgress( progress1 );
        pr[ 0 ].material.opacity = 1 - ( progress1 % 1 );
        pr[ 1 ].material.opacity = progress1 % 1;
    } );

    return (
        <group ref={ planesRef }>
            <AnimatedPlane texture={ textures[ 0 ] } size={ conf.size } anim={ 1 } screen={ viewport } />
            <AnimatedPlane texture={ textures[ 1 ] } size={ conf.size } anim={ 2 } screen={ viewport } />
        </group>
    );
};


