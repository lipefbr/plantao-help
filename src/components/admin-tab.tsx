'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { formatCurrency, formatDate, getRoleLabel, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield, Users, Building2, Trophy, MapPin, DollarSign,
  Check, X, Plus, Edit, Trash2, Loader2, Search
} from 'lucide-react'
import { toast } from 'sonner'

export function AdminTab() {
  const { adminSubTab, setAdminSubTab, user } = useAppStore()

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Shield className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">Acesso restrito a administradores</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Painel Administrativo</h2>

      <Tabs value={adminSubTab} onValueChange={(v) => setAdminSubTab(v as typeof adminSubTab)} className="w-full">
        <TabsList className="w-full bg-gray-100 rounded-xl p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="users" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Hospitais
          </TabsTrigger>
          <TabsTrigger value="contests" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Concursos
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            Locais
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            Taxas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="hospitals" className="mt-4">
          <HospitalsPanel />
        </TabsContent>
        <TabsContent value="contests" className="mt-4">
          <ContestsPanel />
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <LocationsPanel />
        </TabsContent>
        <TabsContent value="fees" className="mt-4">
          <FeesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ──────────────────────────────────────
// USERS PANEL
// ──────────────────────────────────────
function UsersPanel() {
  const { user } = useAppStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDING')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) setUsers(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleApprove = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminId: user.id }),
      })
      if (res.ok) {
        toast.success(status === 'APPROVED' ? 'Usuário aprovado!' : 'Usuário rejeitado')
        loadUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar status')
      }
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 rounded-lg h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : users.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum usuário encontrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((u: any) => (
            <Card key={u.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(u.role))}>
                        {getRoleLabel(u.role)}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getStatusColor(u.registrationStatus))}>
                        {getStatusLabel(u.registrationStatus)}
                      </span>
                    </div>
                    {u.professionalDoc && <p className="text-[10px] text-gray-400 mt-1">Doc: {u.professionalDoc}</p>}
                    {u.city && <p className="text-[10px] text-gray-400">{u.city}/{u.state}</p>}
                  </div>
                  {u.registrationStatus === 'PENDING' && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleApprove(u.id, 'APPROVED')}
                        className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleApprove(u.id, 'REJECTED')}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// HOSPITALS PANEL
