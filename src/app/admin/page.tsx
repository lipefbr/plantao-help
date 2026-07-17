'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore, type UserRole } from '@/lib/store'
import { formatCurrency, formatDate, getRoleLabel, getProfessionalTypeColor, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
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
  Check, X, Plus, Edit, Trash2, Loader2, Search, TrendingUp,
  Calendar, Star, BarChart3, Eye, ArrowUpDown, Clock, Banknote,
  ArrowUpRight, ArrowDownRight, Download, LogOut, Settings,
  LayoutDashboard, UserCheck, UserX, Activity, CreditCard,
  ChevronRight, Stethoscope, HeartPulse,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

type AdminSubTab = 'dashboard' | 'users' | 'shifts' | 'hospitals' | 'contests' | 'locations' | 'fees'

const navItems: { key: AdminSubTab; label: string; icon: typeof Shield }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Usuários', icon: Users },
  { key: 'shifts', label: 'Plantões', icon: Calendar },
  { key: 'hospitals', label: 'Hospitais', icon: Building2 },
  { key: 'contests', label: 'Concursos', icon: Trophy },
  { key: 'locations', label: 'Localizações', icon: MapPin },
  { key: 'fees', label: 'Taxas', icon: CreditCard },
]

const COLORS = ['#10b981', '#059669', '#0d9488', '#14b8a6', '#34d399', '#6ee7b7', '#a7f3d0']

