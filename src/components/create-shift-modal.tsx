'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'

interface Hospital {
  id: string
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

export function CreateShiftModal({ open, onClose, onCreated }: Props) {
  const { user } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [value, setValue] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState(user?.city || '')
  const [state, setState] = useState(user?.state || '')
  const [professionalType, setProfessionalType] = useState(
    user?.role === 'EMPRESA' ? 'MEDICO' : (user?.role || 'MEDICO')
  )
  const [hospitalId, setHospitalId] = useState('')

  useEffect(() => {
    if (open) {
      loadHospitals()
      setCity(user?.city || '')
      setState(user?.state || '')
    }
  }, [open, user])

  const loadHospitals = async () => {
    try {
      const params = new URLSearchParams()
      if (user?.city) params.set('city', user.city)
      if (user?.state) params.set('state', user.state)
      const res = await fetch(`/api/hospitals?${params.toString()}`)
      if (res.ok) setHospitals(await res.json())
    } catch { /* */ }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setValue('')
    setLocation('')
    setCity(user?.city || '')
    setState(user?.state || '')
    setProfessionalType(user?.role === 'EMPRESA' ? 'MEDICO' : (user?.role || 'MEDICO'))
    setHospitalId('')
    onClose()
  }

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
          hospitalId: hospitalId && hospitalId !== 'none' ? hospitalId : undefined,
          sellerId: user.id,
        }),
      })
      if (res.ok) {
        toast.success('Plantão publicado com sucesso!')
        onCreated?.()
        handleClose()
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-emerald-700">Publicar Plantão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input placeholder="Plantão UTI Adulto" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea placeholder="Detalhes do plantão..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" placeholder="500.00" value={value} onChange={e => setValue(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Início *</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div className="space-y-2">
              <Label>Fim *</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Local *</Label>
            <Input placeholder="Hospital XYZ - Ala A" value={location} onChange={e => setLocation(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cidade *</Label>
              <Input placeholder="São Paulo" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Input placeholder="SP" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" maxLength={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Profissional *</Label>
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
            <div className="space-y-2">
              <Label>Hospital</Label>
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
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publicar Plantão
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
