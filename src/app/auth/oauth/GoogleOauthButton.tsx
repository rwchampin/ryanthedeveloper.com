
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/utils/supabase/server';


export const GoogleOauthButton = () => {
    const supabase = createClient();
    const signInWithGoogle = async () => {
        "use server";
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
    options: {
        redirectTo: `/auth/v1/callback`,
    },
        });
        
            
       
    };

    return (

    <form onSubmit={signInWithGoogle}>
          <Button icon={<FcGoogle />} type="submit">
            Continue with Google
        </Button>

    </form>
    );
};