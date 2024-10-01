"use client";
import dynamic from "next/dynamic";
import { useState, useRef, Suspense, useEffect, } from "react";
import { Canvas, } from "@react-three/fiber";
import { coreCanvasControls } from "app/controls/CoreCanvasControls";

import { useTheme } from "next-themes";


// import { useUiStore } from "@/stores/use-ui-store";

const round = ( num: number, decimal: number ) => {
  const p = Math.pow( 10, decimal );
  return Math.round( num * p ) / p;
};


const PerformanceMonitor = dynamic( () => import( "@react-three/drei" ).then( ( mod ) => mod.PerformanceMonitor ), {
  ssr: false
} );
const Lighting = dynamic( () => import( "@/app/components/3d/Lighting" ).then( ( mod ) => mod.Lighting ), {
  ssr: false
} );

const OrbitControls = dynamic( () => import( "@react-three/drei" ).then( ( mod ) => mod.OrbitControls ), {
  ssr: false
} );

const Perf = dynamic( () => import( "r3f-perf" ).then( ( mod ) => mod.Perf ), {
  ssr: false
} );

export function FullCanvas( { children, position = "fixed" }: { children: React.ReactNode, position?: string } ) {
  const [ pointerEvents, setPointerEvents ] = useState( false );
  const canvasRef = useRef<any>( null )
  // const coreCamera = useRef<any>( null )
  const pointerEventsRef = useRef<any>( null )
  // const rendererRef = useRef<any>(null)


  // const debugMode = useRef( useDebugStore.getState().debugMode );
  // const uiLayer = useUiStore((state) => state.uiLayer);
  const {
    showBackground,
    showCursor,
    showLighting,
    lightBackgroundColor,
    darkBackgroundColor,
    showCamera
  } = coreCanvasControls()
  const [ dpr, setDpr ] = useState( 2 );


  const { theme } = useTheme()
  // const activeUiLayer = useUiStore((state) => state.uiLayer);
  // const setActiveUiLayer = useUiStore((state) => state.setActiveUiLayer);




  // useEffect(() => {
  //   const unsubscribe = useUiStore.subscribe((state) => state.activeUiLayer, console.log("activeUiLayer", activeUiLayer));
  //   return () => {
  //     unsubscribe();
  //   };
  // }, [activeUiLayer]);
  const getColor = () => {
    return theme === 'dark' ? darkBackgroundColor : lightBackgroundColor;
  };


  return (
    <div
      ref={ pointerEventsRef }
      className={ `h-full w-full fixed h-screen w-screen relative pointer-events-trigger ${ pointerEvents ? 'pointer-events-auto' : 'pointer-events-none' }` }

    >
      <Canvas
        ref={ canvasRef }
        dpr={ dpr }
        shadows
        camera={ {
          position: [ 0, 0, 1 ],
          near: 0.1,
          far: 10000,
          fov: 60,
          zoom: 1,
        } }
        gl={ {
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        } }
        className={ `${ pointerEvents ? "pointer-events-auto" : "pointer-events-none"
          } core-canvas !absolute top-0 left-0 !w-full !h-full !z-[99999999999]  bg-red-200` }

      >
        {/* { showCamera &&
        <CoreCamera ref={ coreCamera } /> } */}

        <axesHelper args={ [ 599 ] } />

        {/* <color attach="background" args={ [ "#000" ] } /> */ }
        {/* /={ [ "#000", 0, 100 ] } /> */ }
        {/* <AdaptiveEvents />
      <AdaptiveDpr pixelated />
      <Suspense fallback={ null }> */}

        {/* { debugMode && <axesHelper args={ [ 599 ] } /> }
        { debugMode && <PerformanceMonitor onChange={ ( { factor } ) => setDpr( round( 0.5 + 1.5 * factor, 1 ) ) } /> }
        <PostEffects />
        { debugMode && <Perf /> }
        { debugMode && <OrbitControls /> }
        { showLighting && <Lighting /> }
      </Suspense> */}

        {/* <color attach="background" args={ [ 0x000000 ] } />
      <SpotLight position={ [ 0, 2, 0 ] } color={ 0xff0000 } intensity={ 100 } distance={ 100 } angle={ Math.PI / 4 } penumbra={ 0.05 } castShadow /> */}
        {/* {showLighting && <Lighting />} */ }
        { children }
      </Canvas>
    </div>
  );
}