'use client'

import { useAppStore } from '@/lib/store'
import { TopHeader } from '@/components/top-header'
import { BottomNav } from '@/components/bottom-nav'
import { AuthModal } from '@/components/auth-modal'
import { HomeTab } from '@/components/home-tab'
import { PlantoesTab } from '@/components/plantoes-tab'
import { ShiftDetail } from '@/components/shift-detail'
import { ConcursosTab } from '@/components/concursos-tab'
import { MeusPlantoesTab } from '@/components/meus-plantoes-tab'
import { PerfilTab } from '@/components/perfil-tab'
import { AdminTab } from '@/components/admin-tab'
import { OnboardingModal } from '@/components/onboarding-modal'
import { ScrollToTop } from '@/components/scroll-to-top'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function TabContent() {
  const { activeTab, selectedShiftId, setSelectedShiftId } = useAppStore()

  // If a shift is selected, show shift detail instead
  if (selectedShiftId) {
    return (
      <ShiftDetail
        shiftId={selectedShiftId}
        onBack={() => setSelectedShiftId(null)}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'plantoes' && <PlantoesTab />}
        {activeTab === 'concursos' && <ConcursosTab />}
        {activeTab === 'meus-plantoes' && <MeusPlantoesTab />}
        {activeTab === 'perfil' && <PerfilTab />}
        {activeTab === 'admin' && <AdminTab />}
      </motion.div>
    </AnimatePresence>
  )
}

function DeepLinkHandler() {
  const { setSelectedShiftId, setActiveTab } = useAppStore()
  const searchParams = useSearchParams()

  useEffect(() => {
    const shiftId = searchParams.get('shift')
    if (shiftId) {
      setSelectedShiftId(shiftId)
      setActiveTab('plantoes')
    }
  }, [searchParams, setSelectedShiftId, setActiveTab])

  return null
}

export default function MobileApp() {
  const { darkMode, user } = useAppStore()
  const router = useRouter()

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Redirect to /mobile/login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/mobile/login')
    }
  }, [user, router])

  // While redirecting (no user yet), render a minimal placeholder
  const showApp = useMemo(() => !!user, [user])

  if (!showApp) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-950 dark:to-gray-900 bg-background text-foreground flex flex-col">
      {/* Top header - fixed at the top of the viewport */}
      <TopHeader />

      {/* Main content - scrollable, with padding for header and bottom nav */}
      <main id="mobile-scroll-container" className="flex-1 overflow-y-auto pt-14 pb-20 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Suspense fallback={null}>
            <DeepLinkHandler />
          </Suspense>
          <TabContent />
        </div>
      </main>

      <ScrollToTop targetId="mobile-scroll-container" />

      {/* Bottom nav - fixed at the bottom of the viewport */}
      <BottomNav />

      <AuthModal />
      <OnboardingModal />
    </div>
  )
}
