'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, getProfessionalTypeColor, getShiftType, getShiftTypeColor, getShiftTypeIcon, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, Clock, Plus, SlidersHorizontal, X, Star, ArrowUpDown, GitCompare, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

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

export function PlantoesTab() {
  const { user, setSelectedShiftId, setShowAuthModal, setAuthMode } = useAppStore()
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState(user?.city || '')
  const [state, setState] = useState(user?.state || '')
  const [professionalType, setProfessionalType] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateShift, setShowCreateShift] = useState(false)
  const [comparisonIds, setComparisonIds] = useState<string[]>([])
  const [showComparisonDialog, setShowComparisonDialog] = useState(false)

  const loadShifts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', 'AVAILABLE')
      if (search) params.set('search', search)
      if (city) params.set('city', city)
      if (state) params.set('state', state)
      if (professionalType) params.set('professionalType', professionalType)
      if (minValue) params.set('minValue', minValue)
      if (maxValue) params.set('maxValue', maxValue)
      if (sortBy && sortBy !== 'recent') params.set('sortBy', sortBy)

      const res = await fetch(`/api/shifts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setShifts(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [search, city, state, professionalType, minValue, maxValue, sortBy])

  useEffect(() => {
    loadShifts()
  }, [loadShifts])

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId)
  }

  const handleCreateShift = () => {
    if (!user) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    setShowCreateShift(true)
  }

  const clearFilters = () => {
    setCity('')
    setState('')
    setProfessionalType('')
    setSearch('')
    setMinValue('')
    setMaxValue('')
    setSortBy('recent')
  }

  const toggleComparison = (shiftId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setComparisonIds(prev => {
      if (prev.includes(shiftId)) {
        return prev.filter(id => id !== shiftId)
      }
      if (prev.length >= 3) {
        toast.warning('Máximo de 3 plantões para comparação')
        return prev
      }
      return [...prev, shiftId]
    })
  }

  const clearComparison = () => {
    setComparisonIds([])
  }

  const comparisonShifts = shifts.filter(s => comparisonIds.includes(s.id))
  const activeFilterCount = [city, state, professionalType, minValue, maxValue].filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar plantões..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-400/50 transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'rounded-xl h-10 w-10 shrink-0',
              showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="rounded-lg h-9 text-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="price_asc">Menor preço</SelectItem>
            <SelectItem value="price_desc">Maior preço</SelectItem>
            <SelectItem value="rating">Melhor avaliação</SelectItem>
          </SelectContent>
        </Select>
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
              <Select value={professionalType} onValueChange={setProfessionalType}>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Valor mín. (R$)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="rounded-lg text-sm h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Valor máx. (R$)</label>
                <Input
                  type="number"
                  placeholder="9999"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="rounded-lg text-sm h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? 'Buscando...' : `${shifts.length} plant${shifts.length !== 1 ? 'ões' : 'ão'} encontrado${shifts.length !== 1 ? 's' : ''}`}
        </p>
        {comparisonIds.length > 0 && (
          <button
            onClick={clearComparison}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar seleção ({comparisonIds.length})
          </button>
        )}
      </div>

      {/* Shift List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <Card className="rounded-2xl bg-gray-50 border-0">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-3 animate-pulse" />
            <p className="text-gray-600 font-medium">Nenhum plantão encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
            <Button
              variant="outline"
              className="mt-3 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 relative">
          {/* Gradient overlay at bottom when scrollable */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-10" />
          {shifts.map((shift) => {
            const isNew = new Date().getTime() - new Date(shift.date).getTime() < 2 * 24 * 60 * 60 * 1000
            const isSelected = comparisonIds.includes(shift.id)
            return (
            <Card
              key={shift.id}
              className={cn(
                "rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400 hover:border-l-emerald-500 relative",
                isSelected && 'ring-2 ring-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10'
              )}
              onClick={() => handleShiftClick(shift.id)}
            >
              <CardContent className="p-4">
                {/* Comparison checkbox - top right */}
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => toggleComparison(shift.id, e)}
                >
                  <button
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 border-2',
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:scale-105'
                    )}
                    aria-label={isSelected ? 'Remover da comparação' : 'Adicionar à comparação'}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <GitCompare className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{shift.title}</h4>
                      {isNew && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500 text-white rounded-full font-bold animate-badge-pulse shrink-0">Novo</span>
                      )}
                    </div>
                    {shift.hospital && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{shift.hospital.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{shift.city}/{shift.state}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">
                          {shift.seller.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{shift.seller.name}</span>
                      {shift.seller.avgRating > 0 && (
                        <span className="text-xs text-amber-500 shrink-0">
                          <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />
                          {shift.seller.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">{formatCurrency(shift.value)}</p>
                    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block border border-current/20', getProfessionalTypeColor(shift.professionalType))}>
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
            )
          })}
        </div>
      )}

      {/* Floating Comparison Bar */}
      {comparisonIds.length >= 2 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-slideUp w-[calc(100%-2rem)] max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 p-3 flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {comparisonShifts.slice(0, 3).map(shift => (
                <div
                  key={shift.id}
                  className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-white dark:border-gray-900 flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400">{shift.title.charAt(0)}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {comparisonIds.length} plant{comparisonIds.length !== 1 ? 'ões' : 'ão'} selecionado{comparisonIds.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {comparisonShifts.map(s => s.title).join(' • ')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 gap-1.5 shadow-sm"
                onClick={() => setShowComparisonDialog(true)}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Comparar
              </Button>
              <button
                onClick={clearComparison}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-600" />
              Comparação de Plantões
            </DialogTitle>
            <DialogDescription>
              Compare até 3 plantões lado a lado. Os melhores valores estão destacados em verde.
            </DialogDescription>
          </DialogHeader>

          {comparisonShifts.length >= 2 && (
            <ShiftComparisonTable shifts={comparisonShifts} />
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                clearComparison()
                setShowComparisonDialog(false)
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Limpar seleção
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              onClick={() => setShowComparisonDialog(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      {user?.registrationStatus === 'APPROVED' && user.role !== 'ADMIN' && (
        <button
          onClick={handleCreateShift}
          className={cn(
            "fixed right-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-float ring-4 ring-emerald-400/20 hover:ring-emerald-400/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 z-40",
            comparisonIds.length >= 2 ? "bottom-36 w-12 h-12" : "bottom-20 w-14 h-14"
          )}
        >
          <Plus className={comparisonIds.length >= 2 ? "w-5 h-5" : "w-6 h-6"} />
        </button>
      )}

      {/* Create Shift Modal - rendered inline */}
      {showCreateShift && (
        <CreateShiftInline
          onClose={() => setShowCreateShift(false)}
          onCreated={loadShifts}
        />
      )}
    </div>
  )
}

// Comparison Table Component
function ShiftComparisonTable({ shifts }: { shifts: ShiftItem[] }) {
  // Find best values for highlighting
  const bestValue = Math.min(...shifts.map(s => s.value))
  const bestRating = Math.max(...shifts.map(s => s.seller.avgRating))

  const rows: { label: string; icon: React.ReactNode; values: React.ReactNode[]; compareFn?: (values: (number | string)[]) => number[] }[] = [
    {
      label: 'Título',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      values: shifts.map(s => (
        <span key={s.id} className="font-medium text-sm text-gray-800 dark:text-gray-200">{s.title}</span>
      )),
    },
    {
      label: 'Data',
      icon: <Clock className="w-3.5 h-3.5" />,
      values: shifts.map(s => (
        <span key={s.id} className="text-sm text-gray-700 dark:text-gray-300">{formatDate(s.date)}</span>
      )),
    },
    {
      label: 'Horário',
      icon: <Clock className="w-3.5 h-3.5" />,
      values: shifts.map(s => (
        <span key={s.id} className="text-sm text-gray-700 dark:text-gray-300">{s.startTime} - {s.endTime}</span>
      )),
    },
    {
      label: 'Valor',
      icon: <span className="text-xs">💰</span>,
      values: shifts.map(s => {
        const isBest = s.value === bestValue && shifts.length > 1
        return (
          <span key={s.id} className={cn(
            'text-sm font-bold',
            isBest ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
          )}>
            {formatCurrency(s.value)}
            {isBest && <span className="ml-1 text-[10px] font-normal">✓ Melhor</span>}
          </span>
        )
      }),
      compareFn: (values) => {
        const nums = values.map(Number)
        const min = Math.min(...nums)
        return nums.map(n => n === min ? 1 : 0)
      }
    },
    {
      label: 'Cidade/Estado',
      icon: <MapPin className="w-3.5 h-3.5" />,
      values: shifts.map(s => (
        <span key={s.id} className="text-sm text-gray-700 dark:text-gray-300">{s.city}/{s.state}</span>
      )),
    },
    {
      label: 'Hospital',
      icon: <span className="text-xs">🏥</span>,
      values: shifts.map(s => (
        <span key={s.id} className="text-sm text-gray-700 dark:text-gray-300">{s.hospital?.name || '—'}</span>
      )),
    },
    {
      label: 'Tipo Profissional',
      icon: <span className="text-xs">🩺</span>,
      values: shifts.map(s => (
        <Badge key={s.id} variant="secondary" className={cn('text-[11px] px-2 py-0 h-5 font-medium', getProfessionalTypeColor(s.professionalType))}>
          {getRoleLabel(s.professionalType)}
        </Badge>
      )),
    },
    {
      label: 'Tipo Turno',
      icon: <span className="text-xs">⏰</span>,
      values: shifts.map(s => {
        const shiftType = getShiftType(s.startTime, s.endTime)
        return (
          <Badge key={s.id} variant="secondary" className={cn('text-[11px] px-2 py-0 h-5 font-medium', getShiftTypeColor(shiftType))}>
            {getShiftTypeIcon(shiftType)} {shiftType}
          </Badge>
        )
      }),
    },
    {
      label: 'Vendedor',
      icon: <span className="text-xs">👤</span>,
      values: shifts.map(s => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">{s.seller.name.charAt(0)}</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{s.seller.name}</span>
        </div>
      )),
    },
    {
      label: 'Avaliação Vendedor',
      icon: <Star className="w-3.5 h-3.5" />,
      values: shifts.map(s => {
        const isBest = s.seller.avgRating === bestRating && bestRating > 0 && shifts.length > 1
        return (
          <span key={s.id} className={cn(
            'text-sm font-medium',
            isBest ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
          )}>
            {s.seller.avgRating > 0 ? (
              <>
                <Star className="w-3 h-3 inline fill-amber-400 text-amber-400 mr-0.5" />
                {s.seller.avgRating.toFixed(1)}
                {isBest && <span className="ml-1 text-[10px] font-normal">✓ Melhor</span>}
              </>
            ) : '—'}
          </span>
        )
      }),
    },
  ]

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 w-28 shrink-0">
              Critério
            </th>
            {shifts.map((shift) => (
              <th key={shift.id} className="text-left py-2 px-2 text-xs font-semibold text-gray-800 dark:text-gray-200 min-w-[140px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400">{shift.title.charAt(0)}</span>
                  </div>
                  <span className="truncate">{shift.title}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            // Determine which cells should be highlighted (best value per row)
            const isValueRow = row.label === 'Valor'
            const isRatingRow = row.label === 'Avaliação Vendedor'

            return (
              <tr
                key={row.label}
                className={cn(
                  idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : '',
                  'border-b border-gray-100 dark:border-gray-800'
                )}
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    {row.icon}
                    <span className="text-xs font-medium">{row.label}</span>
                  </div>
                </td>
                {row.values.map((val, valIdx) => {
                  const isBest = isValueRow
                    ? shifts[valIdx].value === bestValue && shifts.length > 1
                    : isRatingRow
                      ? shifts[valIdx].seller.avgRating === bestRating && bestRating > 0 && shifts.length > 1
                      : false

                  return (
                    <td
                      key={valIdx}
                      className={cn(
                        'py-2.5 px-2',
                        isBest && 'bg-emerald-50 dark:bg-emerald-900/20 rounded-md'
                      )}
                    >
                      {val}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function getShiftStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800',
    SOLD: 'bg-amber-100 text-amber-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getShiftStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponível',
    SOLD: 'Vendido',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

// Inline create shift component (opens as overlay)
function CreateShiftInline({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [value, setValue] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState(user?.city || '')
  const [state, setState] = useState(user?.state || '')
  const [professionalType, setProfessionalType] = useState(user?.role === 'EMPRESA' ? 'MEDICO' : (user?.role || 'MEDICO'))
  const [hospitalId, setHospitalId] = useState('')

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const params = new URLSearchParams()
        if (user?.city) params.set('city', user.city)
        if (user?.state) params.set('state', user.state)
        const res = await fetch(`/api/hospitals?${params.toString()}`)
        if (res.ok) setHospitals(await res.json())
      } catch { /* */ }
    }
    loadHospitals()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, date, startTime, endTime,
          value: parseFloat(value), location, city, state,
          professionalType,
          hospitalId: hospitalId || undefined,
          sellerId: user.id,
        }),
      })
      if (res.ok) {
        onCreated()
        onClose()
        toast.success('Plantão publicado com sucesso!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao publicar plantão')
      }
    } catch {
      toast.error('Erro ao publicar plantão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Publicar Plantão</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Título *</label>
              <Input placeholder="Plantão UTI Adulto" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Descrição</label>
              <textarea placeholder="Detalhes do plantão..." value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Data *</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Valor (R$) *</label>
                <Input type="number" step="0.01" placeholder="500.00" value={value} onChange={e => setValue(e.target.value)} required className="rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Início *</label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Fim *</label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Local *</label>
              <Input placeholder="Hospital XYZ - Ala A" value={location} onChange={e => setLocation(e.target.value)} required className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Cidade *</label>
                <Input placeholder="São Paulo" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Estado *</label>
                <Input placeholder="SP" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg" maxLength={2} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Tipo de Profissional *</label>
              <Select value={professionalType} onValueChange={setProfessionalType}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                  <SelectItem value="ENFERMEIRO">Enfermeiro(a)</SelectItem>
                  <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hospitals.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Hospital</label>
                <Select value={hospitalId} onValueChange={setHospitalId}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {hospitals.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Plantão'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
