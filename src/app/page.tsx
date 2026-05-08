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
import { LandingPage } from '@/components/landing-page'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { OnboardingModal } from '@/components/onboarding-modal'

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

export default function Home() {
  const { darkMode, user } = useAppStore()

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Determine which view to show based on user state
  // When user logs in, automatically switch from landing to app
  const showLanding = useMemo(() => !user, [user])

  // Show beautiful landing page when not logged in
  if (showLanding) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <AuthModal />
        <OnboardingModal />
        <Suspense fallback={null}>
          <DeepLinkHandler />
        </Suspense>

        {/* Landing page with its own navigation */}
        <LandingPage />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopHeader />
      <AuthModal />
      <OnboardingModal />
      <Suspense fallback={null}>
        <DeepLinkHandler />
      </Suspense>

      <main className="pt-14 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <TabContent />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
