'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, formatTimeAgo, renderStars, getRoleLabel, getProfessionalTypeColor, getShiftType, getShiftTypeColor, getShiftTypeIcon, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Stethoscope, Calendar, TrendingUp, Plus, Search, ArrowRight, Star, MapPin, Clock, AlertCircle, CheckCircle2, Users, DollarSign, Briefcase, Activity, Sparkles } from 'lucide-react'
import { FaqHelpSection } from '@/components/faq-help-section'

interface ShiftItem {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string
  endTime: string
  value: number
  location: string
  city: string
  state: string
  status: string
  professionalType: string
  sellerId: string
  seller: {
    id: string
    name: string
    role: string
    professionalDoc: string | null
    avgRating: number
    totalRatings: number
  }
  hospital: { id: string; name: string } | null
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  icon: string
}

interface RecommendedShiftItem extends ShiftItem {
  score: number
  reasons: string[]
}

export function HomeTab() {
  const { user, setActiveTab, setShowAuthModal, setAuthMode, setSelectedShiftId } = useAppStore()
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState<number>(0)
  const [myShiftsCount, setMyShiftsCount] = useState(0)
  const [boughtShiftsCount, setBoughtShiftsCount] = useState(0)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [recommendedShifts, setRecommendedShifts] = useState<RecommendedShiftItem[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(false)
  const [trustCounts, setTrustCounts] = useState({ shifts: 0, verified: 0 })
  const [animatedStats, setAnimatedStats] = useState({ available: 0, published: 0, bought: 0, rating: 0 })

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Bom dia,'
    if (hour >= 12 && hour < 18) return 'Boa tarde,'
    return 'Boa noite,'
  }

  // Ripple effect on click
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`
    card.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }, [])

  // Smooth number counter for logged-in stats
  const animateNumber = useCallback((target: number, setter: (v: number) => void, duration = 800) => {
    const steps = 20
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setter(target)
        clearInterval(timer)
      } else {
        setter(Math.round(current * 10) / 10)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadFeaturedShifts()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserRating()
      loadMyShiftsCount()
      loadBoughtShiftsCount()
      loadActivities()
      loadRecommendedShifts()
    }
  }, [user])

  // Animate stats when they load
  useEffect(() => {
    if (!user || loading) return
    const cleanups: (() => void)[] = []
    cleanups.push(animateNumber(shifts.length, v => setAnimatedStats(prev => ({ ...prev, available: v }))))
    cleanups.push(animateNumber(myShiftsCount, v => setAnimatedStats(prev => ({ ...prev, published: v }))))
    cleanups.push(animateNumber(boughtShiftsCount, v => setAnimatedStats(prev => ({ ...prev, bought: v }))))
    if (userRating > 0) {
      cleanups.push(animateNumber(userRating, v => setAnimatedStats(prev => ({ ...prev, rating: v })), 1000))
    }
    return () => cleanups.forEach(c => c())
  }, [user, loading, shifts.length, myShiftsCount, boughtShiftsCount, userRating, animateNumber])

  // Counter animation for Trust Bar (logged-out page)
  useEffect(() => {
    if (loading || user) return
    const target = shifts.length
    const duration = 1200
    const steps = 30
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setTrustCounts({ shifts: target, verified: 100 })
        clearInterval(timer)
      } else {
        setTrustCounts(prev => ({ ...prev, shifts: Math.round(current) }))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [loading, shifts.length, user])

  const loadFeaturedShifts = async () => {
    try {
      const res = await fetch('/api/shifts?status=AVAILABLE')
      if (res.ok) {
        const data = await res.json()
        setShifts(data.slice(0, 4))
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const loadUserRating = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/users/${user.id}/ratings`)
      if (res.ok) {
        const data = await res.json()
        setUserRating(data.avgRating || 0)
      }
    } catch {
      // silently fail
    }
  }

  const loadMyShiftsCount = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/shifts?sellerId=${user.id}&allStatuses=true`)
      if (res.ok) {
        const data = await res.json()
        setMyShiftsCount(data.length)
      }
    } catch {
      // silently fail
    }
  }

  const loadBoughtShiftsCount = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/shifts?buyerId=${user.id}&status=SOLD`)
      if (res.ok) {
        const data = await res.json()
        setBoughtShiftsCount(data.length)
      }
    } catch {
      // silently fail
    }
  }

  const loadActivities = async () => {
    if (!user) return
    setActivitiesLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}/activity`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch {
      // silently fail
    } finally {
      setActivitiesLoading(false)
    }
  }

  const loadRecommendedShifts = async () => {
    if (!user) return
    setRecommendedLoading(true)
    try {
      const res = await fetch(`/api/shifts/recommended?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setRecommendedShifts(data)
      }
    } catch {
      // silently fail
    } finally {
      setRecommendedLoading(false)
    }
  }

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId)
    setActiveTab('plantoes')
  }

  // Not logged in - hero section
  if (!user) {
    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Subtle shimmer gradient overlay */}
          <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 4s linear infinite' }} />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full [animation:shimmer_3s_infinite]" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="absolute top-1/2 right-4 w-20 h-20 bg-white/5 rounded-full" />
          {/* Decorative dots pattern */}
          <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1.5 opacity-20">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
            ))}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Plantão Help</h2>
            <p className="text-emerald-100 text-sm leading-relaxed mb-4">
              Marketplace para compra e venda de plantões médicos, de enfermagem e técnico de enfermagem.
              Repasse de plantões com segurança e praticidade.
            </p>
            <Button
              onClick={() => {
                setAuthMode('login')
                setShowAuthModal(true)
              }}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-lg h-12 text-base shadow-xl"
            >
              Entrar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Professional Types */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Para profissionais da saúde</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">🩺</span>
                </div>
                <p className="text-xs font-semibold text-blue-800">Médicos</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">💊</span>
                </div>
                <p className="text-xs font-semibold text-purple-800">Enfermeiros</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">🏥</span>
                </div>
                <p className="text-xs font-semibold text-orange-800">Téc. Enf.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it Works */}
        <div className="relative">
          {/* Decorative medical cross pattern background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]" aria-hidden="true">
            <span className="absolute top-0 left-4 text-2xl">✚</span>
            <span className="absolute top-2 right-8 text-lg">✚</span>
            <span className="absolute top-0 left-1/3 text-xl">✚</span>
            <span className="absolute top-1 right-1/4 text-2xl">✚</span>
            <span className="absolute top-3 left-2/3 text-lg">✚</span>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Como funciona?</h3>
          <div className="space-y-3">
            {[
              { step: '1', icon: '📋', title: 'Cadastre-se', desc: 'Crie sua conta com CRM/COREN e aguarde aprovação', color: 'from-emerald-50 to-white' },
              { step: '2', icon: '📅', title: 'Publique ou Busque', desc: 'Anuncie seus plantões ou encontre oportunidades', color: 'from-teal-50 to-white' },
              { step: '3', icon: '🤝', title: 'Feche o Negócio', desc: 'Compre ou venda plantões com segurança', color: 'from-amber-50 to-white' },
              { step: '4', icon: '⭐', title: 'Avalie', desc: 'Avalie a experiência e fortaleça a comunidade', color: 'from-purple-50 to-white' },
            ].map((item) => (
              <Card key={item.step} className={`rounded-xl border-0 shadow-sm bg-gradient-to-r ${item.color}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-200">{item.step}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4 text-center">
              <Calendar className="w-7 h-7 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Publique Plantões</p>
              <p className="text-xs text-gray-500 mt-1">Repasse seus horários facilmente</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 text-center">
              <Search className="w-7 h-7 mx-auto text-amber-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Encontre Vagas</p>
              <p className="text-xs text-gray-500 mt-1">Busque plantões disponíveis</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-7 h-7 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Concursos</p>
              <p className="text-xs text-gray-500 mt-1">Acompanhe editais e concursos</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4 text-center">
              <Star className="w-7 h-7 mx-auto text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Avaliações</p>
              <p className="text-xs text-gray-500 mt-1">Sistema de reputação confiável</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Bar */}
        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold animate-countUp">{trustCounts.shifts > 0 ? `${trustCounts.shifts}+` : `${shifts.length}+`}</p>
                <p className="text-[10px] text-emerald-100">Plantões Ativos</p>
              </div>
              <div>
                <p className="text-xl font-bold animate-countUp" style={{ animationDelay: '0.1s' }}>100%</p>
                <p className="text-[10px] text-emerald-100">Verificados</p>
              </div>
              <div>
                <p className="text-xl font-bold animate-countUp" style={{ animationDelay: '0.2s' }}>24h</p>
                <p className="text-[10px] text-emerald-100">Suporte</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent shifts preview */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-1.5">Plantões em destaque <Sparkles className="w-4 h-4 text-amber-400" /></h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : shifts.length === 0 ? (
            <Card className="rounded-2xl bg-gray-50 border-0">
              <CardContent className="p-8 text-center">
                <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
                <p className="text-sm text-gray-500">Nenhum plantão disponível no momento</p>
                <p className="text-xs text-gray-400 mt-1">Novos plantões são adicionados frequentemente!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift) => (
                <Card
                  key={shift.id}
                  className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400 shift-card-hover"
                  onClick={() => handleShiftClick(shift.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.professionalType))}>
                          {getRoleLabel(shift.professionalType)}
                        </span>
                        <div className="mt-1">
                          <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getShiftTypeColor(getShiftType(shift.startTime, shift.endTime)))}>
                            {getShiftTypeIcon(getShiftType(shift.startTime, shift.endTime))} {getShiftType(shift.startTime, shift.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-3 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setActiveTab('plantoes')}
          >
            Ver todos os plantões
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* FAQ & Help */}
        <FaqHelpSection />
      </div>
    )
  }

  // Logged in - dashboard
  return (
    <div className="space-y-5">
      {/* Welcome card with gradient border & decorative elements */}
      <div className="gradient-border-card relative">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-xl p-5 text-white relative overflow-hidden">
        {/* Subtle animated gradient shimmer overlay */}
        <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 4s linear infinite' }} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm">{getGreeting()}</p>
          <h2 className="text-xl font-bold animate-typewriter inline-block pr-1">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">{getRoleLabel(user.role)}</span>
            {user.registrationStatus === 'PENDING' && (
              <span className="text-xs bg-yellow-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Aguardando aprovação
              </span>
            )}
            {user.registrationStatus === 'APPROVED' && (
              <span className="text-xs bg-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Aprovado
              </span>
            )}
            {user.registrationStatus === 'REJECTED' && (
              <span className="text-xs bg-red-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Cadastro rejeitado
              </span>
            )}
          </div>
          {user.city && user.state && (
            <p className="text-emerald-200 text-xs mt-1.5">
              <MapPin className="w-3 h-3 inline mr-0.5" />
              {user.city}, {user.state}
            </p>
          )}
        </div>
      </div>
      </div>

      {/* Pending approval warning */}
      {user.registrationStatus === 'PENDING' && (
        <Card className="rounded-xl border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Cadastro pendente de aprovação</p>
                <p className="text-xs text-amber-600 mt-1">
                  Seu cadastro está sendo analisado pela equipe administrativa. Você poderá publicar e comprar plantões após a aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wave SVG Divider */}
      <div className="-mt-2">
        <svg viewBox="0 0 400 30" className="w-full h-6 fill-emerald-600/5 dark:fill-emerald-900/20" preserveAspectRatio="none">
          <path d="M0,15 C100,30 200,0 300,15 C350,22 380,18 400,15 L400,30 L0,30 Z" />
        </svg>
      </div>

      {/* Stats with ripple effect and animated counters */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="rounded-xl border-0 shadow-sm hover:-translate-y-0.5 transition-transform duration-300 ripple-card cursor-pointer" onClick={createRipple}>
          <CardContent className="p-2.5 text-center">
            <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200 counter-pulse">{animatedStats.available || shifts.length}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Disponíveis</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm hover:-translate-y-0.5 transition-transform duration-300 ripple-card cursor-pointer" onClick={createRipple}>
          <CardContent className="p-2.5 text-center">
            <div className="w-7 h-7 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200 counter-pulse">{animatedStats.published || myShiftsCount}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Publicados</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm hover:-translate-y-0.5 transition-transform duration-300 ripple-card cursor-pointer" onClick={createRipple}>
          <CardContent className="p-2.5 text-center">
            <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200 counter-pulse">{animatedStats.bought || boughtShiftsCount}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Comprados</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm hover:-translate-y-0.5 transition-transform duration-300 ripple-card cursor-pointer" onClick={createRipple}>
          <CardContent className="p-2.5 text-center">
            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-base font-bold text-gray-800 dark:text-gray-200 counter-pulse">{animatedStats.rating > 0 ? animatedStats.rating.toFixed(1) : (userRating > 0 ? userRating.toFixed(1) : '-')}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Avaliação</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user.registrationStatus === 'APPROVED' && user.role !== 'ADMIN' && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setActiveTab('plantoes')}
            className="h-16 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex flex-col gap-1 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 group"
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="text-xs font-medium">Publicar Plantão</span>
          </Button>
          <Button
            onClick={() => setActiveTab('plantoes')}
            variant="outline"
            className="h-16 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl flex flex-col gap-1 shadow-sm group"
          >
            <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xs font-medium">Buscar Plantões</span>
          </Button>
        </div>
      )}

      {/* Concursos quick link */}
      <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('concursos')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center relative">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                {/* Pulsing dot indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-badge-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Concursos Abertos</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Confira os editais da sua região</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Recommended Shifts */}
      <div className="animate-slideUp">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Recomendados para Você</h3>
        </div>
        {recommendedLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-28 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recommendedShifts.length === 0 ? (
          <Card className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-0">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma recomendação no momento</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete seu perfil para receber recomendações personalizadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recommendedShifts.map((shift, index) => (
              <Card
                key={shift.id}
                className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400 hover:border-l-emerald-500 shift-card-hover"
                style={{ animationDelay: `${index * 80}ms`, opacity: 0, animation: 'slideUp 0.4s ease forwards', animationDelay: `${index * 80}ms` }}
                onClick={() => handleShiftClick(shift.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{shift.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{shift.city}/{shift.state}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <span className="text-[7px] font-bold text-emerald-700 dark:text-emerald-400">{shift.seller.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{shift.seller.name}</span>
                        {shift.seller.avgRating > 0 && (
                          <span className="text-xs text-amber-500 flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {shift.seller.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{formatCurrency(shift.value)}</p>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.professionalType))}>
                        {getRoleLabel(shift.professionalType)}
                      </span>
                      <div className="mt-1">
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getShiftTypeColor(getShiftType(shift.startTime, shift.endTime)))}>
                          {getShiftTypeIcon(getShiftType(shift.startTime, shift.endTime))} {getShiftType(shift.startTime, shift.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Reason badges */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {shift.reasons.map((reason) => (
                      <Badge
                        key={reason}
                        variant="secondary"
                        className={cn(
                          'text-[10px] px-2 py-0 h-5 font-medium',
                          reason === 'Seu tipo' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                          reason === 'Mesma região' && 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
                          reason === 'Mesma cidade' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                          reason === 'Vendedor top' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        )}
                      >
                        {reason === 'Seu tipo' && '🎯 '}{reason === 'Mesma região' && '📍 '}{reason === 'Mesma cidade' && '🏘️ '}{reason === 'Vendedor top' && '⭐ '}
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 rounded-lg border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          onClick={() => setActiveTab('plantoes')}
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Recent shifts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">Plantões recentes <Sparkles className="w-3.5 h-3.5 text-amber-400" /></h3>
          <button
            onClick={() => setActiveTab('plantoes')}
            className="text-xs text-emerald-600 font-medium hover:underline"
          >
            Ver todos
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <Card className="rounded-2xl bg-gray-50 border-0">
            <CardContent className="p-8 text-center">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Nenhum plantão disponível</p>
              <p className="text-xs text-gray-400 mt-1">Novos plantões aparecem em breve!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift, index) => (
              <Card
                key={shift.id}
                className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400 animate-slideUp shift-card-hover"
                style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
                onClick={() => handleShiftClick(shift.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                      </div>
                      {shift.seller && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-emerald-700">{shift.seller.name.charAt(0)}</span>
                          </div>
                          <span className="text-xs text-gray-500">{shift.seller.name}</span>
                          {shift.seller.avgRating > 0 && (
                            <span className="text-xs text-amber-500 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {shift.seller.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.professionalType))}>
                        {getRoleLabel(shift.professionalType)}
                      </span>
                      <div className="mt-1">
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getShiftTypeColor(getShiftType(shift.startTime, shift.endTime)))}>
                          {getShiftTypeIcon(getShiftType(shift.startTime, shift.endTime))} {getShiftType(shift.startTime, shift.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-semibold text-gray-800">Atividade Recente</h3>
          </div>
        </div>
        {activitiesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded animate-pulse" />
                  <Skeleton className="h-3 w-1/2 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <Card className="rounded-2xl bg-gray-50 border-0">
            <CardContent className="p-8 text-center">
              <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              <p className="text-xs text-gray-400 mt-1">Suas atividades aparecerão aqui</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                {activities.slice(0, showAllActivities ? 10 : 5).map((activity, index) => {
                  const isLast = index === (showAllActivities ? Math.min(10, activities.length) : Math.min(5, activities.length)) - 1
                  const typeColors: Record<string, string> = {
                    shift_published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    shift_bought: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    shift_cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    new_rating: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    registration_approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    contest_opening: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                  }
                  const colorClass = typeColors[activity.type] || 'bg-gray-100 text-gray-700'

                  return (
                    <div
                      key={activity.id}
                      className="animate-slideUp"
                      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
                    >
                      <div className="flex items-start gap-3 relative">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-[17px] top-9 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                        )}
                        {/* Icon circle */}
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 text-sm',
                          colorClass
                        )}>
                          {activity.icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{formatTimeAgo(activity.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {activities.length > 5 && !showAllActivities && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                  onClick={() => setShowAllActivities(true)}
                >
                  Ver mais
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              {showAllActivities && activities.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  onClick={() => setShowAllActivities(false)}
                >
                  Ver menos
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* FAQ & Help */}
      <FaqHelpSection />
    </div>
  )
}
