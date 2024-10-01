// Layout components
"use client";
import { usePathname } from 'next/navigation';
import { useContext,   } from 'react';;
import routes from 'routes';
import {
  getActiveNavbar,
  getActiveRoute,
} from '@/lib/utils/navigation';
import { ConfiguratorContext } from 'contexts/ConfiguratorContext';
import React from 'react';
import { Portal } from '@chakra-ui/portal';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';
import NavbarAuth from '@/components/navbar/NavbarAuth';

export default function Dashboard({   children }: { 
  children: React.ReactNode,
  create?: React.ReactNode
 }) {
  // states and functions
 const mini = false;
  const pathname = usePathname();
  // if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  const context:any = useContext(ConfiguratorContext);
  const { 
   theme, 
   setTheme, 
   setMini,
    open,
     setOpen, 
     hovered, 
     setHovered
   } = context;
  return (
    <div className="flex gap-5 h-full w-full bg-background-100 dark:bg-background-900">
      <Sidebar
        routes={routes}
        open={open}
        setOpen={() => setOpen(!open)}
        hovered={hovered}
        setHovered={setHovered}
        mini={mini}
        variant="admin"
      />
      {/* Navbar & Main Content */}
      <div className="flexh-full w-full font-inter dark:bg-navy-900">
       
        {/* Main Content */}
        <main
          className={` pt-5 flex-none transition-all dark:bg-navy-900 md:pr-2 bg-backgroun-300 dark:bg-background-900`}>
           <NavbarAuth
            onOpenSidenav={() => setOpen(!open)}
            brandText={getActiveRoute(routes, pathname)}
            secondary={getActiveNavbar(routes, pathname)}
            theme={theme}
            setTheme={setTheme}
            hovered={hovered}
            mini={mini}
            setMini={setMini}
            openDashboard={open}
            />
          {/* Routes */}
          <div>
            <Portal>
              <Navbar
                onOpenSidenav={() => setOpen(!open)}
                brandText={getActiveRoute(routes, pathname)}
                secondary={getActiveNavbar(routes, pathname)}
                theme={theme}
                setTheme={setTheme}
                hovered={hovered}
                mini={mini}
                setMini={setMini}
                openDashboard={open}
                z={10}
              />
            </Portal>
            <div className="mx-auto flex-auto min-h-screen p-2 !pt-[100px] md:p-2">
              
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
