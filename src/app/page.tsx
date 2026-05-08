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
import { AnimatePresence, motion } from 'framer-motion'

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
        transition={{ duration: 0.2, ease: 'easeOut' }}
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <AuthModal />

      <main className="pt-14 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <TabContent />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
