'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { formatDate, getRoleLabel, getProfessionalTypeColor, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trophy, MapPin, Calendar, ExternalLink, Search, SlidersHorizontal, X, Clock, FileText, AlertTriangle, CheckCircle2, HourglassIcon, SearchX } from 'lucide-react'
import { ContestDetail } from '@/components/contest-detail'

interface ContestItem {
  id: string
  title: string
  description: string | null
  professionalType: string
  city: string
  state: string
  deadline: string | null
  link: string | null
  status: string
  createdAt: string
}

function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  // Set both to start of day for accurate day count
  now.setHours(0, 0, 0, 0)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getUrgencyConfig(daysRemaining: number | null): { color: string; bgColor: string; borderColor: string; icon: React.ElementType; label: string } {
  if (daysRemaining === null) return { color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800', borderColor: 'border-gray-200 dark:border-gray-700', icon: Clock, label: '' }
  if (daysRemaining < 0) return { color: 'text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800', borderColor: 'border-gray-200 dark:border-gray-700', icon: Clock, label: 'Encerrado' }
  if (daysRemaining <= 7) return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/40', borderColor: 'border-red-200 dark:border-red-800/50', icon: AlertTriangle, label: `${daysRemaining}d restantes` }
  if (daysRemaining <= 30) return { color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/40', borderColor: 'border-amber-200 dark:border-amber-800/50', icon: HourglassIcon, label: `${daysRemaining}d restantes` }
  return { color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', borderColor: 'border-emerald-200 dark:border-emerald-800/50', icon: CheckCircle2, label: `${daysRemaining}d restantes` }
}

function getLeftBorderColor(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'border-l-emerald-400'
  if (daysRemaining < 0) return 'border-l-gray-300 dark:border-l-gray-600'
  if (daysRemaining <= 7) return 'border-l-red-400'
  if (daysRemaining <= 30) return 'border-l-amber-400'
  return 'border-l-emerald-400'
}

// Shimmer skeleton component for loading state
function ShimmerSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden skeleton-shimmer">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2.5">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
            <div className="flex gap-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ConcursosTab() {
  const { user, selectedContestId, setSelectedContestId } = useAppStore()
  const [contests, setContests] = useState<ContestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState(user?.city || '')
  const [state, setState] = useState(user?.state || '')
  const [professionalType, setProfessionalType] = useState(
    user?.role && user.role !== 'ADMIN' && user.role !== 'EMPRESA' ? user.role : ''
  )
  const [showFilters, setShowFilters] = useState(false)

  const loadContests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (state) params.set('state', state)
      if (professionalType && professionalType !== 'all') params.set('professionalType', professionalType)

      const res = await fetch(`/api/contests?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setContests(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [city, state, professionalType])

  useEffect(() => {
    loadContests()
  }, [loadContests])

  // If a contest is selected, show contest detail instead
  if (selectedContestId) {
    return (
      <ContestDetail
        contestId={selectedContestId}
        onBack={() => setSelectedContestId(null)}
      />
    )
  }

  const clearFilters = () => {
    setCity('')
    setState('')
    setProfessionalType('')
  }

  const hasActiveFilters = city || state || (professionalType && professionalType !== 'all')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Concursos</h2>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'rounded-lg transition-all duration-300',
            showFilters ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : ''
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" />
          Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="rounded-xl shadow-sm border-0 animate-slideUp">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Cidade</label>
                <Input
                  placeholder="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-lg text-sm h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Estado</label>
                <Input
                  placeholder="UF"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg text-sm h-9"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Tipo de Profissional</label>
              <Select value={professionalType || 'all'} onValueChange={setProfessionalType}>
                <SelectTrigger className="rounded-lg h-9 text-sm">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                  <SelectItem value="ENFERMEIRO">Enfermeiro(a)</SelectItem>
                  <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {loading ? 'Buscando...' : `${contests.length} concurso${contests.length !== 1 ? 's' : ''} encontrado${contests.length !== 1 ? 's' : ''}`}
      </p>

      {/* Contest List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <ShimmerSkeleton key={i} />
          ))}
        </div>
      ) : contests.length === 0 ? (
        <Card className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-0 animate-fadeIn">
          <CardContent className="p-8 text-center">
            {/* Animated illustration-like element */}
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gray-200 dark:bg-gray-600" />
              <Trophy className="absolute inset-0 m-auto w-8 h-8 text-gray-400 dark:text-gray-500 animate-float" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Nenhum concurso encontrado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tente ajustar os filtros de busca ou aguarde novos concursos</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Trophy className="w-3 h-3" />
              <span>Novos concursos são adicionados frequentemente</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contests.map((contest) => {
            const daysRemaining = getDaysRemaining(contest.deadline)
            const urgency = getUrgencyConfig(daysRemaining)
            const UrgencyIcon = urgency.icon
            const leftBorderColor = getLeftBorderColor(daysRemaining)
            const isUrgent = daysRemaining !== null && daysRemaining >= 0 && daysRemaining < 7

            // Dynamic gradient based on deadline urgency
            const urgencyGradient = daysRemaining === null ? 'from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900'
              : daysRemaining < 0 ? 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800'
              : daysRemaining <= 7 ? 'from-red-50 to-amber-50 dark:from-red-950/20 dark:to-amber-950/20'
              : daysRemaining <= 30 ? 'from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20'
              : 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20'

            return (
              <Card
                key={contest.id}
                className={cn(
                  'rounded-xl shadow-sm border-0 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] border-l-4 relative overflow-hidden',
                  leftBorderColor,
                  'hover:border-l-[6px]',
                  `bg-gradient-to-br ${urgencyGradient}`
                )}
                onClick={() => setSelectedContestId(contest.id)}
              >
                {/* Badge ribbon for urgent contests */}
                {isUrgent && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-red-500 text-white text-[8px] font-bold px-3 py-0.5 rounded-bl-lg shadow-sm">
                      URGENTE
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-2 flex-1">{contest.title}</h4>
                      </div>
                      {contest.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{contest.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{contest.city}/{contest.state}</span>
                      </div>
                      {contest.deadline && (
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Prazo: {formatDate(contest.deadline)}</span>
                          {/* Urgency badge with pulse for <7 days */}
                          {daysRemaining !== null && daysRemaining >= 0 && (
                            <span className={cn(
                              'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium border',
                              urgency.bgColor, urgency.color, urgency.borderColor,
                              isUrgent && 'animate-badge-pulse'
                            )}>
                              <UrgencyIcon className="w-2.5 h-2.5" />
                              {urgency.label}
                            </span>
                          )}
                          {daysRemaining !== null && daysRemaining < 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                              Encerrado
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(contest.professionalType))}>
                          {getRoleLabel(contest.professionalType)}
                        </span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getStatusColor(contest.status))}>
                          {getStatusLabel(contest.status)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      {contest.link && (
                        <a
                          href={contest.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded-xl flex items-center justify-center transition-colors group"
                          onClick={(e) => e.stopPropagation()}
                          title="Ver edital"
                        >
                          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
