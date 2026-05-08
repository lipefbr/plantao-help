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

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
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

  // Selected contest for detail view
  selectedContestId: string | null
  setSelectedContestId: (id: string | null) => void

  // Admin sub-tab
  adminSubTab: 'users' | 'hospitals' | 'contests' | 'locations' | 'fees' | 'dashboard' | 'shifts'
  setAdminSubTab: (tab: 'users' | 'hospitals' | 'contests' | 'locations' | 'fees' | 'dashboard' | 'shifts') => void

  // Profile sub-tab
  profileSubTab: 'info' | 'ratings' | 'favorites' | 'alerts'
  setProfileSubTab: (tab: 'info' | 'ratings' | 'favorites' | 'alerts') => void

  // Dark mode
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
  toggleDarkMode: () => void

  // Notifications
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  notifications: NotificationItem[]
  setNotifications: (notifications: NotificationItem[]) => void
  unreadCount: number
  setUnreadCount: (count: number) => void

  // Favorites (local cache for UI)
  favoriteIds: string[]
  setFavoriteIds: (ids: string[]) => void
  toggleFavorite: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      // Selected contest
      selectedContestId: null,
      setSelectedContestId: (id) => set({ selectedContestId: id }),

      // Admin sub-tab
      adminSubTab: 'dashboard',
      setAdminSubTab: (tab) => set({ adminSubTab: tab }),

      // Profile sub-tab
      profileSubTab: 'info',
      setProfileSubTab: (tab) => set({ profileSubTab: tab }),

      // Dark mode
      darkMode: false,
      setDarkMode: (dark) => set({ darkMode: dark }),
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),

      // Notifications
      showNotifications: false,
      setShowNotifications: (show) => set({ showNotifications: show }),
      notifications: [],
      setNotifications: (notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter(n => !n.read).length
        })
      },
      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Favorites
      favoriteIds: [],
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      toggleFavorite: (id) => {
        const current = get().favoriteIds
        set({
          favoriteIds: current.includes(id)
            ? current.filter(f => f !== id)
            : [...current, id]
        })
      },
    }),
    {
      name: 'plantao-help-store',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        activeTab: state.activeTab,
        darkMode: state.darkMode,
        favoriteIds: state.favoriteIds,
      }),
    }
  )
)
