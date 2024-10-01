'use client';
import React, { ReactNode, Suspense } from 'react';
import 'styles/Contact.css';
// import '@asseinfo/react-kanban/dist/styles.css';
// import 'styles/Plugins.css';
import 'styles/MiniCalendar.css';
import { useRouter } from 'next/router';
import 'styles/index.css';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ConfiguratorContext } from 'contexts/ConfiguratorContext';
import NavbarAuth from 'components/navbar/NavbarAuth';
import { Canvas } from '@react-three/fiber';
import { Jarvis } from '@/components/Jarvis';
import { createClient } from '@/lib/utils/supabase/client';
import { usePathname } from 'next/navigation';
const _NoSSR = ({ children }) => <React.Fragment>{children}</React.Fragment>;

const NoSSR = dynamic(() => Promise.resolve(_NoSSR), {
  ssr: false,
});
// Dynamic imports
const FullPageCanvas = dynamic(() => import('@/components/3d/FullPageCanvas').then((mod) => mod.FullPageCanvas), {
  ssr: false,
})
const Fuck = dynamic(() => import('@/components/3d/Fuck').then((mod) => mod.Fuck), {
  ssr: false
})
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function AppWrappers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mini, setMini] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showJarvis, setShowJarvis] = useState(false);
  const [theme, setTheme] = useState<any>({
    '--background-100': '#c0c0c0',
    '--background-900': '#333',
    '--shadow-100': 'rgba(112, 144, 176, 0.08)',
    '--color-50': '#E9E3FF',
    '--color-100': '#C0B8FE',
    '--color-200': '#A195FD',
    '--color-300': '#8171FC',
    '--color-400': '#7551FF',
    '--color-500': '#422AFB',
    '--color-600': '#3311DB',
    '--color-700': '#2111A5',
    '--color-800': '#190793',
    '--color-900': '#11047A',
  }); // When the theme state changes, this effect will update the CSS variables in the document's root element

  React.useEffect(() => {
    const supabase = createClient();
   const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'SIGNED_IN') {
      const id = session?.user.id;
      supabase.from('users').select('role').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) {
          console.log('error', error.message);
          return;
        }
        debugger
        if (data.role === 'admin' || data.role === 'super_admin') {
          setShowJarvis(true);
        }
      }).catch((error) => {
        console.log('error', error.message);
        throw new Error(error.message);
      })
       console.log('User signed in:', session);
       // Redirect to a protected route or perform any action
      setShowJarvis(true);
     } else if (event === 'SIGNED_OUT') {
      debugger
       console.log('User signed out');
       // Redirect to the sign-in page or perform any action
        setShowJarvis(false);
     }
   });
   // Cleanup subscription on unmount
    return () => {
     authListener.subscription.unsubscribe();
   };
}, [pathname]);


  React.useEffect(() => {
    let color;
    for (color in theme) {
      document.documentElement.style.setProperty(color, theme[color]);
    }
    //eslint-disable-next-line
  }, [theme]);
  return (
    
    <NoSSR>
        
      <ConfiguratorContext.Provider
        value={{
          mini,
          setMini,
          theme,
          setTheme,
          hovered,
          setHovered,
          contrast,
          setContrast,
        }}
      >
            {/* <View className="flex h-screen w-screen fixed top-0 left-0 z-[-1]">
          <Suspense fallback={null}>
            <FullPageCanvas />
            <Common  />
          </Suspense>
        </View>    */}

         
  {showJarvis}
     {children} 
      </ConfiguratorContext.Provider>
    </NoSSR>
  );
}
