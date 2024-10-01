// import { Cubes } from '@/app/components/3d/Cubes'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

export default function CubesPage() {
    return (
        <div className="h-screen w-full">
            <Canvas
                className='h-screen w-screen fixed top-0 left-0'
            >

            </Canvas>
        </div>
    )
}
