 
'use client';

// import { FooterWebsite } from '@/components/footer/FooterWebsite';
// import Faq from '@/components/landing/landing-sections/FAQ';
import FeatureOne from '@/components/landing/landing-sections/feature-one';
import FeatureThree from '@/components/landing/landing-sections/feature-three';
import FeatureTwo from '@/components/landing/landing-sections/feature-two';
import FeaturesList from '@/components/landing/landing-sections/features-list';
import FirstSection from '@/components/landing/landing-sections/first-section';
import SecondSection from '@/components/landing/landing-sections/second-section';
// import {Newsletter} from '@/components/landing/landing-sectio/ns/Newsletter';
import PageSection from '@/components/layout/page-section';
import ProductSwiper from '@/components/product-swiper';
// import {RisingProducts} from './rising-products';
// import NavbarFixed from '@/components/navbar/NavbarFixed';
// import { Database } from 'types/types_db';
// import { Session, User } from '@supabase/supabase-js';

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
//   session: Session | null;
//   user: User | null | undefined;
//   products: ProductWithPrices[];
//   subscription: SubscriptionWithProduct | null;
// }

export default function Home(props: any) {
  return (
    <>

 
<PageSection page={{name: 'landing'}} section={{name: 'hero'}} size="screen">
        <ProductSwiper />
      </PageSection>

      <PageSection page={{name: 'landing'}} section={{name: 'features'}} size="auto">
        <FeaturesList />
      </PageSection>
      <PageSection page={{name: 'landing'}} section={{name: 'newsletter'}} size="auto">
        <NewsLetter /> 
      </PageSection>
      <PageSection page={{name: 'landing'}} section={{name: 'first'}} size="auto">
        <FirstSection />
      </PageSection>
      <PageSection page={{name: 'landing'}} section={{name: 'second'}} size="auto">
        <SecondSection />
      </PageSection>
      <PageSection page={{name: 'landing'}} section={{name: 'feature-one'}} size="auto">
        <FeatureOne />
      </PageSection>
          <FeatureTwo />
          <FeatureThree />
          <Faq />
          <FeaturesList />
     
    </>
  );
}
