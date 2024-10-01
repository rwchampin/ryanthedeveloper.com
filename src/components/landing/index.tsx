 "use client";
// import { FooterWebsite } from '@/components/footer/FooterWebsite';
// import {FAQ} from '@/components/landing/landing-sections/FAQ';
// import {Newsletter} from '@/components/landing/landing-sections/NewsLetter';
import {FeatureOne} from '@/components/landing/landing-sections/feature-one';
// import FeatureThree from '@/components/landing/landing-sections/feature-three';
import FeatureTwo from '@/components/landing/landing-sections/feature-two';
import FeaturesList from '@/components/landing/landing-sections/features-list';
import FirstSections from '@/components/landing/landing-sections/first-section';
import SecondSections from '@/components/landing/landing-sections/second-section';
// import PageSection from '@/components/layout/page-section'
// import {ProductSwiper} from '@/components/product-swiper';
import LandingHero from './landing-sections/landing-hero';
// import {RisingProducts} from './rising-products';
// import NavbarFixed from '@/components/navbar/NavbarFixed';
// import { Database } from 'types/types_db';
// import { Sesion, User } from '@supabase/supabase-js';

// type Subscription = Database['public']['Tables']['subscriptions']['Row'];
// type Product = Database['public']['Tables']['products']['Row'];
// type Price = Database['public']['Tables']['prices']['Row'];
// interface ProductWithPrices extends Product {
//   prices: Price[];
// }
// interface PriceWithProduct extends Price {
//   products: Product | null;
// }
// interface SubscriptionWithProduct extends Subscription {
//   prices: PriceWithProduct | null;
// }

// interface Props {
//   sesion: Sesion | null;
//   user: User | null | undefined;
//   products: ProductWithPrices[];
//   subscription: SubscriptionWithProduct | null;
// }

export default function Landing(props: any) {
  return (
    <>

        <LandingHero />
        <FirstSections />
        <SecondSections />
        <FeaturesList />
        <FeatureOne />
        <FeatureTwo />
  
    </>
  );
}
