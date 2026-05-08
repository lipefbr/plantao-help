'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, Search, Star, Check, ArrowRight, X, Stethoscope, UserPlus, ClipboardList, Trophy } from 'lucide-react'

const STORAGE_KEY_PREFIX = 'plantao-help-onboarding-'

interface OnboardingModalProps {
  onComplete?: () => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { user } = useAppStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const TOTAL_STEPS = 4

  const checkOnboarding = useCallback(() => {
    if (!user) return false
    if (user.registrationStatus !== 'APPROVED') return false
    if (user.role === 'ADMIN') return false
    try {
      const completed = localStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`)
      return !completed
    } catch {
      return true
    }
  }, [user])

  useEffect(() => {
    if (checkOnboarding()) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [checkOnboarding])

  const handleComplete = useCallback(() => {
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, 'completed')
      } catch {
        // silently fail
      }
    }
    setOpen(false)
    onComplete?.()
  }, [user, onComplete])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection('forward')
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setDirection('back')
      setStep(step - 1)
    }
  }

  const goToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 'forward' : 'back')
    setStep(targetStep)
  }

  const steps = [
    {
      icon: <Stethoscope className="w-10 h-10 text-emerald-600" />,
      title: 'Bem-vindo ao Plantão Help!',
      description: 'O marketplace de plantões médicos e de enfermagem mais seguro do Brasil. Compre, venda e repasse plantões com praticidade.',
      emoji: '🏥',
    },
    {
      icon: null,
      title: 'Como funciona',
      description: '',
      emoji: '',
      isHowItWorks: true,
    },
    {
      icon: <UserPlus className="w-10 h-10 text-emerald-600" />,
      title: 'Complete seu perfil',
      description: 'Adicione telefone, cidade e documento profissional para aumentar sua credibilidade e receber mais oportunidades.',
      emoji: '📋',
      isProfile: true,
    },
    {
      icon: <Check className="w-10 h-10 text-emerald-600" />,
      title: 'Pronto para começar!',
      description: 'Você está pronto para explorar o marketplace. Publique seus primeiros plantões ou encontre oportunidades disponíveis.',
      emoji: '🚀',
      isActions: true,
    },
  ]

  const currentStep = steps[step]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip() }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-2xl">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-6 pb-8 text-white overflow-hidden">
          {/* Decorative orbs */}
          <div className="gradient-orb w-32 h-32 bg-emerald-300/40 -top-8 -right-8" />
          <div className="gradient-orb w-20 h-20 bg-teal-300/30 bottom-2 left-4" />
          {/* Parallax gradient */}
          <div className="absolute inset-0 animate-parallax-rotate opacity-10" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05), transparent)', transformOrigin: 'center center' }} />

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
            aria-label="Pular"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Step content with animation */}
          <div key={step} className="animate-fadeIn relative z-10">
            {currentStep.icon && (
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                {currentStep.icon}
              </div>
            )}
            {currentStep.emoji && !currentStep.icon && (
              <div className="text-4xl mb-3">{currentStep.emoji}</div>
            )}
            <h2 className="text-xl font-bold">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="text-emerald-100 text-sm mt-1 leading-relaxed">{currentStep.description}</p>
            )}
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 pt-4">
          {/* How it Works step content */}
          {currentStep.isHowItWorks && (
            <div key={`how-${step}`} className="animate-fadeIn space-y-4">
              {[
                { icon: <ClipboardList className="w-5 h-5 text-emerald-600" />, title: 'Publicar plantões', desc: 'Anuncie seus plantões disponíveis com todos os detalhes', step: '1', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                { icon: <Search className="w-5 h-5 text-teal-600" />, title: 'Comprar plantões', desc: 'Encontre oportunidades que combinam com seu perfil', step: '2', color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
                { icon: <Trophy className="w-5 h-5 text-amber-600" />, title: 'Avaliar e ganhar reputação', desc: 'Avalie suas experiências e construa sua reputação', step: '3', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${item.color} staggered-card`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-200 dark:text-emerald-700 shrink-0">{item.step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Profile completion step */}
          {currentStep.isProfile && (
            <div key={`profile-${step}`} className="animate-fadeIn">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Perfil incompleto</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Adicione informações para melhorar sua experiência</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { field: 'Telefone', filled: !!user?.phone },
                    { field: 'Cidade', filled: !!user?.city },
                    { field: 'Estado', filled: !!user?.state },
                    { field: 'Documento profissional', filled: !!user?.professionalDoc },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.filled ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                        {item.filled ? <Check className="w-3 h-3" /> : <span className="text-[10px]">○</span>}
                      </div>
                      <span className={`text-xs ${item.filled ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-gray-600 dark:text-gray-300'}`}>{item.field}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      handleComplete()
                      // Navigate to profile tab
                      const { setActiveTab, setProfileSubTab } = useAppStore.getState()
                      setActiveTab('perfil')
                      setProfileSubTab('info')
                    }}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                  >
                    Completar agora
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button
                    onClick={handleSkip}
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-lg text-xs border-gray-300 dark:border-gray-600"
                  >
                    Depois
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions step */}
          {currentStep.isActions && (
            <div key={`actions-${step}`} className="animate-fadeIn space-y-3">
              <Button
                onClick={() => {
                  handleComplete()
                  useAppStore.getState().setActiveTab('plantoes')
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 text-base font-semibold group"
              >
                <Heart className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                Publicar Plantão
              </Button>
              <Button
                onClick={() => {
                  handleComplete()
                  useAppStore.getState().setActiveTab('plantoes')
                }}
                variant="outline"
                className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl h-14 text-base font-semibold group"
              >
                <Search className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                Buscar Plantões
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevStep}
              className={`text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              Voltar
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === step
                      ? 'w-6 h-2 bg-emerald-600'
                      : i < step
                        ? 'w-2 h-2 bg-emerald-400'
                        : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Passo ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              {step === TOTAL_STEPS - 1 ? 'Concluir' : 'Próximo'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skip link */}
          <div className="text-center mt-3">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              Pular
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
