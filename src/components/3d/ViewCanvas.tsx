"use client";
// ViewCanvas.tsx
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import useCanvasStore from '@/stores/useCanvasStore';
import { ParticleLogo } from './particle-logo';
import { BlurCursor } from './BlurCursor';

export const ViewCanvas = ( { id, children } ) => {
    const viewRef = useRef();
    // const { views, removeView } = useCanvasStore();

    // const view = views.find( ( view ) => view.id === id );

    // if ( !view ) return null;

    return (
        <div className="relative" style={ { width: '500px', height: '500px' } }>
            <View ref={ viewRef } >

                <Canvas>
                    { children }
                </Canvas>
            </View>
            {/* <button onClick={ () => removeView( id ) }>Remove View</button> */ }
        </div>
    );
};

