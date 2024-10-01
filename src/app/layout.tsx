import React, { ReactNode } from 'react';
import AppWrappers from './AppWrappers';
// import NavbarAuth from 'components/navbar/NavbarAuth';
import '@/styles/index.css';
import {
  Layout,
} from 'components/dom/Layout';
import {
  ThemeProvider,
} from 'next-themes';
export default function RootLayout( { children }: { children: ReactNode } ) {



  return (
    <html lang="en" className="construction h-screen w-screen bg-red-500">
      <body id={ 'root' } className="h-screen w-screen">
        {/* <NavbarAuth /> */ }
        <ThemeProvider attribute="class" enableSystem={ true } defaultTheme="dark">


          <AppWrappers>
            <Layout>
              { children }
            </Layout>
          </AppWrappers>
        </ThemeProvider>
      </body>
    </html>
  );
}
