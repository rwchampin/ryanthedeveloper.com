"use client";
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
    SpotLight,
    PerformanceMonitor,
    OrbitControls, Stats, ScreenSpace, Resize
} from '@react-three/drei';
import { EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import { useControls } from 'leva';
import { UnderConstructionLogo } from './UnderConstructionLogo';
import { Risers } from './Risers';
import { Floor } from './Floor';
import { MovingLight } from './MovingLight';
import { CoreCamera } from '../CoreCamera';
import { Perf } from 'r3f-perf';
const Scene = () => {
    const { viewport } = useThree();
    const { theme, setTheme } = useTheme();

    const bgColorSettings = useControls('background', {
        show: true,
        color: '#000000',
    });

    const fogControls = useControls('fog', {
        showFog: true,
        fogColor: theme === 'dark' ? '#000000' : '#ffffff',
        fogNear: 0.1,
        fogFar: 103,
    });

    const toneMappingControls = useControls('tone mapping', {
        show: true,
        adaptive: true,
        adaptiveTolerance: 0.6,
        adaptiveLuminance: 0.6,
        linear: false,
        linearWhitePoint: 1.0,
        linearExposure: 1.0,
    });

    const vignetteControls = useControls('vignette', {
        eskil: false,
        offset: 0.1,
        darkness: 1.1,
    });

    const sunRefSettings = useControls('sun', {
        show: true,
        position: [0, 0, 5],
        angle: 0.3,
        penumbra: 1,
        intensity: 1,
        castShadow: true,
        distance: 100,
    });

    const directionalLightSettings = useControls('directional light', {
        show: true,
        intensity: 1,
        color: '#ffffff',
        castShadow: true,
    });

    const sceneElements = useMemo(() => {
        return (
            <>
                {bgColorSettings.show && <color attach="background" args={[bgColorSettings.color]} />}
                {fogControls.showFog && <fog attach="fog" args={[fogControls.fogColor, fogControls.fogNear, fogControls.fogFar]} />}

                <ScreenSpace depth={ 5 }>
                <UnderConstructionLogo />
                </ScreenSpace>
                <MovingLight />
                <Risers />
                <Floor
                viewPort={viewport}
                 />

            </>
        );
    }, [bgColorSettings.show, bgColorSettings.color, fogControls.showFog, fogControls.fogColor, fogControls.fogNear, fogControls.fogFar]);

    return sceneElements;
};

export const UnderConstruction = () => {
    const [ dpr, setDpr ] = useState( 2 );

    const settings = useControls('preset', {
        preset: {
            options: ['night', 'warehouse', 'city', 'sunset', 'dawn', 'forest', 'park', 'lobby', 'studio'],
            value: 'night',
        },
    });

    const toneMappingSettings = useControls('tone mapping', {
        show: true,
        adaptive: true,
        adaptiveTolerance: 0.6,
        adaptiveLuminance: 0.6,
        linear: false,
        linearWhitePoint: 1.0,
        linearExposure: 1.0,
    });
    const vignetteSettings = useControls( 'vignette', {
        eskil: false,
        offset: 0.1,
        darkness: 1.1,
    } );


    const sunRef = useRef<any>( null );

    const postProcessing = useMemo( () => {

        return (
            <EffectComposer enableNormalPass={ true }>
                <ToneMapping 
                adaptive={toneMappingSettings.adaptive}
                />
                {<Vignette eskil={vignetteSettings.eskil} offset={vignetteSettings.offset} darkness={vignetteSettings.darkness} />}
            </EffectComposer>
        );
    }, [toneMappingSettings.adaptive, toneMappingSettings.linearWhitePoint, toneMappingSettings.linearExposure, vignetteSettings.eskil, vignetteSettings.offset, vignetteSettings.darkness]);

    return (
        <Canvas
            className="ui !w-screen !h-screen !fixed top-0 left-0"
            gl={{ antialias: false, alpha: false }}
            shadows
            dpr={ dpr }
        >   
            <PerformanceMonitor factor={ 1 } onChange={ ( { factor } ) => setDpr( Math.floor( 0.5 + 1.5 * factor, 1 ) ) } />


            {/* <CoreCamera /> */ }
            <Scene />
            <OrbitControls />
            <Resize>
            <mesh ref={sunRef} position={[0, 0, -5]}>
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial color={'yellow'} />
            </mesh>
            </Resize>
            {postProcessing}

            <Stats showPanel={ 1 } className="stats" />


            <Perf />
        </Canvas>
    );
};
