'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MapPin, Clock, Plus, SlidersHorizontal, X, Star } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateShift, setShowCreateShift] = useState(false)

  const loadShifts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', 'AVAILABLE')
      if (search) params.set('search', search)
      if (city) params.set('city', city)
      if (state) params.set('state', state)
      if (professionalType) params.set('professionalType', professionalType)

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
  }, [search, city, state, professionalType])

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
  }

  const hasActiveFilters = city || state || professionalType

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
            className="pl-9 rounded-xl bg-white border-gray-200"
          />
        </div>
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
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? 'Buscando...' : `${shifts.length} plantão${shifts.length !== 1 ? 'ões' : ''} encontrado${shifts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Shift List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Nenhum plantão encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <Card
              key={shift.id}
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
              onClick={() => handleShiftClick(shift.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
                    {shift.hospital && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{shift.hospital.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-emerald-700">
                          {shift.seller.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 truncate">{shift.seller.name}</span>
                      {shift.seller.avgRating > 0 && (
                        <span className="text-xs text-amber-500 shrink-0">
                          <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />
                          {shift.seller.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-700 font-bold">{formatCurrency(shift.value)}</p>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block', getProfessionalTypeColor(shift.professionalType))}>
                      {getRoleLabel(shift.professionalType)}
                    </span>
                    <div className="mt-1">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getShiftStatusColor(shift.status))}>
                        {getShiftStatusLabel(shift.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {user?.registrationStatus === 'APPROVED' && user.role !== 'ADMIN' && (
        <button
          onClick={handleCreateShift}
          className="fixed bottom-20 right-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-40"
        >
          <Plus className="w-6 h-6" />
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

function getProfessionalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    MEDICO: 'bg-blue-100 text-blue-800',
    ENFERMEIRO: 'bg-purple-100 text-purple-800',
    TECNICO_ENFERMAGEM: 'bg-orange-100 text-orange-800',
    EMPRESA: 'bg-teal-100 text-teal-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
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


