"use client";
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Html,
    Instance,
    Instances,
    Merged
} from '@react-three/drei';
import * as THREE from 'three';

// import { OrbitControls } from '@react-three/drei';
// import { shaderMaterial } from '@react-three/drei';
// import { TextureLoader } from 'three';

// const VertexShader = `
//   varying vec2 vUv;
//   varying vec3 vNormal;
//   varying vec3 vViewPosition;

//   void main() {
//     vUv = uv;
//     vNormal = normal;
//     vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//     vViewPosition = -mvPosition.xyz;
//     gl_Position = projectionMatrix * mvPosition;
//   }
// `;

// const FragmentShader = `
//   uniform sampler2D tMatCap;
//   varying vec2 vUv;
//   varying vec3 vNormal;
//   varying vec3 vViewPosition;

//   void main() {
//     vec3 normal = normalize(vNormal);
//     vec3 viewPosition = normalize(vViewPosition);
//     vec3 r = reflect(viewPosition, normal);
//     vec4 base = vec4(0.5, 0.5, 0.5, 1.0);
//     gl_FragColor = base;
//   }
// `;

// const CustomShaderMaterial = shaderMaterial(
//     {
//         tMatCap: new TextureLoader().load( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/764435/thuglee-chrome-02c.jpg' ),
//         time: 0,
//     },
//     VertexShader,
//     FragmentShader
// );

const ClearGlassySphere = () => {
    return (
        <mesh position={ [ -5, 0, 0 ] }>
            <sphereGeometry args={ [ 1, 32, 32 ] } />
            <meshPhysicalMaterial
                color="white"
                roughness={ 0 }
                transmission={ 1 }
                thickness={ 0.5 }
                envMapIntensity={ 1 }
                clearcoat={ 1 }
                clearcoatRoughness={ 0 }
            />
        </mesh>
    );
};

const MatteSphere = () => {
    return (
        <mesh position={ [ -2, 0, 0 ] }>
            <sphereGeometry args={ [ 1, 32, 32 ] } />
            <meshLambertMaterial color="gray" />
        </mesh>
    );
};

const StandardMaterialSphere = () => {
    return (
        <mesh position={ [ 1, 0, 0 ] }>
            <sphereGeometry args={ [ 1, 32, 32 ] } />
            <meshStandardMaterial color="blue" roughness={ 0.5 } metalness={ 0.5 } />
        </mesh>
    );
};

const GlowingSphere = () => {
    return (
        <mesh position={ [ 4, 0, 0 ] }>
            <sphereGeometry args={ [ 1, 32, 32 ] } />
            <meshBasicMaterial color="yellow" emissive="yellow" emissiveIntensity={ 1 } />
        </mesh>
    );
};



// extend( { CustomShaderMaterial } );
const calculateNumberOfRisers = ( width, height, cameraFar, cameraPosition ) => {
    const screenArea = width * height;
    const depthFactor = cameraFar - cameraPosition.z;
    const baseDensity = 0.009; // Adjust this value to control the density of risers
    const numberOfRisers = Math.floor( screenArea * depthFactor * baseDensity );
    return numberOfRisers;
};

const v3 = new THREE.Vector3();
const geometry = new THREE.IcosahedronGeometry( 1, 4 );
const material = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    emissive: 0x888888,
    emissiveIntensity: 10.5,
    shininess: 100,
    specular: 0xffffff,
} );

const Riser = ( geometryType, materialType ) => {
    const ref = useRef();
    const {
        viewport,
        camera
    } = useThree();
    const spawnPos = useMemo( () => {
        return [
            THREE.MathUtils.randFloat( -viewport.width / 2, viewport.width / 2 ),
            THREE.MathUtils.randFloat( -viewport.height / 2, viewport.height / 2 ),
            THREE.MathUtils.randFloat( camera.position.z + 1, camera.far ),
        ];
    }, [] );
    const modifier = useMemo( () => Math.random(), [] );
    const rotationSpeed = useMemo( () => Math.random() * 0.02 + 0.02, [] );
    const rotationAngle = useRef( Math.random() * 360 );

    return <Instance ref={ ref } geometry={ geometryType } material={ materialType } position={ spawnPos } rotation={ [ 0, 0, rotationAngle.current ] } scale={ [ modifier, modifier, modifier ] } />;
}
export const Rising = () => {
    const meshArray = useRef( [] );
    const risers = useRef( [] );
    // const spawnCount = useRef( 0 );
    const counter = useRef( 0 );
    const { scene, camera, viewport } = useThree();
    const count = useMemo( () => calculateNumberOfRisers( viewport.width, viewport.height, camera.far, camera.position ), [ viewport.width, viewport.height, camera.far, camera.position ] );


    // const generateCube = () => {
    //     const size = Math.random();
    //     const geometry = new THREE.SphereGeometry( 1, 12, 12 );
    //     const mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x0000ff } ) );
    //     mesh.position.set( 0, -50, Math.random() * 150 - 400 );
    //     return mesh;
    // };

    useFrame( () => {
        risers.current.forEach( ( riser ) => {
            riser.position.y += 5 * riser.modifier;
            if ( riser.position.y > 300 ) {
                riser.position.y = -100;
            }
        } );

        // spawnCount.current++;
        // if ( spawnCount.current === 1 ) {
        //     const mesh = generateCube();
        //     scene.add( mesh );
        //     mesh.angle = 0;
        //     mesh.angleMultiplier = 0.02 * Math.random() + 0.02;
        //     mesh.spiralCounter = 0;
        //     mesh.spiralMultiplier = 0.02 * Math.random() + 0.1;
        //     meshArray.current.push( mesh );
        //     spawnCount.current = 0;
        // }


    } );
    const meshList = [
        <ClearGlassySphere />,
        <MatteSphere />,
        <StandardMaterialSphere />,
        <GlowingSphere />,
    ];

    const randomMesh = meshList[ Math.floor( Math.random() * meshList.length ) ];
    return (
        <>
            {/* <Merged meshes={ meshList }>
                { ( meshes ) => (
                    <>
                        { meshes.map( ( mesh, index ) => (
                            <mesh key={ index } position={ [ 0, 0, 0 ] }>
                                { mesh }
                            </mesh>
                        ) ) }
                    </>
                ) }
            </Merged> */}
            { Array.from( { length: count } ).map( ( _, i ) => (
                <mesh
                    key={ i }
                    geometry={ geometry.clone() }
                    material={ material }
                    position={ [
                        Math.random() * 600 - 300,
                        Math.random() * 600 - 300,
                        -600 * Math.random() + 150,
                    ] }
                    rotation={ [ 0, 0, Math.random() * 360 ] }
                    ref={ ( ref ) => {
                        if ( ref ) {
                            ref.modifier = Math.random();
                            risers.current.push( ref );
                        }
                    } }
                />
            ) ) }
        </>
    );
};



