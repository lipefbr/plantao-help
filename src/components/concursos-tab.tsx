'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { formatDate, getRoleLabel, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trophy, MapPin, Calendar, ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react'

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

export function ConcursosTab() {
  const { user } = useAppStore()
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
        <h2 className="text-lg font-bold text-gray-800">Concursos</h2>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'rounded-lg',
            showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" />
          Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Filtros</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Cidade</label>
                <Input
                  placeholder="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-lg text-sm h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Estado</label>
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
              <label className="text-xs text-gray-500">Tipo de Profissional</label>
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
      <p className="text-sm text-gray-500">
        {loading ? 'Buscando...' : `${contests.length} concurso${contests.length !== 1 ? 's' : ''} encontrado${contests.length !== 1 ? 's' : ''}`}
      </p>

      {/* Contest List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : contests.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Nenhum concurso encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contests.map((contest) => (
            <Card key={contest.id} className="rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">{contest.title}</h4>
                    {contest.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{contest.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">{contest.city}/{contest.state}</span>
                    </div>
                    {contest.deadline && (
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500">Prazo: {formatDate(contest.deadline)}</span>
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
                  <div className="shrink-0">
                    {contest.link && (
                      <a
                        href={contest.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-5 h-5 text-emerald-600" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function getProfessionalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    MEDICO: 'bg-blue-100 text-blue-800',
    ENFERMEIRO: 'bg-purple-100 text-purple-800',
    TECNICO_ENFERMAGEM: 'bg-orange-100 text-orange-800',
    EMPRESA: 'bg-teal-100 text-teal-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
