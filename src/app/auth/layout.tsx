'use client';
import { PropsWithChildren, useState } from 'react';
 
// Chakra imports

// Layout components
import { SidebarContext } from 'contexts/SidebarContext';
import React from 'react';
import { isWindowAvailable } from '@/lib/utils/navigation';
import FixedPlugin from 'components/fixedPlugin/FixedPlugin';

// Custom Chakra theme

interface AuthProps extends PropsWithChildren {}

export default function AuthLayout({ children }: AuthProps): JSX.Element {
  // states and functions
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  return (
    <div className=''>
      <div className="relative float-right h-full min-h-screen w-full dark:!bg-navy-900">
        <main className={`mx-auto min-h-screen`}>
          {/* <FixedPlugin /> */}
          {children}
        </main>
      </div>
    </div>
  );
}
