import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggleSidebar: () => void
    setSidebarOpen: (isOpen: boolean) => void
    sidebarWidth: number
}

const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: false,
    sidebarWidth: 250,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setSidebarOpen: (isOpen) => set({ isOpen }),
}))

export default useSidebarStore
