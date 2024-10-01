 "use client";
// import { Suspense, useState } from 'react';
import NavLink from 'components/link/NavLink';
import { FiAlignJustify } from 'react-icons/fi';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import { PlainLogo } from '@/components/3d/PlainLogo';
import { Canvas } from '@react-three/fiber';
// Custom components
import dropdownMain from '/public/img/layout/dropdownMain.png';
import {
  Suspense,
  useState,
} from 'react';
// Assets
import { GoChevronDown } from 'react-icons/go';
import { IRoute } from '@/app/types/navigation';
import routes from '@/routes';
import { Fuck } from '@/components/3d/Fuck'
import {
  OrbitControls
} from '@react-three/drei'
import dynamic from 'next/dynamic';


import InputField from '../fields/InputField';
import { ParticleLogo } from '../3d/particle-logo';
import { usePathname } from 'next/navigation';

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

const Bvh = dynamic(() => import( '@react-three/drei').then((mod) => mod.Bvh));
const ScreenSpace = dynamic(() => import( '@react-three/drei').then((mod) => mod.ScreenSpace));

function NavbarAuth(props: {
  onOpenSidenav: () => void;
  openDashboard: boolean;
  sidebarWidth?: any;
  [x: string]: any;
}) {
  const pathname = usePathname();
  // const { sidebarWidth, onOpenSidenav, ...rest } = props;
  const [openDashboard, setOpenDashboard] = useState(false);
  const [openNft, setOpenNft] = useState(false);
  const [openMain, setOpenMain] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const isProtected = pathname.includes('/admin') || pathname.includes('/dashboard');
  // menus object
  let authObject = getLinksCollapse('Authentication');
  let mainObject = getLinksCollapse('Main Pages');
  let dashboardsObject = getLinks('Dashboards');
  let nftsObject = getLinks('NFTs');
  // menus links
  function getLinks(routeName: string) {
    let foundRoute = routes.filter(function (route) {
      return route.items && route.name === routeName;
    });
    return foundRoute[0].items;
  }

  function getLinksCollapse(routeName: string) {
    let foundRoute = routes.filter(
      (route) => route.items && route.name === routeName,
    );
    // let foundLinks: { name: string; layout?: string; path: string; component?: () => JSX.Element }[];
    let foundLinks: IRoute[] = [];
    if (foundRoute[0].items) {
      for (let link = 0; link < foundRoute[0].items.length; link++) {
        foundLinks.push(foundRoute[0].items[link]);
      }
      return foundLinks;
    }

    return foundLinks;
  }
  const createDashboardsLinks = (routes: IRoute[]) => {
    return routes.map((link, key) => {
      return (
        <NavLink
          key={key}
          href={link.layout + link.path}
          styles={{ maxWidth: 'max-content' }}
        >
          <p className="text-sm font-medium text-gray-600">{link.name}</p>
        </NavLink>
      );
    });
  };
  const createNftsLinks = (routes: IRoute[]) => {
    return routes.map((link, key) => {
      return (
        <NavLink
          key={key}
          href={link.layout + link.path}
          styles={{ maxWidth: 'max-content' }}
        >
          <p className="text-sm font-medium text-gray-600">{link.name}</p>
        </NavLink>
      );
    });
  };
  const createMainLinks = (routes: IRoute[]) => {
    return routes.map((link, key) => {
      if (link.collapse === true) {
        return (
          <div className="flex w-max flex-col flex-wrap" key={key}>
            <div className="mb-2 flex cursor-default items-center">
              <p className="mr-auto text-sm font-bold uppercase text-navy-700 dark:text-white">
                {link.name}
              </p>
            </div>
            <div className="flex w-max flex-col flex-wrap gap-1 dark:text-white">
              {createMainLinks(link.items)}
            </div>
          </div>
        );
      } else {
        return (
          <NavLink key={key} href={link.layout + link.path}>
            <p className="text-sm text-gray-600">{link.name}</p>
          </NavLink>
        );
      }
    });
  };
  const createAuthLinks = (routes: IRoute[]) => {
    return routes.map((link, key) => {
      if (link.collapse === true) {
        return (
          <div className="flex w-max flex-col flex-wrap" key={key}>
            <div className="mb-1 flex cursor-default items-center">
              <p className="mr-auto text-sm font-bold uppercase text-navy-700 dark:text-white">
                {link.name}
              </p>
            </div>
            <div className="flex flex-col flex-wrap gap-1">
              {createAuthLinks(link.items)}
            </div>
          </div>
        );
      } else {
        return (
          <NavLink key={key} href={link.layout + link.path}>
            <p className="text-sm text-gray-600">{link.name}</p>
          </NavLink>
        );
      }
    });
  };

  return (
    <nav
   
      className=" rounded-lg bg-white z-[1] mx-auto p-3 font-black flex  w-full  items-center justify-between px-3 "
    >
      <aside className='flex flex-1 relative'>
      {/* horizon logo */}
    {!isProtected && (
     <Canvas 
     camera={{ position: [0, 0, 1] }}
      className='relative top-0 flex w-full  z-[999999999]    h-[150px] w-[300px] left-0 '>
    

   
        <PlainLogo  />
 
<ambientLight />
<pointLight position={[10, 10, 10]} />
<OrbitControls />
     
      <axesHelper args={[5]} />
      </Canvas>    
     
    )}
      </aside>
      <aside className='flex flex-2 justify-center gap-2 items-center'>
      {/* sidenav */}
      <span
      className="flex cursor-pointer text-xl text-white xl:hidden"
      // onClick={onOpenSidenav}
      >
      <FiAlignJustify className="h-5 w-5" />
      </span>
      </aside>
      <aside className='flex flex-2 justify-center flex-grow items-center !h-fill'>
      {/* menus */}
      <div className="mb-[6px] hidden items-center gap-3 xl:flex">
      {/* Dashboard submenu */}
      <div
        onMouseLeave={() => setOpenDashboard(false)}
        onMouseEnter={() => setOpenDashboard(true)}
        className="relative flex items-center gap-1 text-sm font-medium text-white"
      >
        <p className="cursor-pointer py-1">Dashboard</p>
        <p className="cursor-pointer">
        <GoChevronDown />
        </p>
        <div
        className={`duration-125 linear absolute -left-4 top-6 z-10 w-max origin-top-left py-2 transition-all ${
          openDashboard ? 'scale-100' : 'scale-0'
        }`}
        >
        <div
          className={`grid h-fit w-fit grid-cols-2 items-center gap-4 rounded-2xl bg-white px-3 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none`}
        >
          <div className="flex flex-col gap-2">
          {createDashboardsLinks(dashboardsObject)}
          </div>
          <div
          style={{ backgroundImage: `url(${dropdownMain.src})` }}
          className="h-28 w-28 rounded-xl bg-cover bg-no-repeat"
          />
        </div>
        </div>
      </div>
      {/* NFTs submenu */}
      <div
        onMouseLeave={() => setOpenNft(false)}
        onMouseEnter={() => setOpenNft(true)}
        className="relative flex items-center gap-1 text-sm font-medium text-white"
      >
        <p className="cursor-pointer py-1">NFTs</p>
        <p className="cursor-pointer">
        <GoChevronDown />
        </p>
        <div
        className={`duration-125 linear absolute -left-4 top-6 z-10 w-max origin-top-left py-2 transition-all ${
          openNft ? 'scale-100' : 'scale-0'
        }`}
        >
        <div
          className={`grid h-fit w-fit grid-cols-2 items-center gap-4 rounded-2xl bg-white px-3 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none`}
        >
          <div className="flex flex-col gap-2">
          {createNftsLinks(nftsObject)}
          </div>
          <div
          style={{ backgroundImage: `url(${dropdownMain.src})` }}
          className="h-28 w-28 rounded-xl bg-cover bg-no-repeat"
          />
        </div>
        </div>
      </div>
      {/* Main submenu */}
      <div
        onMouseLeave={() => setOpenMain(false)}
        onMouseEnter={() => setOpenMain(true)}
        className="relative flex items-center gap-1 text-sm font-medium text-white"
      >
        <p className="cursor-pointer py-1">Main Pages</p>
        <p className="cursor-pointer">
        <GoChevronDown />
        </p>
        <div
        className={`duration-125 linear absolute -left-4 top-6 z-10 w-max origin-top-left py-2 transition-all ${
          openMain ? 'scale-100' : 'scale-0'
        }`}
        >
        <div className="grid h-fit w-fit grid-cols-2 gap-4 rounded-2xl bg-white px-3 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <div className="grid grid-cols-2 gap-4">
          {createMainLinks(mainObject)}
          </div>
          <div
          style={{ backgroundImage: `url(${dropdownMain.src})` }}
          className="f-full col-span-1 rounded-xl bg-cover bg-no-repeat"
          />
        </div>
        </div>
      </div>
      {/* Auth submenu */}
      <div
        onMouseLeave={() => setOpenAuth(false)}
        onMouseEnter={() => setOpenAuth(true)}
        className="relative flex items-center gap-1 text-sm font-medium text-white"
      >
        <p className="cursor-pointer py-1">Authentication</p>
        <p className="cursor-pointer">
        <GoChevronDown />
        </p>
        <div
        className={`duration-125 linear absolute -left-4 top-6 z-10 w-max origin-top-left py-2 transition-all ${
          openAuth ? 'scale-100' : 'scale-0'
        }`}
        >
        <div className="grid h-fit w-fit grid-cols-2 gap-4 rounded-xl bg-white px-3 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <div className="grid grid-cols-2 gap-4">
          {createAuthLinks(authObject)}
          </div>

          <div
          style={{ backgroundImage: `url(${dropdownMain.src})` }}
          className="col-span-1 rounded-xl bg-cover bg-no-repeat"
          />
        </div>
        </div>
      </div>
      </div>
      </aside>
      <aside className='flex flex-1 justify-end gap-2'>

        <InputField 
        id='search' label='Search' placeholder='Search' showLabel={false} />
       <Button
        className='h-input'
       variant='default'
        asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
      <Button asChild className='bg-inherit border border-white h-input'>
      <Link href="/auth/sign-in">Sign In</Link>
      </Button>
      </aside>
    </nav>
  );
}

export default NavbarAuth;
