'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import InnerContent from '@/components/layout/innerContent';
// import imagedark from '@/public/img/dark/features/feature-one.png';
// import image from '@/public/img/light/features/feature-one.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';

export function FeatureOne() {
  const { theme, setTheme } = useTheme();
  const image='https://placehold.co/600x400'
  const imagedark='https://placehold.co/600x400'
  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-cover pb-[100px] pt-[100px] md:pb-[140px] md:pt-[140px]">

        <div className="justfify-between flex max-w-[1170px] flex-col items-center gap-[50px] px-5 md:px-10 lg:flex-row lg:items-start xl:px-0">
          <div className="my-auto flex max-w-full flex-col items-center lg:items-start">
            <Badge
              variant="outline"
              className="mb-3.5 w-max px-4 py-2 text-zinc-950 dark:border-none dark:bg-zinc-800 dark:text-white"
            >
              FEATURE SECTION #1
            </Badge>
            <h1 className="mb-5 w-full max-w-full text-center text-[28px] font-extrabold leading-10 text-zinc-950 dark:text-white md:w-[70%] md:max-w-[unset] md:text-[36px] md:leading-[50px] lg:w-[90%] lg:text-left xl:text-[42px] xl:leading-[52px]">
              Ready to use Web App for your Startup project
            </h1>
            <p className="mb-8 w-full text-center text-base font-normal leading-8 text-zinc-950 dark:text-zinc-400 md:w-[80%] lg:w-[100%] lg:text-left">
              It’s so easy to beat your endless procrastination when you have
              all the necessary resources to get that project done and start to
              generate your startup’s first dollar in just a few days.
            </p>
            <div className="mb-0 flex w-full flex-col items-center justify-center md:flex-row lg:mb-8 lg:justify-start">
              <a className="me-5" href="/dashboard/main">
                <Button className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium md:mb-0">
                  Explore the Dashboard
                </Button>
              </a>
              <a className="me-5" href="/dashboard/main">
                <Button
                  variant="outline"
                  className="mb-6 flex items-center justify-center px-4 py-7 text-sm font-medium dark:text-white md:mb-0"
                >
                  See pricing Plans
                </Button>
              </a>
            </div>
          </div>
          <Image
            src={theme === 'dark' ? imagedark : image}
            width={1150}
            height={1150}
            alt=""
            className="mt-5 w-full md:mt-12 lg:mt-0 lg:w-[415px] xl:w-[575px]"
          />
        </div>

    </div>
  );
}
