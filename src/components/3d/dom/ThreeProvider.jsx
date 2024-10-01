'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
const Scene = dynamic(() => import('@/components/3d/canvas/Scene'), { ssr: false })

const ThreeProvider = ({ children }) => {
  const ref = useRef()

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
        height: '100%',
        minHeight: '100vh',
      }}
    >
      {children}
      <Scene
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export { ThreeProvider }

