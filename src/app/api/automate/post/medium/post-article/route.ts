// pages/api/create-medium-post.ts
import { NextRequest, NextResponse } from 'next/server';
// import { mediumPostAutomation } from '@/lib/utils/mediumPostAutomation';

export async function POST( req: NextRequest, res: NextResponse ) {

        // const { content } = req.body;

        try {
            // await mediumPostAutomation( content );
           

            return NextResponse.json( { message: 'Post created successfully' } ); 
        } catch ( error:any ) {
            return NextResponse.error( );
        }
    
}