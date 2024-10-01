import React, { useEffect } from 'react';


import { FullCanvas } from '@/app/components/3d/FullCanvas';
import useCanvasStore from '@/stores/useCanvasStore';
import { Canvas } from '@react-three/fiber';
import { BlurCursor } from './BlurCursor';
import { ViewCanvas } from '@/app/components/3d/ViewCanvas';
import { View } from '@react-three/drei';
import { ParticleLogo } from './particle-logo';

export const CoreCanvas = () => {
    const canvasRef = useCanvasStore( ( state: any ) => state.canvasRef );
    const addView = useCanvasStore( ( state: any ) => state.addView );
    const removeView = useCanvasStore( ( state: any ) => state.removeView );

    useEffect( () => {
        addView( { id: 'view1' } );
        addView( { id: 'view2' } );
        return () => {
            removeView( 'view1' );
            removeView( 'view2' );
        };
    }, [ addView, removeView ] );

    return (
        <>
            <Canvas>
                <View index={ 0 } track={ canvasRef }>
                    <ViewCanvas id="view1">
                        <BlurCursor theme="dark" />
                    </ViewCanvas>
                </View>
                <View index={ 1 } track={ canvasRef }>
                    <ViewCanvas id="view2">
                        <ParticleLogo />
                        <BlurCursor theme="light" />
                    </ViewCanvas>
                </View>
            </Canvas>

        </>
    );
};

