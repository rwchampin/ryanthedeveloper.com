"use client";


import Link from 'next/link';
import { ParticleLogo } from './particle-logo';

// import { Swirl } from './Swirl';
import { Canvas } from '@react-three/fiber';
// import MovingClouds from './MovingClouds';



type LogoProps = {
  // type: any
  showSparks?: boolean;
  className?: string;
};

export const Logo = ( { showSparks, className }: any ) => {
  return (
    <Link
      className="block top-3 left-3 h-[150px] w-[300px] text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
      href="/"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 100 }}
        className=' !h-[150px] !w-[300px]'>


        <ParticleLogo />  
            {/* <Sparkles
              color={ theme === 'dark' ? 'white' : 'black' }
              count={ 500 }
              size={ 0.091 }
              opacity={ 1 }
            /> */}
          {/* <MovingClouds /> */ }
            {/* <Swirl /> */ }


      </Canvas>
    </Link>
  );
  // }
};
