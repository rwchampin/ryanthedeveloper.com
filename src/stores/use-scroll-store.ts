import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { create } from 'zustand'

interface ScrollState {
  progress: number
  velocity: number
  direction: 'up' | 'down' | 'none'
  isScrolling: boolean
  updateScrollValues: () => void
  initializeScrollTracking: () => void
}

/**
 * Scroll Store for GSAP ScrollSmoother/ScrollTrigger
 * 
 * This store manages scroll-related state using Zustand and integrates with GSAP's ScrollTrigger and ScrollSmoother.
 * 
 * Setup Instructions:
 * 1. Import this store in your main component or where you want to track scrolling.
 * 2. Use the `useScrollStore` hook to access the store's state and functions.
 * 3. Call `initializeScrollTracking` after your GSAP ScrollSmoother is set up.
 * 
 * Example usage:
 * 
 * import { useEffect } from 'react'
 * import { useScrollStore } from './@/stores/use-scroll-store'
 * import { gsap } from 'gsap'
 * import { ScrollTrigger } from 'gsap/ScrollTrigger'
 * import { ScrollSmoother } from 'gsap/ScrollSmoother'
 * 
 * gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
 * 
 * function App() {
 *   const initializeScrollTracking = useScrollStore(state => state.initializeScrollTracking)
 * 
 *   useEffect(() => {
 *     const smoother = ScrollSmoother.create({
 *       smooth: 1,
 *       effects: true,
 *     })
 * 
 *     initializeScrollTracking()
 * 
 *     return () => smoother.kill()
 *   }, [initializeScrollTracking])
 * 
 *   // Rest of your component...
 * }
 * 
 */

const useScrollStore = create<ScrollState>((set, get) => ({
  /** Current scroll progress (0 to 1) */
  progress: 0,
  /** Velocity of scrolling */
  velocity: 0,
  /** Current scroll direction */
  direction: 'none',
  /** Whether the user is currently scrolling */
  isScrolling: false,

  /**
   * Updates scroll-related values using GSAP ScrollTrigger
   */
  updateScrollValues: () => {
    const instance = ScrollTrigger.getAll()[0] // Assuming the first ScrollTrigger instance is for the main scroll
    if (instance) {
      const newProgress = instance.progress
      const newVelocity = instance.getVelocity()
      const newDirection = newVelocity > 0 ? 'down' : newVelocity < 0 ? 'up' : 'none'
      const newIsScrolling = Math.abs(newVelocity) > 0

      set({
        progress: newProgress,
        velocity: newVelocity,
        direction: newDirection,
        isScrolling: newIsScrolling,
      })
    }
  },

  /**
   * Initializes scroll tracking with GSAP ScrollTrigger
   */
  initializeScrollTracking: () => {
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        get().updateScrollValues()
      }
    })
  },
}))

export default useScrollStore