export default function AdminPanelPage() {
  const { user, setUser } = useAppStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminSubTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Analytics data
  const [stats, setStats] = useState<any>(null)
  const [revenue, setRevenue] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [contests, setContests] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Search
  const [userSearch, setUserSearch] = useState('')
  const [shiftSearch, setShiftSearch] = useState('')

  // Edit dialogs
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingHospital, setEditingHospital] = useState<any>(null)
  const [editingContest, setEditingContest] = useState<any>(null)
  const [editingFee, setEditingFee] = useState<any>(null)

  // New item dialogs
  const [showNewHospital, setShowNewHospital] = useState(false)
  const [showNewContest, setShowNewContest] = useState(false)
  const [showNewLocation, setShowNewLocation] = useState(false)

  // Form states
  const [hospitalForm, setHospitalForm] = useState({ name: '', address: '', city: '', state: '', phone: '' })
  const [contestForm, setContestForm] = useState({ title: '', description: '', professionalType: 'MEDICO', city: '', state: '', deadline: '', link: '' })
  const [locationForm, setLocationForm] = useState({ city: '', state: '' })

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.replace('/admin/login')
    } else if (user.role !== 'ADMIN') {
      router.replace('/admin/login')
    }
  }, [user, router])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, revenueRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/revenue'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (revenueRes.ok) setRevenue((await revenueRes.json()).monthly || [])
    } catch (e) {
      console.error('Failed to load dashboard data', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setUsers(await res.json())
    } catch (e) {
      console.error('Failed to load users', e)
    }
  }, [])

  const loadShifts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/shifts')
      if (res.ok) setShifts(await res.json())
    } catch (e) {
      console.error('Failed to load shifts', e)
    }
  }, [])

  const loadHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals')
      if (res.ok) setHospitals(await res.json())
    } catch (e) {
      console.error('Failed to load hospitals', e)
    }
  }, [])

  const loadContests = useCallback(async () => {
    try {
      const res = await fetch('/api/contests')
      if (res.ok) setContests(await res.json())
    } catch (e) {
      console.error('Failed to load contests', e)
    }
  }, [])

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/locations')
      if (res.ok) setLocations(await res.json())
    } catch (e) {
      console.error('Failed to load locations', e)
    }
  }, [])

  const loadFees = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/fees')
      if (res.ok) setFees(await res.json())
    } catch (e) {
      console.error('Failed to load fees', e)
    }
  }, [])

  // Load data when tab changes
  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    switch (activeTab) {
      case 'dashboard': loadDashboardData(); break
      case 'users': loadUsers(); break
      case 'shifts': loadShifts(); break
      case 'hospitals': loadHospitals(); break
      case 'contests': loadContests(); break
      case 'locations': loadLocations(); break
      case 'fees': loadFees(); break
    }
  }, [activeTab, user, loadDashboardData, loadUsers, loadShifts, loadHospitals, loadContests, loadLocations, loadFees])

  const handleLogout = () => {
    setUser(null)
    router.replace('/admin/login')
  }

  // User actions
  const approveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Usuário aprovado!')
        loadUsers()
      }
    } catch { toast.error('Erro ao aprovar usuário') }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Usuário excluído!')
        loadUsers()
      }
    } catch { toast.error('Erro ao excluir usuário') }
  }

  const cancelShift = async (shiftId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este plantão?')) return
    try {
      const res = await fetch(`/api/admin/shifts/${shiftId}/cancel`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Plantão cancelado!')
        loadShifts()
      }
    } catch { toast.error('Erro ao cancelar plantão') }
  }

  const deleteShift = async (shiftId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plantão?')) return
    try {
      const res = await fetch(`/api/admin/shifts/${shiftId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plantão excluído!')
        loadShifts()
      }
    } catch { toast.error('Erro ao excluir plantão') }
  }

  // Hospital CRUD
  const saveHospital = async () => {
    try {
      const url = editingHospital ? `/api/hospitals/${editingHospital.id}` : '/api/hospitals'
      const method = editingHospital ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospitalForm),
      })
      if (res.ok) {
        toast.success(editingHospital ? 'Hospital atualizado!' : 'Hospital criado!')
        setEditingHospital(null)
        setShowNewHospital(false)
        setHospitalForm({ name: '', address: '', city: '', state: '', phone: '' })
        loadHospitals()
      }
    } catch { toast.error('Erro ao salvar hospital') }
  }

  const deleteHospital = async (id: string) => {
    if (!confirm('Excluir hospital?')) return
    try {
      const res = await fetch(`/api/hospitals/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Hospital excluído!'); loadHospitals() }
    } catch { toast.error('Erro ao excluir') }
  }

  // Contest CRUD
  const saveContest = async () => {
    try {
      const url = editingContest ? `/api/contests/${editingContest.id}` : '/api/contests'
      const method = editingContest ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestForm),
      })
      if (res.ok) {
        toast.success(editingContest ? 'Concurso atualizado!' : 'Concurso criado!')
        setEditingContest(null)
        setShowNewContest(false)
        setContestForm({ title: '', description: '', professionalType: 'MEDICO', city: '', state: '', deadline: '', link: '' })
        loadContests()
      }
    } catch { toast.error('Erro ao salvar concurso') }
  }

  const deleteContest = async (id: string) => {
    if (!confirm('Excluir concurso?')) return
    try {
      const res = await fetch(`/api/contests/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Concurso excluído!'); loadContests() }
    } catch { toast.error('Erro ao excluir') }
  }

  // Location CRUD
  const saveLocation = async () => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm),
      })
      if (res.ok) {
        toast.success('Localização criada!')
        setShowNewLocation(false)
        setLocationForm({ city: '', state: '' })
        loadLocations()
      }
    } catch { toast.error('Erro ao criar localização') }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Excluir localização?')) return
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Localização excluída!'); loadLocations() }
    } catch { toast.error('Erro ao excluir') }
  }

  // Fee CRUD
  const saveFee = async () => {
    if (!editingFee) return
    try {
      const res = await fetch(`/api/admin/fees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFee),
      })
      if (res.ok) {
        toast.success('Taxa atualizada!')
        setEditingFee(null)
        loadFees()
      }
    } catch { toast.error('Erro ao atualizar taxa') }
  }

  const exportData = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/export?type=${type}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `plantaohelp-${type}-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`${type} exportados com sucesso!`)
      }
    } catch { toast.error('Erro ao exportar dados') }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/30 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredShifts = shifts.filter(s =>
    s.title.toLowerCase().includes(shiftSearch.toLowerCase()) ||
    s.city.toLowerCase().includes(shiftSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 border-r border-white/[0.06]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">PlantãoHelp</p>
            <p className="text-[10px] text-emerald-400 font-medium">Painel Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === item.key
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl justify-start gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 border-r border-white/[0.06] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setSidebarOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeTab === item.key
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-white/[0.06]">
              <Button variant="ghost" onClick={handleLogout} className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl justify-start gap-2 text-sm">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex-1 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">
                  {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Gerencie todos os dados do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportData(activeTab)}
                className="text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 text-xs"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 text-xs"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Ver Site</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-28 rounded-2xl bg-gray-800" />
                  ))}
                </div>
              ) : stats ? (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Usuários', value: stats.totalUsers, icon: Users, color: 'emerald', change: '+12%' },
                      { label: 'Plantões', value: stats.totalShifts, icon: Calendar, color: 'teal', change: '+8%' },
                      { label: 'Receita Total', value: formatCurrency(stats.totalRevenue || 0), icon: Banknote, color: 'green', change: '+23%' },
                      { label: 'Avaliação Média', value: `${stats.averageRating?.toFixed(1) || '0'} ★`, icon: Star, color: 'lime', change: '+0.3' },
                    ].map((stat, i) => (
                      <Card key={i} className="bg-gray-900 border-white/[0.06] rounded-2xl overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                              <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
                              </div>
                            </div>
                            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', `bg-${stat.color}-500/15`)}>
                              <stat.icon className={cn('w-5 h-5', `text-${stat.color}-400`)} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-900 border-white/[0.06] rounded-2xl">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Receita Mensal
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenue}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                              <YAxis stroke="#6b7280" fontSize={11} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#10b981' }}
                              />
                              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-white/[0.06] rounded-2xl">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-teal-400" />
                          Plantões por Status
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Disponível', value: stats.availableShifts || 0 },
                                  { name: 'Vendido', value: stats.soldShifts || 0 },
                                  { name: 'Cancelado', value: stats.cancelledShifts || 0 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {COLORS.map((color, i) => (
                                  <Cell key={i} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick actions */}
                  <Card className="bg-gray-900 border-white/[0.06] rounded-2xl">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Ações Rápidas
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Gerenciar Usuários', icon: Users, tab: 'users' as AdminSubTab },
                          { label: 'Ver Plantões', icon: Calendar, tab: 'shifts' as AdminSubTab },
                          { label: 'Hospitais', icon: Building2, tab: 'hospitals' as AdminSubTab },
                          { label: 'Concursos', icon: Trophy, tab: 'contests' as AdminSubTab },
                        ].map(action => (
                          <button
                            key={action.tab}
                            onClick={() => setActiveTab(action.tab)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group"
                          >
                            <action.icon className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 ml-auto transition-colors" />
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">Erro ao carregar dados do dashboard</div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 bg-gray-900 border-white/[0.06] text-white placeholder:text-gray-500 rounded-xl h-10 focus:ring-0 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="bg-gray-900 border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cidade</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getProfessionalTypeColor(u.role))}>
                              {getRoleLabel(u.role)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getStatusColor(u.registrationStatus))}>
                              {getStatusLabel(u.registrationStatus)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {u.city ? `${u.city}/${u.state}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {u.registrationStatus === 'PENDING' && (
                                <button
                                  onClick={() => approveUser(u.id)}
                                  className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Aprovar"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-gray-500 text-sm">
                            Nenhum usuário encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Shifts Tab */}
          {activeTab === 'shifts' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar plantões..."
                    value={shiftSearch}
                    onChange={(e) => setShiftSearch(e.target.value)}
                    className="pl-9 bg-gray-900 border-white/[0.06] text-white placeholder:text-gray-500 rounded-xl h-10 focus:ring-0 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="bg-gray-900 border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plantão</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredShifts.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-white">{s.title}</p>
                              <p className="text-xs text-gray-500">{s.city}/{s.state}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-emerald-400 font-medium">{formatCurrency(s.value)}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getProfessionalTypeColor(s.professionalType))}>
                              {getRoleLabel(s.professionalType)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getStatusColor(s.status))}>
                              {getStatusLabel(s.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{formatDate(s.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {s.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => cancelShift(s.id)}
                                  className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteShift(s.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredShifts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">Nenhum plantão encontrado</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Hospitals Tab */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400">Total: {hospitals.length} hospitais</h3>
                <Button
                  onClick={() => { setShowNewHospital(true); setHospitalForm({ name: '', address: '', city: '', state: '', phone: '' }) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-sm h-9"
                >
                  <Plus className="w-4 h-4" /> Novo Hospital
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitals.map(h => (
                  <Card key={h.id} className="bg-gray-900 border-white/[0.06] rounded-2xl hover:border-emerald-500/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{h.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{h.city}/{h.state}</p>
                          {h.address && <p className="text-xs text-gray-600 mt-0.5">{h.address}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingHospital(h); setHospitalForm({ name: h.name, address: h.address || '', city: h.city, state: h.state, phone: h.phone || '' }) }}
                            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteHospital(h.id)}
                            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Hospital edit/create dialog */}
              <Dialog open={showNewHospital || !!editingHospital} onOpenChange={(open) => { if (!open) { setShowNewHospital(false); setEditingHospital(null) } }}>
                <DialogContent className="bg-gray-900 border-white/[0.06] text-white rounded-2xl max-w-md" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle className="text-white">{editingHospital ? 'Editar Hospital' : 'Novo Hospital'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-400">Nome</Label>
                      <Input value={hospitalForm.name} onChange={e => setHospitalForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Endereço</Label>
                      <Input value={hospitalForm.address} onChange={e => setHospitalForm(f => ({ ...f, address: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-400">Cidade</Label>
                        <Input value={hospitalForm.city} onChange={e => setHospitalForm(f => ({ ...f, city: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Estado</Label>
                        <Input value={hospitalForm.state} onChange={e => setHospitalForm(f => ({ ...f, state: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Telefone</Label>
                      <Input value={hospitalForm.phone} onChange={e => setHospitalForm(f => ({ ...f, phone: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <Button onClick={saveHospital} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      {editingHospital ? 'Salvar Alterações' : 'Criar Hospital'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Contests Tab */}
          {activeTab === 'contests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400">Total: {contests.length} concursos</h3>
                <Button
                  onClick={() => { setShowNewContest(true); setContestForm({ title: '', description: '', professionalType: 'MEDICO', city: '', state: '', deadline: '', link: '' }) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-sm h-9"
                >
                  <Plus className="w-4 h-4" /> Novo Concurso
                </Button>
              </div>
              <div className="bg-gray-900 border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Concurso</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Local</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {contests.map(c => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-white">{c.title}</p>
                            {c.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getProfessionalTypeColor(c.professionalType))}>
                              {getRoleLabel(c.professionalType)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{c.city}/{c.state}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn('text-[10px]', getStatusColor(c.status))}>
                              {getStatusLabel(c.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingContest(c); setContestForm({ title: c.title, description: c.description || '', professionalType: c.professionalType, city: c.city, state: c.state, deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 10) : '', link: c.link || '' }) }}
                                className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteContest(c.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Dialog open={showNewContest || !!editingContest} onOpenChange={(open) => { if (!open) { setShowNewContest(false); setEditingContest(null) } }}>
                <DialogContent className="bg-gray-900 border-white/[0.06] text-white rounded-2xl max-w-md" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle className="text-white">{editingContest ? 'Editar Concurso' : 'Novo Concurso'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-400">Título</Label>
                      <Input value={contestForm.title} onChange={e => setContestForm(f => ({ ...f, title: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Descrição</Label>
                      <Textarea value={contestForm.description} onChange={e => setContestForm(f => ({ ...f, description: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Tipo de Profissional</Label>
                      <Select value={contestForm.professionalType} onValueChange={v => setContestForm(f => ({ ...f, professionalType: v }))}>
                        <SelectTrigger className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/[0.06]">
                          <SelectItem value="MEDICO">Médico</SelectItem>
                          <SelectItem value="ENFERMEIRO">Enfermeiro</SelectItem>
                          <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-400">Cidade</Label>
                        <Input value={contestForm.city} onChange={e => setContestForm(f => ({ ...f, city: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Estado</Label>
                        <Input value={contestForm.state} onChange={e => setContestForm(f => ({ ...f, state: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Prazo</Label>
                      <Input type="date" value={contestForm.deadline} onChange={e => setContestForm(f => ({ ...f, deadline: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Link</Label>
                      <Input value={contestForm.link} onChange={e => setContestForm(f => ({ ...f, link: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <Button onClick={saveContest} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      {editingContest ? 'Salvar Alterações' : 'Criar Concurso'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400">Total: {locations.length} localizações</h3>
                <Button
                  onClick={() => { setShowNewLocation(true); setLocationForm({ city: '', state: '' }) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 text-sm h-9"
                >
                  <Plus className="w-4 h-4" /> Nova Localização
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((l: any) => (
                  <Card key={l.id} className="bg-gray-900 border-white/[0.06] rounded-2xl">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{l.city}</p>
                          <p className="text-xs text-gray-500">{l.state}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteLocation(l.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={showNewLocation} onOpenChange={setShowNewLocation}>
                <DialogContent className="bg-gray-900 border-white/[0.06] text-white rounded-2xl max-w-sm" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle className="text-white">Nova Localização</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-400">Cidade</Label>
                      <Input value={locationForm.city} onChange={e => setLocationForm(f => ({ ...f, city: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Estado</Label>
                      <Input value={locationForm.state} onChange={e => setLocationForm(f => ({ ...f, state: e.target.value }))} className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1" />
                    </div>
                    <Button onClick={saveLocation} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      Criar Localização
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400">Taxas de Cadastro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fees.map((f: any) => (
                  <Card key={f.id} className="bg-gray-900 border-white/[0.06] rounded-2xl hover:border-emerald-500/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={cn('text-[10px] mb-2', getProfessionalTypeColor(f.professionalType))}>
                            {getRoleLabel(f.professionalType)}
                          </Badge>
                          <p className="text-2xl font-bold text-white">{formatCurrency(f.value)}</p>
                          {f.description && <p className="text-xs text-gray-500 mt-1">{f.description}</p>}
                        </div>
                        <button
                          onClick={() => setEditingFee({ ...f })}
                          className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={!!editingFee} onOpenChange={(open) => { if (!open) setEditingFee(null) }}>
                <DialogContent className="bg-gray-900 border-white/[0.06] text-white rounded-2xl max-w-sm" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle className="text-white">Editar Taxa</DialogTitle>
                  </DialogHeader>
                  {editingFee && (
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label className="text-xs text-gray-400">Valor (R$)</Label>
                        <Input
                          type="number"
                          value={editingFee.value}
                          onChange={e => setEditingFee({ ...editingFee, value: parseFloat(e.target.value) })}
                          className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Descrição</Label>
                        <Input
                          value={editingFee.description || ''}
                          onChange={e => setEditingFee({ ...editingFee, description: e.target.value })}
                          className="bg-gray-800 border-white/[0.06] text-white rounded-xl mt-1"
                        />
                      </div>
                      <Button onClick={saveFee} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        Salvar Alterações
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
