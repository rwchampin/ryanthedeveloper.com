// import React from 'react';
// // import { Jarvis } from '@/components/Jarvis';
// import { createClient } from '@/lib/utils/supabase/client';
// // import NavbarAuth from '@/components/navbar/NavbarAuth';

// export default function Template({ children }: { children: React.ReactNode }) {
//     const supabase = createClient();
//    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//      if (event === 'SIGNED_IN') {
//       debugger;
//        console.log('User signed in:', session);
//        // Redirect to a protected route or perform any action

//      } else if (event === 'SIGNED_OUT') {
//       debugger
//        console.log('User signed out');
//        // Redirect to the sign-in page or perform any action
//        router.push('/sign-in');
//      }
//    });
//   // return <><NavbarAuth />{children}<Jarvis /></>;
//   return <>{children}</>;
// }


export default function Template({ children }: { children: React.ReactNode }) {

  return <>{children}</>;
}
