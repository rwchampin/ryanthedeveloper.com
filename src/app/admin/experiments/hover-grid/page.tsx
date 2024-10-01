'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Torus, Icosahedron, Cone, Dodecahedron, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { TweenMax, Expo, Quad } from 'gsap';

const radians = degrees => degrees * Math.PI / 180;
const distance = ( x1, y1, x2, y2 ) =>
    Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) );
const map = ( value, start1, stop1, start2, stop2 ) => {
    return ( value - start1 ) / ( stop1 - start1 ) * ( stop2 - start2 ) + start2;
};

const LilShape = ( { geometry, rotationX = 0, rotationY = 0, rotationZ = 0 } ) => {
    const meshRef = useRef<any>();
    useFrame( () => {
        if ( !meshRef.current ) return;
        meshRef.current.rotation.x = rotationX;
        meshRef.current.rotation.y = rotationY;
        meshRef.current.rotation.z = rotationZ;
    } );
    return <mesh ref={ meshRef } geometry={ geometry } />;
};

const Cube = () => <LilShape geometry={ new THREE.BoxGeometry( 0.6, 0.6, 0.6 ) } rotationX={ radians( -45 ) } rotationY={ radians( 45 ) } />;
const TorusShape = () => <LilShape geometry={ new THREE.TorusGeometry( 0.3, 0.12, 30, 200 ) } rotationX={ radians( 90 ) } />;
const IcosahedronShape = () => <LilShape geometry={ new THREE.IcosahedronGeometry( 0.45 ) } />;
const ConeShape = () => <LilShape geometry={ new THREE.ConeGeometry( 0.4, 1, 30 ) } rotationX={ radians( 90 ) } />;
const DodecahedronShape = () => <LilShape geometry={ new THREE.DodecahedronGeometry( 0.5, 0 ) } />;

const Sceme = () => {
    const { scene, camera, gl } = useThree();
    const [ meshes, setMeshes ] = useState( [] );
    const [ mouse3D, setMouse3D ] = useState( new THREE.Vector2() );
    const raycaster = useRef( new THREE.Raycaster() );

    useEffect( () => {
        const handleResize = () => {
            // camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            gl.setSize( window.innerWidth, window.innerHeight );
        };

        const handleMouseMove = ( event ) => {
            setMouse3D( new THREE.Vector2(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                -( event.clientY / window.innerHeight ) * 2 + 1
            ) );
        };

        window.addEventListener( 'resize', handleResize );
        window.addEventListener( 'mousemove', handleMouseMove );

        return () => {
            window.removeEventListener( 'resize', handleResize );
            window.removeEventListener( 'mousemove', handleMouseMove );
        };
    }, [ camera, gl ] );

    useFrame( () => {
        raycaster.current.setFromCamera( mouse3D, camera );
        const intersects = raycaster.current.intersectObjects( scene.children );
        if ( intersects.length ) {
            const { x, z } = intersects[ 0 ].point;
            meshes.forEach( row => {
                row.forEach( mesh => {
                    mesh.rotation.z += radians( 0.5 );
                    mesh.rotation.y -= radians( 0.1 );
                    const mouseDistance = distance( x, z, mesh.position.x, mesh.position.z );
                    const y = map( mouseDistance, 5, 0, 0, 6 );
                    TweenMax.to( mesh.position, 0.3, { y: y < 1 ? 1 : y } );
                    const scaleFactor = mesh.position.y / 1.7;
                    const scale = scaleFactor < 1 ? 1 : scaleFactor;
                    TweenMax.to( mesh.scale, 0.3, { ease: Expo.easeOut, x: scale, y: scale, z: scale } );
                    TweenMax.to( mesh.rotation, 2, {
                        ease: Quad.easeOut,
                        x: map( mesh.position.y, -1, 1, radians( 180 ), mesh.rotation.x ),
                        z: map( mesh.position.y, -1, 1, radians( -90 ), mesh.rotation.z ),
                        y: map( mesh.position.y, -1, 1, radians( 45 ), mesh.rotation.y )
                    } );
                } );
            } );
        }
    } );

    return (
       <>
            <ambientLight intensity={ 1 } />
            <spotLight position={ [ 0, 27, 0 ] } intensity={ 1 } />
            <pointLight position={ [ 0, 10, -100 ] } color={ 0xe2a9e5 } />
            <pointLight position={ [ 100, 10, 0 ] } color={ 0x632c65 } />
            <pointLight position={ [ 20, 5, 20 ] } color={ 0x4b384c } />
            <Plane args={ [ 100, 100 ] } rotation={ [ -Math.PI / 2, 0, 0 ] } receiveShadow>
                <shadowMaterial />
            </Plane>
            <Cube />
            <TorusShape />
            <IcosahedronShape />
            <ConeShape />
            <DodecahedronShape />
      </>
    );
};

const Page = () => {
    return <Canvas>
        <Sceme />
    </Canvas>;
}
export default Page;