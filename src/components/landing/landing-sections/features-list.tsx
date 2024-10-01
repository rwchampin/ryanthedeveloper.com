'use client';

// eslint-disable
import horizondark from '@/public/img/dark/numbers/horizon.png';
import nextjsdark from '@/public/img/dark/numbers/nextjs.png';
import oauthdark from '@/public/img/dark/numbers/oauth.png';
import openaidark from '@/public/img/dark/numbers/openai.png';
import shadcndark from '@/public/img/dark/numbers/shadcn.png';
import supabasedark from '@/public/img/dark/numbers/supabase.png';
import tailwinddark from '@/public/img/dark/numbers/tailwind.png';
import horizon from '@/public/img/light/numbers/horizon.png';
import nextjs from '@/public/img/light/numbers/nextjs.png';
import oauth from '@/public/img/light/numbers/oauth.png';
import openai from '@/public/img/light/numbers/openai.png';
import shadcn from '@/public/img/light/numbers/shadcn.png';
import supabase from '@/public/img/light/numbers/supabase.png';
import tailwind from '@/public/img/light/numbers/tailwind.png';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function FeaturesList() {
  const { theme, setTheme } = useTheme();
 const horizon='https://placehold.co/100x100'
  const horizondark='https://placehold.co/100x100'
   const oauthdark='https://placehold.co/100x100'
  const openaidark='https://placehold.co/100x100'
   const shadcndark='https://placehold.co/100x100'
  const supabasedark='https://placehold.co/100x100'
   const tailwinddark='https://placehold.co/100x100'
  const nextjsdark='https://placehold.co/100x100'
   const nextjs='https://placehold.co/100x100'
  const oauth='https://placehold.co/100x100'
   const openai='https://placehold.co/100x100'
  const shadcn='https://placehold.co/100x100'
   const supabase='https://placehold.co/100x100'
  const tailwind='https://placehold.co/100x100'
  return (
    <div className="mx-auto flex w-[1170px] max-w-full flex-wrap items-center justify-center gap-5 md:flex-row xl:flex-nowrap">
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? nextjsdark.src : nextjs.src}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          NextJS 14
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? tailwinddark : tailwind}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          Tailwind CSS
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? supabasedark : supabase}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          Supabase
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? shadcndark : shadcn}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          shadcn/ui
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? horizondark : horizon}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          Horizon UI
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? openaidark : openai}
        /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          AI Integration
        </p>
      </div>
      <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800">
        {/* <Image
          width={100}
          height={100}
          alt=""
          className="mb-2.5 w-[50px] rounded-lg"
          src={theme === 'dark' ? oauthdark : oauth} */}
        {/* /> */}
        <p className="text-center font-bold text-zinc-950 dark:text-white">
          User Auth
        </p>
      </div>
    </div>
  );
}