// ──────────────────────────────────────
function HospitalsPanel() {
  const { user } = useAppStore()
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')

  const loadHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hospitals')
      if (res.ok) setHospitals(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadHospitals() }, [loadHospitals])

  const resetForm = () => {
    setName(''); setAddress(''); setCity(''); setState(''); setPhone('')
    setEditingId(null); setShowForm(false)
  }

  const handleEdit = (h: any) => {
    setName(h.name); setAddress(h.address || ''); setCity(h.city); setState(h.state); setPhone(h.phone || '')
    setEditingId(h.id); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const url = editingId ? `/api/hospitals/${editingId}` : '/api/hospitals'
      const method = editingId ? 'PUT' : 'POST'
      const body: any = { name, address, city, state, phone, userId: user.id }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingId ? 'Hospital atualizado!' : 'Hospital criado!')
        resetForm()
        loadHospitals()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar hospital')
      }
    } catch {
      toast.error('Erro ao salvar hospital')
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este hospital?')) return
    try {
      const res = await fetch(`/api/hospitals/${id}?userId=${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Hospital excluído!')
        loadHospitals()
      } else {
        toast.error('Erro ao excluir hospital')
      }
    } catch {
      toast.error('Erro ao excluir hospital')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{hospitals.length} hospitais</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">{editingId ? 'Editar Hospital' : 'Novo Hospital'}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Nome *" value={name} onChange={e => setName(e.target.value)} required className="rounded-lg text-sm" />
              <Input placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} className="rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
                <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
              </div>
              <Input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-lg text-sm" />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Salvar</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-lg text-sm">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : hospitals.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum hospital cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hospitals.map((h: any) => (
            <Card key={h.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                  <p className="text-xs text-gray-500">{h.city}/{h.state}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(h)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// CONTESTS PANEL
// ──────────────────────────────────────
function ContestsPanel() {
  const { user } = useAppStore()
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [professionalType, setProfessionalType] = useState<UserRole>('MEDICO')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [deadline, setDeadline] = useState('')
  const [link, setLink] = useState('')

  const loadContests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contests')
      if (res.ok) setContests(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadContests() }, [loadContests])

  const resetForm = () => {
    setTitle(''); setDescription(''); setProfessionalType('MEDICO')
    setCity(''); setState(''); setDeadline(''); setLink('')
    setEditingId(null); setShowForm(false)
  }

  const handleEdit = (c: any) => {
    setTitle(c.title); setDescription(c.description || ''); setProfessionalType(c.professionalType)
    setCity(c.city); setState(c.state); setLink(c.link || '')
    setDeadline(c.deadline ? new Date(c.deadline).toISOString().split('T')[0] : '')
    setEditingId(c.id); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const url = editingId ? `/api/contests/${editingId}` : '/api/contests'
      const method = editingId ? 'PUT' : 'POST'
      const body: any = {
        title, description, professionalType, city, state,
        deadline: deadline || null, link: link || null,
        userId: user.id,
      }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingId ? 'Concurso atualizado!' : 'Concurso criado!')
        resetForm()
        loadContests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar concurso')
      }
    } catch {
      toast.error('Erro ao salvar concurso')
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este concurso?')) return
    try {
      const res = await fetch(`/api/contests/${id}?userId=${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Concurso excluído!')
        loadContests()
      } else {
        toast.error('Erro ao excluir concurso')
      }
    } catch {
      toast.error('Erro ao excluir concurso')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{contests.length} concursos</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">{editingId ? 'Editar Concurso' : 'Novo Concurso'}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Título *" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg text-sm" />
              <Textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="rounded-lg text-sm resize-none" rows={2} />
              <Select value={professionalType} onValueChange={(v) => setProfessionalType(v as UserRole)}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                  <SelectItem value="ENFERMEIRO">Enfermeiro(a)</SelectItem>
                  <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
                <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
              </div>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-lg text-sm" />
              <Input placeholder="Link" value={link} onChange={e => setLink(e.target.value)} className="rounded-lg text-sm" />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Salvar</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-lg text-sm">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : contests.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum concurso cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contests.map((c: any) => (
            <Card key={c.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.city}/{c.state}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(c.professionalType))}>
                        {getRoleLabel(c.professionalType)}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getStatusColor(c.status))}>
                        {getStatusLabel(c.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(c)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                      <Edit className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
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

// ──────────────────────────────────────
// LOCATIONS PANEL
// ──────────────────────────────────────
function LocationsPanel() {
  const { user } = useAppStore()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const loadLocations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/locations')
      if (res.ok) setLocations(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadLocations() }, [loadLocations])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, adminId: user.id }),
      })
      if (res.ok) {
        toast.success('Localização adicionada!')
        setCity(''); setState('')
        loadLocations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao adicionar localização')
      }
    } catch {
      toast.error('Erro ao adicionar localização')
    }
  }

  return (
    <div className="space-y-3">
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Adicionar Localização</p>
          <form onSubmit={handleAdd} className="flex items-end gap-2">
            <div className="flex-1">
              <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
            </div>
            <div className="w-20">
              <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : locations.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhuma localização cadastrada</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {locations.map((loc: any) => (
            <Card key={loc.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-800">{loc.city}/{loc.state}</span>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', loc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800')}>
                  {loc.active ? 'Ativo' : 'Inativo'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// FEES PANEL
// ──────────────────────────────────────
function FeesPanel() {
  const { user } = useAppStore()
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const loadFees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fees')
      if (res.ok) setFees(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadFees() }, [loadFees])

  const handleEdit = (fee: any) => {
    setEditingId(fee.id)
    setEditValue(String(fee.value))
  }

  const handleSave = async (id: string) => {
    if (!user) return
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value: parseFloat(editValue), adminId: user.id }),
      })
      if (res.ok) {
        toast.success('Taxa atualizada!')
        setEditingId(null)
        loadFees()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar taxa')
      }
    } catch {
      toast.error('Erro ao atualizar taxa')
    }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : fees.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhuma taxa cadastrada</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {fees.map((fee: any) => (
            <Card key={fee.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(fee.professionalType))}>
                      {getRoleLabel(fee.professionalType)}
                    </span>
                    {fee.description && <p className="text-xs text-gray-500 mt-1">{fee.description}</p>}
                  </div>
                  {editingId === fee.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-24 rounded-lg text-sm h-8"
                      />
                      <Button size="sm" onClick={() => handleSave(fee.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="rounded-lg text-xs">
                        X
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(fee.value)}</span>
                      <button
                        onClick={() => handleEdit(fee)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// HELPERS
// ──────────────────────────────────────
function getProfessionalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    MEDICO: 'bg-blue-100 text-blue-800',
    ENFERMEIRO: 'bg-purple-100 text-purple-800',
    TECNICO_ENFERMAGEM: 'bg-orange-100 text-orange-800',
    EMPRESA: 'bg-teal-100 text-teal-800',
    ADMIN: 'bg-gray-100 text-gray-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
