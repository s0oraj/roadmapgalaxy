// src/store/navigationStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  currentScene: 'galaxy' | 'roadmap'
  isTransitioning: boolean
  cursorStyle: 'default' | 'grab' | 'grabbing'
  setCurrentScene: (scene: 'galaxy' | 'roadmap') => void
  setIsTransitioning: (isTransitioning: boolean) => void
  setCursorStyle: (style: 'default' | 'grab' | 'grabbing') => void
  setSelectedLevel: (level: LevelNumber) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      currentScene: 'galaxy',
      isTransitioning: false,
      cursorStyle: 'default',
      setCurrentScene: (scene) => set({ currentScene: scene }),
      setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
      setCursorStyle: (style) => set({ cursorStyle: style }),
      setSelectedLevel: (level) => set({ selectedLevel: level }),
    }),
    {
      name: 'navigation-storage'
    }
  )
)
