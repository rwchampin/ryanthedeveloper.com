 'use client';

import { Headline } from '@/app/components/typography/Headline';
import { ShadowText } from '@/app/components/typography/ShadowText';
import { Subtitle } from '@/app/components/typography/Subtitle';
import { Text } from '@/app/components/typography/Text';
import { Title } from '@/app/components/typography/Title';
import { Button } from '@/app/components/ui/button';
import { useTheme } from 'next-themes';
import Link from 'next/link';
const CTA = (
  <>
    <Button asChild>
   <Link className="me-2 md:me-5" href="/dashboard/main">

                  Explore the Dashboard

      </Link>
    </Button>
    <Button asChild variant="outline">
              <Link href="/dashboard/main">
                
                  See pricing Plans

      </Link>
      </Button>
    </>
)
export default function Hero({
  headline = "Introducing: Horizon UI Boilerplate x shadcn/ui",
  headlineColor="red",
  headlineHref = '/',
  title="Launch your startup project 10X faster in a few moments",
  subtitle,
  description,
  cta,
  shadowText,
}) {
  const { theme, setTheme } = useTheme();
//  const herodark='https://placehold.co/600x400'
//   const herolight='https://placehold.co/600x400'
  return (
    <div
      className="relative mx-auto   flex w-full flex-col content-center items-center rounded-xl 
   bg-[linear-gradient(180deg,_#FFF_0%,_#F4F4F5_100%)] dark:bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.00)_0%,_rgba(255,_255,_255,_0.10)_100%)] md:mt-[90px]
   md:rounded-3xl lg:mt-[103px] 2xl:w-[94vw]"
    >
      <div className="flex w-full max-w-6xl">
        <div className="3xl:pt-[200px] mb-0 flex w-[stretch] max-w-full flex-row content-center items-center justify-between pt-20 lg:pt-[120px]">
          <div className="mx-auto flex w-full flex-col text-center">

            <Headline
              headlineColor={headlineColor}
              className="mb-4"
              headlineHref={headlineHref}
            >
              {headline}
             </Headline>

            <Title>
              {title}
              </Title>

            <Subtitle>
              {subtitle}
            </Subtitle>
            <Text>
              {description}
            </Text>
            <div className="mx-auto flex items-center justify-center">
             {cta}
            </div>
            <ShadowText>
              {shadowText}
              </ShadowText>

          </div>
        </div>
      </div>
    </div>
  );
}
