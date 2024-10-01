"use client";
import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, DotScreen } from '@react-three/postprocessing'
import { Playground } from '@/components/playground';
const NUM_INSTANCES = 2000

function InstancedBoxes( { movingLightRef } ) {
    const meshRef = useRef<any>()
    const { mouse, viewport } = useThree()

    const instances = useMemo( () => {
        const temp = []
        for ( let i = 0; i < NUM_INSTANCES; i++ ) {
            temp.push( {
                position: new THREE.Vector3( THREE.MathUtils.randFloatSpread( 200 ), THREE.MathUtils.randFloatSpread( 200 ), THREE.MathUtils.randFloatSpread( 200 ) ),
                scale: THREE.MathUtils.randFloat( 0.2, 1 ),
                scaleZ: THREE.MathUtils.randFloat( 0.1, 1 ),
                velocity: new THREE.Vector3( THREE.MathUtils.randFloatSpread( 2 ), THREE.MathUtils.randFloatSpread( 2 ), THREE.MathUtils.randFloatSpread( 2 ) ),
                attraction: 0.03 + THREE.MathUtils.randFloat( -0.01, 0.01 ),
                vlimit: 1.2 + THREE.MathUtils.randFloat( -0.1, 0.1 ),
            } )
        }
        return temp
    }, [] )

    const dummy = useMemo( () => new THREE.Object3D(), [] )
    const target = useMemo( () => new THREE.Vector3(), [] )

    useEffect( () => {
        if ( meshRef.current ) {
            for ( let i = 0; i < NUM_INSTANCES; i++ ) {
                const { position, scale, scaleZ } = instances[ i ]
                dummy.position.copy( position )
                dummy.scale.set( scale, scale, scaleZ )
                dummy.updateMatrix()
                meshRef.current.setMatrixAt( i, dummy.matrix )
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [ instances, dummy ] )

    useFrame( ( state ) => {
        if ( movingLightRef.current ) {
            movingLightRef.current.position.copy( target )
        }
        target.set( mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0 )


        for ( let i = 0; i < NUM_INSTANCES; i++ ) {
            const { position, scale, scaleZ, velocity, attraction, vlimit } = instances[ i ]
            const dummyV = new THREE.Vector3().copy( target ).sub( position ).normalize().multiplyScalar( attraction )
            velocity.add( dummyV ).clampScalar( -vlimit, vlimit )
            position.add( velocity )
            dummy.position.copy( position )
            dummy.scale.set( scale, scale, scaleZ )
            dummy.lookAt( dummy.position.clone().add( velocity ) )
            dummy.updateMatrix()
            meshRef.current.setMatrixAt( i, dummy.matrix )
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    } )

    return (
        <instancedMesh ref={ meshRef } args={ [ null, null, NUM_INSTANCES ] }>
            <boxGeometry args={ [ 2, 2, 10 ] } />
            <meshStandardMaterial transparent opacity={ 0.9 } metalness={ 0.8 } roughness={ 0.5 } />
        </instancedMesh>
    )
}

// function Scene() {
//     const movingLightRef = useRef<any>()
//     return (
//         <>
//             <ambientLight color="#808080" />
//             <pointLight color="#ff6000" />
//             <pointLight color="#0060ff" intensity={ 0.5 } />
//             <pointLight color="#ff6000" intensity={ 0.5 } position={ [ 100, 0, 0 ] } />
//             <pointLight color="#0000ff" intensity={ 0.5 } position={ [ -100, 0, 0 ] } />
//             <InstancedBoxes movingLightRef={ movingLightRef } />
//             <pointLight ref={ movingLightRef } color="#0060ff" intensity={ 0.5 } />

//         </>
//     )
// }

export default function Page() {
    return (
          <div className="h-full w-full rounded-[20px] bg-white"> 
        <Playground />
        </div>
        // <Canvas 
        // className='fixed inset-0 h-full w-full rounded-lg'
        // camera={ { position: [ 0, 0, 3 ] } }>
        //     <Scene />
        //     <OrbitControls />
        //     <EffectComposer>
        //         <Bloom threshold={ 0 } strength={ 1 } radius={ 0 } />
        //         <DotScreen radius={ 1 } scatter={ 0 } />
        //     </EffectComposer>
        // </Canvas>
    )
}