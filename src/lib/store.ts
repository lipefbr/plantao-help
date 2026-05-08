import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TabType = 'home' | 'plantoes' | 'concursos' | 'meus-plantoes' | 'perfil' | 'admin'
export type UserRole = 'MEDICO' | 'ENFERMEIRO' | 'TECNICO_ENFERMAGEM' | 'EMPRESA' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  registrationStatus: string
  city: string | null
  state: string | null
  professionalDoc: string | null
  phone: string | null
  bio: string | null
  avatar: string | null
  companyName: string | null
}

interface AppState {
  // Navigation
  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  // Auth
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  isLoggedIn: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  authMode: 'login' | 'register'
  setAuthMode: (mode: 'login' | 'register') => void

  // Selected shift for detail view
  selectedShiftId: string | null
  setSelectedShiftId: (id: string | null) => void

  // Admin sub-tab
  adminSubTab: 'users' | 'hospitals' | 'contests' | 'locations' | 'fees'
  setAdminSubTab: (tab: 'users' | 'hospitals' | 'contests' | 'locations' | 'fees') => void

  // Profile sub-tab
  profileSubTab: 'info' | 'ratings'
  setProfileSubTab: (tab: 'info' | 'ratings') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Auth
      user: null,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      isLoggedIn: false,
      showAuthModal: false,
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      authMode: 'login',
      setAuthMode: (mode) => set({ authMode: mode }),

      // Selected shift
      selectedShiftId: null,
      setSelectedShiftId: (id) => set({ selectedShiftId: id }),

      // Admin sub-tab
      adminSubTab: 'users',
      setAdminSubTab: (tab) => set({ adminSubTab: tab }),

      // Profile sub-tab
      profileSubTab: 'info',
      setProfileSubTab: (tab) => set({ profileSubTab: tab }),
    }),
    {
      name: 'plantao-help-store',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        activeTab: state.activeTab,
      }),
    }
  )
)
