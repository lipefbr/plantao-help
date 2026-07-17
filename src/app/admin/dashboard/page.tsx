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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  LayoutDashboard, Users, Calendar, Building2, Trophy, CreditCard,
  DollarSign, MapPin, Search, Bell, LogOut, Menu, X, Plus, Edit,
  Trash2, Loader2, Check, ArrowUpRight, ArrowDownRight, Download,
  Eye, ChevronRight, Settings, ShieldCheck, TrendingUp, Activity,
  Star, Clock, UserCheck, UserX, ExternalLink, Crown, Sparkles,
  Zap, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = 'dashboard' | 'users' | 'shifts' | 'hospitals' | 'contests' | 'plans' | 'fees' | 'locations'

interface Stats {
  totalUsers: number
  usersByRole: Record<string, number>
  totalShifts: number
  shiftsByStatus: Record<string, number>
  revenue: number
  averageShiftValue: number
  totalHospitals: number
  totalLocations: number
  totalRatings: number
  recentRegistrations: Array<{
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
  recentShifts: Array<{
    id: string
    status: string
    value: number
    createdAt: string
    seller: { id: string; name: string; role: string }
    buyer: { id: string; name: string; role: string } | null
    hospital: { id: string; name: string } | null
  }>
}

interface RevenueData {
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  averageShiftValue: number
  revenueTrend: number
  topCities: Array<{ city: string; state: string; revenue: number; count: number }>
  topStates: Array<{ state: string; revenue: number; count: number }>
  totalSoldShifts: number
  totalAllShifts: number
}

interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string
  maxShifts: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { users: number }
}

interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  registrationStatus: string
  city: string | null
  state: string | null
  createdAt: string
  plan: { name: string } | null
}

interface ShiftData {
  id: string
  date: string
  startTime: string
  endTime: string
  value: number
  status: string
  city: string
  state: string
  seller: { id: string; name: string; role: string }
  buyer: { id: string; name: string; role: string } | null
  hospital: { id: string; name: string } | null
  createdAt: string
}

interface HospitalData {
  id: string
  name: string
  city: string
  state: string
  active: boolean
  _count: { shifts: number }
}

interface ContestData {
  id: string
  title: string
  institution: string
  state: string
  status: string
  registrationDeadline: string
  _count: { shifts: number }
}

interface LocationData {
  id: string
  city: string
  state: string
  active: boolean
  _count: { shifts: number }
}

interface FeeData {
  id: string
  type: string
  value: number
  description: string
  active: boolean
}

// ─── Navigation Items ────────────────────────────────────────────────────────

const navItems: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Usuários', icon: Users },
  { key: 'shifts', label: 'Plantões', icon: Calendar },
  { key: 'hospitals', label: 'Hospitais', icon: Building2 },
  { key: 'contests', label: 'Concursos', icon: Trophy },
  { key: 'plans', label: 'Planos', icon: CreditCard },
  { key: 'fees', label: 'Taxas', icon: DollarSign },
  { key: 'locations', label: 'Localizações', icon: MapPin },
]

// ─── Chart Colors ────────────────────────────────────────────────────────────

const CHART_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#f97316']
const PIE_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  SOLD: '#f59e0b',
  CANCELLED: '#ef4444',
  PENDING: '#8b5cf6',
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, setUser } = useAppStore()

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [shifts, setShifts] = useState<ShiftData[]>([])
  const [hospitals, setHospitals] = useState<HospitalData[]>([])
  const [contests, setContests] = useState<ContestData[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [fees, setFees] = useState<FeeData[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])

  // Dialog states
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showHospitalDialog, setShowHospitalDialog] = useState(false)
  const [editingHospital, setEditingHospital] = useState<HospitalData | null>(null)
  const [showContestDialog, setShowContestDialog] = useState(false)
  const [editingContest, setEditingContest] = useState<ContestData | null>(null)
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Plan form state
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    description: '',
    features: '',
    maxShifts: 0,
    isActive: true,
  })

  // Hospital form state
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    city: '',
    state: '',
    active: true,
  })

  // Contest form state
  const [contestForm, setContestForm] = useState({
    title: '',
    institution: '',
    state: '',
    status: 'ACTIVE',
    registrationDeadline: '',
  })

  // Location form state
  const [locationForm, setLocationForm] = useState({
    city: '',
    state: '',
  })

  // Fee form state
  const [feeForm, setFeeForm] = useState({
    platformFee: 0,
    processingFee: 0,
  })

  // ─── Auth Guard ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.replace('/admin/login')
    }
  }, [user, router])

  // ─── Data Fetching ─────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/stats?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [user?.id])

  const fetchRevenue = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/revenue?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setRevenueData(data)
      }
    } catch (err) {
      console.error('Failed to fetch revenue:', err)
    }
  }, [user?.id])

  const fetchUsers = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/users?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }, [user?.id])

  const fetchShifts = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/shifts?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setShifts(data)
      }
    } catch (err) {
      console.error('Failed to fetch shifts:', err)
    }
  }, [user?.id])

  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals')
      if (res.ok) {
        const data = await res.json()
        setHospitals(data)
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err)
    }
  }, [])

  const fetchContests = useCallback(async () => {
    try {
      const res = await fetch('/api/contests')
      if (res.ok) {
        const data = await res.json()
        setContests(data)
      }
    } catch (err) {
      console.error('Failed to fetch contests:', err)
    }
  }, [])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err)
    }
  }, [])

  const fetchFees = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/fees?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setFees(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length > 0) {
          const platformFee = data.find((f: FeeData) => f.type === 'platform')
          const processingFee = data.find((f: FeeData) => f.type === 'processing')
          setFeeForm({
            platformFee: platformFee?.value || 0,
            processingFee: processingFee?.value || 0,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch fees:', err)
    }
  }, [user?.id])

  const fetchLocations = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/admin/locations?adminId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setLocations(data)
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }, [user?.id])

  // Load data on mount & tab change
  useEffect(() => {
    if (!user?.id || user.role !== 'ADMIN') return

    const loadData = async () => {
      setLoading(true)
      switch (activeTab) {
        case 'dashboard':
          await Promise.all([fetchStats(), fetchRevenue()])
          break
        case 'users':
          await fetchUsers()
          break
        case 'shifts':
          await fetchShifts()
          break
        case 'hospitals':
          await fetchHospitals()
          break
        case 'contests':
          await fetchContests()
          break
        case 'plans':
          await fetchPlans()
          break
        case 'fees':
          await fetchFees()
          break
        case 'locations':
          await fetchLocations()
          break
      }
      setLoading(false)
    }
    loadData()
  }, [activeTab, user?.id, user?.role, fetchStats, fetchRevenue, fetchUsers, fetchShifts, fetchHospitals, fetchContests, fetchPlans, fetchFees, fetchLocations])

  // ─── Action Handlers ─────────────────────────────────────────────────────

  const handleLogout = () => {
    setUser(null)
    router.replace('/admin/login')
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve?adminId=${user?.id}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Usuário aprovado com sucesso!')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao aprovar usuário')
      }
    } catch {
      toast.error('Erro ao aprovar usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}?adminId=${user?.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Usuário excluído com sucesso!')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir usuário')
      }
    } catch {
      toast.error('Erro ao excluir usuário')
    }
  }

  const handleCancelShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/admin/shifts/${shiftId}/cancel?adminId=${user?.id}`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Plantão cancelado com sucesso!')
        fetchShifts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao cancelar plantão')
      }
    } catch {
      toast.error('Erro ao cancelar plantão')
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const res = await fetch(`/api/admin/shifts/${shiftId}?adminId=${user?.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plantão excluído com sucesso!')
        fetchShifts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir plantão')
      }
    } catch {
      toast.error('Erro ao excluir plantão')
    }
  }

  const handleExport = (type: string) => {
    window.open(`/api/admin/export?type=${type}&adminId=${user?.id}`, '_blank')
  }

  // ─── Plan CRUD ──────────────────────────────────────────────────────────

  const openPlanDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      const parsedFeatures = typeof plan.features === 'string'
        ? (() => { try { return JSON.parse(plan.features).join('\n') } catch { return plan.features } })()
        : Array.isArray(plan.features) ? plan.features.join('\n') : String(plan.features)
      setPlanForm({
        name: plan.name,
        price: plan.price,
        description: plan.description || '',
        features: parsedFeatures,
        maxShifts: plan.maxShifts,
        isActive: plan.isActive,
      })
    } else {
      setEditingPlan(null)
      setPlanForm({ name: '', price: 0, description: '', features: '', maxShifts: 5, isActive: true })
    }
    setShowPlanDialog(true)
  }

  const handleSavePlan = async () => {
    setSaving(true)
    try {
      const featuresList = planForm.features.split('\n').filter(f => f.trim())
      const featuresJson = JSON.stringify(featuresList)

      const body = {
        ...planForm,
        features: featuresJson,
        adminId: user?.id,
        ...(editingPlan ? { id: editingPlan.id } : {}),
      }

      const res = await fetch('/api/plans', {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingPlan ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!')
        setShowPlanDialog(false)
        fetchPlans()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar plano')
      }
    } catch {
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch(`/api/plans?id=${planId}&adminId=${user?.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plano excluído com sucesso!')
        fetchPlans()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir plano')
      }
    } catch {
      toast.error('Erro ao excluir plano')
    }
  }

  // ─── Hospital CRUD ─────────────────────────────────────────────────────

  const openHospitalDialog = (hospital?: HospitalData) => {
    if (hospital) {
      setEditingHospital(hospital)
      setHospitalForm({ name: hospital.name, city: hospital.city, state: hospital.state, active: hospital.active })
    } else {
      setEditingHospital(null)
      setHospitalForm({ name: '', city: '', state: '', active: true })
    }
    setShowHospitalDialog(true)
  }

  const handleSaveHospital = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/hospitals', {
        method: editingHospital ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hospitalForm, adminId: user?.id, ...(editingHospital ? { id: editingHospital.id } : {}) }),
      })
      if (res.ok) {
        toast.success(editingHospital ? 'Hospital atualizado!' : 'Hospital criado!')
        setShowHospitalDialog(false)
        fetchHospitals()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar hospital')
      }
    } catch {
      toast.error('Erro ao salvar hospital')
    } finally {
      setSaving(false)
    }
  }

  // ─── Contest CRUD ──────────────────────────────────────────────────────

  const openContestDialog = (contest?: ContestData) => {
    if (contest) {
      setEditingContest(contest)
      setContestForm({
        title: contest.title,
        institution: contest.institution,
        state: contest.state,
        status: contest.status,
        registrationDeadline: contest.registrationDeadline ? contest.registrationDeadline.split('T')[0] : '',
      })
    } else {
      setEditingContest(null)
      setContestForm({ title: '', institution: '', state: '', status: 'ACTIVE', registrationDeadline: '' })
    }
    setShowContestDialog(true)
  }

  const handleSaveContest = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/contests', {
        method: editingContest ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contestForm, adminId: user?.id, ...(editingContest ? { id: editingContest.id } : {}) }),
      })
      if (res.ok) {
        toast.success(editingContest ? 'Concurso atualizado!' : 'Concurso criado!')
        setShowContestDialog(false)
        fetchContests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar concurso')
      }
    } catch {
      toast.error('Erro ao salvar concurso')
    } finally {
      setSaving(false)
    }
  }

  // ─── Location CRUD ─────────────────────────────────────────────────────

  const handleSaveLocation = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...locationForm, adminId: user?.id }),
      })
      if (res.ok) {
        toast.success('Localização criada com sucesso!')
        setShowLocationDialog(false)
        setLocationForm({ city: '', state: '' })
        fetchLocations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao criar localização')
      }
    } catch {
      toast.error('Erro ao criar localização')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const res = await fetch(`/api/admin/locations/${locationId}?adminId=${user?.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Localização excluída!')
        fetchLocations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir localização')
      }
    } catch {
      toast.error('Erro ao excluir localização')
    }
  }

  // ─── Fee Update ────────────────────────────────────────────────────────

  const handleSaveFees = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feeForm, adminId: user?.id }),
      })
      if (res.ok) {
        toast.success('Taxas atualizadas com sucesso!')
        fetchFees()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar taxas')
      }
    } catch {
      toast.error('Erro ao atualizar taxas')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete Confirmation ───────────────────────────────────────────────

  const confirmDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setShowDeleteDialog(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    switch (deleteTarget.type) {
      case 'user':
        await handleDeleteUser(deleteTarget.id)
        break
      case 'shift':
        await handleDeleteShift(deleteTarget.id)
        break
      case 'plan':
        await handleDeletePlan(deleteTarget.id)
        break
      case 'hospital':
        try {
          const res = await fetch(`/api/hospitals/${deleteTarget.id}?adminId=${user?.id}`, { method: 'DELETE' })
          if (res.ok) { toast.success('Hospital excluído!'); fetchHospitals() }
          else { const d = await res.json(); toast.error(d.error || 'Erro') }
        } catch { toast.error('Erro') }
        break
      case 'contest':
        try {
          const res = await fetch(`/api/contests/${deleteTarget.id}?adminId=${user?.id}`, { method: 'DELETE' })
          if (res.ok) { toast.success('Concurso excluído!'); fetchContests() }
          else { const d = await res.json(); toast.error(d.error || 'Erro') }
        } catch { toast.error('Erro') }
        break
      case 'location':
        await handleDeleteLocation(deleteTarget.id)
        break
    }
    setShowDeleteDialog(false)
    setDeleteTarget(null)
    setSaving(false)
  }

  // ─── Chart Data Prep ───────────────────────────────────────────────────

  const shiftsPieData = stats?.shiftsByStatus
    ? Object.entries(stats.shiftsByStatus).map(([name, value]) => ({ name: getStatusLabel(name), value, color: PIE_COLORS[name] || '#6b7280' }))
    : []

  const usersPieData = stats?.usersByRole
    ? Object.entries(stats.usersByRole).map(([name, value]) => ({ name: getRoleLabel(name), value, color: CHART_COLORS[Object.keys(stats.usersByRole).indexOf(name) % CHART_COLORS.length] }))
    : []

  const revenueBarData = revenueData?.topStates
    ? revenueData.topStates.map(s => ({ name: s.state, receita: s.revenue, plantoes: s.count }))
    : []

  // ─── Filter helpers ────────────────────────────────────────────────────

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredShifts = shifts.filter(s =>
    s.hospital?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── Render helpers ────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )

  // ─── Not authorized ────────────────────────────────────────────────────

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Verificando acesso...</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o login</p>
        </Card>
      </div>
    )
  }

  // ─── Main Layout ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar Overlay (mobile) ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Plantão Help</h1>
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setSidebarOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-emerald-400' : '')} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400/60" />}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800/60">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transition-colors"
          >
            <ExternalLink className="w-[18px] h-[18px]" />
            Ver Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-1"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shrink-0 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm rounded-lg"
            />
          </div>

          <div className="flex-1 sm:hidden" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => toast.info('Notificações em breve!')}
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </Button>

            <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-[11px] text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* ─── Dashboard Tab ────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            loading ? renderSkeleton() : (
              <div className="space-y-6">
                {/* Page Title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Visão geral da plataforma Plantão Help</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('users')} className="text-xs">
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar
                    </Button>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Usuários"
                    value={stats?.totalUsers ?? 0}
                    icon={<Users className="w-5 h-5" />}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-600"
                    change={12}
                  />
                  <MetricCard
                    title="Total Plantões"
                    value={stats?.totalShifts ?? 0}
                    icon={<Calendar className="w-5 h-5" />}
                    iconBg="bg-teal-500/10"
                    iconColor="text-teal-600"
                    change={8}
                  />
                  <MetricCard
                    title="Receita Total"
                    value={formatCurrency(revenueData?.totalRevenue ?? stats?.revenue ?? 0)}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-600"
                    change={revenueData?.revenueTrend ?? 0}
                    isCurrency
                  />
                  <MetricCard
                    title="Avaliação Média"
                    value="4.8"
                    icon={<Star className="w-5 h-5" />}
                    iconBg="bg-purple-500/10"
                    iconColor="text-purple-600"
                    change={2}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Revenue Chart */}
                  <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Receita por Estado</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Top estados por faturamento</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {revenueData?.totalSoldShifts ?? 0} plantões vendidos
                        </Badge>
                      </div>
                      <div className="h-64">
                        {revenueBarData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                              <Tooltip
                                formatter={(value: number) => [formatCurrency(value), 'Receita']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                              />
                              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Nenhum dado de receita disponível
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1">Plantões por Status</h3>
                      <p className="text-xs text-gray-500 mb-3">Distribuição atual</p>
                      <div className="h-52">
                        {shiftsPieData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={shiftsPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {shiftsPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => [value, 'Plantões']} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
                        )}
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {shiftsPieData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Registrations */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1">Registros Recentes</h3>
                      <p className="text-xs text-gray-500 mb-4">Usuários aguardando aprovação</p>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
                          stats.recentRegistrations.map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                              </div>
                              <Badge className={cn('text-[10px]', getProfessionalTypeColor(u.role))}>
                                {getRoleLabel(u.role)}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleApproveUser(u.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">Nenhum registro pendente</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Shifts */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1">Plantões Recentes</h3>
                      <p className="text-xs text-gray-500 mb-4">Últimos plantões cadastrados</p>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats?.recentShifts && stats.recentShifts.length > 0 ? (
                          stats.recentShifts.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {s.hospital?.name || 'Hospital não informado'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(s.createdAt)} • {formatCurrency(s.value)}
                                </p>
                              </div>
                              <Badge className={cn('text-[10px]', getStatusColor(s.status))}>
                                {getStatusLabel(s.status)}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">Nenhum plantão recente</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <UserCheck className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Aprovar Usuários</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-100"
                      >
                        <CreditCard className="w-6 h-6 text-teal-600" />
                        <span className="text-xs font-medium text-teal-700">Gerenciar Planos</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('hospitals')}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100"
                      >
                        <Building2 className="w-6 h-6 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Novo Hospital</span>
                      </button>
                      <button
                        onClick={() => handleExport('shifts')}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100"
                      >
                        <Download className="w-6 h-6 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Exportar Dados</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}

          {/* ─── Users Tab ──────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            loading ? renderSkeleton() : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Usuários</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{users.length} usuários registrados</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('users')} className="text-xs">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar
                  </Button>
                </div>

                {/* Mobile search */}
                <div className="sm:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Usuário</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tipo</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Cidade</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Data</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {u.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <Badge className={cn('text-[10px]', getProfessionalTypeColor(u.role))}>
                                {getRoleLabel(u.role)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                              {u.city && u.state ? `${u.city}, ${u.state}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', getStatusColor(u.registrationStatus))}>
                                {getStatusLabel(u.registrationStatus)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {u.registrationStatus === 'PENDING' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => handleApproveUser(u.id)}
                                    title="Aprovar"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => confirmDelete('user', u.id, u.name)}
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Nenhum usuário encontrado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}

          {/* ─── Shifts Tab ─────────────────────────────────────────────── */}
          {activeTab === 'shifts' && (
            loading ? renderSkeleton() : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plantões</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{shifts.length} plantões cadastrados</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('shifts')} className="text-xs">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar
                  </Button>
                </div>

                <div className="sm:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar plantões..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Hospital</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Vendedor</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Valor</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Data</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredShifts.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{s.hospital?.name || '—'}</p>
                              <p className="text-xs text-gray-500">{s.city}, {s.state}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                              {s.seller?.name || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {formatCurrency(s.value)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', getStatusColor(s.status))}>
                                {getStatusLabel(s.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {formatDate(s.date)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {s.status !== 'CANCELLED' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleCancelShift(s.id)}
                                    title="Cancelar"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => confirmDelete('shift', s.id, s.hospital?.name || 'Plantão')}
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredShifts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Nenhum plantão encontrado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}

          {/* ─── Hospitals Tab ──────────────────────────────────────────── */}
          {activeTab === 'hospitals' && (
            loading ? renderSkeleton() : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hospitais</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{hospitals.length} hospitais cadastrados</p>
                  </div>
                  <Button size="sm" onClick={() => openHospitalDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Hospital
                  </Button>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Nome</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Cidade</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Plantões</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {hospitals.map(h => (
                          <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{h.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{h.city}, {h.state}</td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', h.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800')}>
                                {h.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{h._count?.shifts ?? 0}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  onClick={() => openHospitalDialog(h)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => confirmDelete('hospital', h.id, h.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {hospitals.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Nenhum hospital cadastrado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}

          {/* ─── Contests Tab ───────────────────────────────────────────── */}
          {activeTab === 'contests' && (
            loading ? renderSkeleton() : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Concursos</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{contests.length} concursos cadastrados</p>
                  </div>
                  <Button size="sm" onClick={() => openContestDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Concurso
                  </Button>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Título</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Instituição</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Prazo</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {contests.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                  <Trophy className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{c.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{c.institution}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{c.state}</td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', getStatusColor(c.status))}>
                                {getStatusLabel(c.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {formatDate(c.registrationDeadline)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  onClick={() => openContestDialog(c)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => confirmDelete('contest', c.id, c.title)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {contests.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Nenhum concurso cadastrado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}

          {/* ─── Plans Tab (CRITICAL) ───────────────────────────────────── */}
          {activeTab === 'plans' && (
            loading ? renderSkeleton() : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Planos</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Gerencie os planos de assinatura da plataforma</p>
                  </div>
                  <Button size="sm" onClick={() => openPlanDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo Plano
                  </Button>
                </div>

                {/* Plan Cards Grid */}
                {plans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {plans.map((plan, index) => {
                      const parsedFeatures = (() => {
                        try {
                          const parsed = JSON.parse(plan.features)
                          return Array.isArray(parsed) ? parsed : [String(plan.features)]
                        } catch {
                          return [String(plan.features)]
                        }
                      })()

                      const isPopular = index === 1 || (plans.length === 1 && index === 0)
                      const accentGradient = index === 0
                        ? 'from-emerald-500 to-emerald-600'
                        : index === 1
                          ? 'from-teal-500 to-teal-600'
                          : index === 2
                            ? 'from-emerald-600 to-teal-500'
                            : 'from-gray-500 to-gray-600'

                      return (
                        <Card
                          key={plan.id}
                          className={cn(
                            'relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group',
                            !plan.isActive && 'opacity-60'
                          )}
                        >
                          {/* Gradient top border */}
                          <div className={cn('h-1.5 bg-gradient-to-r', accentGradient)} />

                          {isPopular && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-emerald-500 text-white text-[10px] border-0 shadow-sm">
                                <Sparkles className="w-3 h-3 mr-1" /> Popular
                              </Badge>
                            </div>
                          )}

                          {!plan.isActive && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-gray-400 text-white text-[10px] border-0">Inativo</Badge>
                            </div>
                          )}

                          <CardContent className="p-6">
                            {/* Plan Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className={cn(
                                  'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-sm',
                                  accentGradient
                                )}>
                                  {index === 0 ? <Zap className="w-5 h-5 text-white" /> :
                                   index === 1 ? <Crown className="w-5 h-5 text-white" /> :
                                   <Sparkles className="w-5 h-5 text-white" />}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                {plan.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm text-gray-500">R$</span>
                                <span className="text-4xl font-extrabold text-gray-900">
                                  {plan.price % 1 === 0 ? plan.price.toFixed(0) : plan.price.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="text-sm text-gray-500">/mês</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Até {plan.maxShifts} plantões por mês
                              </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-2 mb-5 min-h-[80px]">
                              {parsedFeatures.map((feature: string, fi: number) => (
                                <div key={fi} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                  <span className="text-sm text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* Subscriber Count */}
                            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-gray-50">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                <span className="font-semibold text-gray-900">{plan._count?.users ?? 0}</span> assinantes
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-9 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                                onClick={() => openPlanDialog(plan)}
                              >
                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-xs border-gray-200 text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                                onClick={() => confirmDelete('plan', plan.id, plan.name)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Nenhum plano cadastrado</h3>
                      <p className="text-sm text-gray-500 mb-4">Crie seu primeiro plano de assinatura</p>
                      <Button size="sm" onClick={() => openPlanDialog()} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-1.5" /> Criar Plano
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          )}

          {/* ─── Fees Tab ───────────────────────────────────────────────── */}
          {activeTab === 'fees' && (
            loading ? renderSkeleton() : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Taxas</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Configure as taxas da plataforma</p>
                </div>

                <Card className="border-gray-200 shadow-sm max-w-lg">
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Taxa da Plataforma (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={feeForm.platformFee}
                        onChange={(e) => setFeeForm(prev => ({ ...prev, platformFee: parseFloat(e.target.value) || 0 }))}
                        className="h-10"
                      />
                      <p className="text-xs text-gray-400">Percentual cobrado sobre cada transação</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Taxa de Processamento (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={feeForm.processingFee}
                        onChange={(e) => setFeeForm(prev => ({ ...prev, processingFee: parseFloat(e.target.value) || 0 }))}
                        className="h-10"
                      />
                      <p className="text-xs text-gray-400">Percentual cobrado pelo gateway de pagamento</p>
                    </div>

                    <Button
                      onClick={handleSaveFees}
                      disabled={saving}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Salvar Taxas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          )}

          {/* ─── Locations Tab ──────────────────────────────────────────── */}
          {activeTab === 'locations' && (
            loading ? renderSkeleton() : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Localizações</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{locations.length} localizações cadastradas</p>
                  </div>
                  <Button size="sm" onClick={() => setShowLocationDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Nova Localização
                  </Button>
                </div>

                <Card className="border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Cidade</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Plantões</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {locations.map(l => (
                          <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4 text-teal-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{l.city}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{l.state}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{l._count?.shifts ?? 0}</td>
                            <td className="px-4 py-3">
                              <Badge className={cn('text-[10px]', l.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800')}>
                                {l.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => confirmDelete('location', l.id, `${l.city}, ${l.state}`)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {locations.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Nenhuma localização cadastrada</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          )}
        </main>
      </div>

      {/* ─── Dialogs ─────────────────────────────────────────────────────── */}

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Nome do Plano</Label>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Profissional"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="bg-gray-900 border-gray-700 text-white focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Max Plantões</Label>
                <Input
                  type="number"
                  value={planForm.maxShifts}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, maxShifts: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-900 border-gray-700 text-white focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Descrição</Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do plano..."
                rows={2}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Features (uma por linha)</Label>
              <Textarea
                value={planForm.features}
                onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Plantões ilimitados&#10;Suporte prioritário&#10;Relatórios avançados"
                rows={4}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 py-1">
              <Switch
                checked={planForm.isActive}
                onCheckedChange={(checked) => setPlanForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label className="text-gray-300 text-sm cursor-pointer">Plano ativo</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPlanDialog(false)}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePlan}
                disabled={saving || !planForm.name}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {editingPlan ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hospital Dialog */}
      <Dialog open={showHospitalDialog} onOpenChange={setShowHospitalDialog}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              {editingHospital ? 'Editar Hospital' : 'Novo Hospital'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Nome</Label>
              <Input
                value={hospitalForm.name}
                onChange={(e) => setHospitalForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do hospital"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Cidade</Label>
                <Input
                  value={hospitalForm.city}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Estado</Label>
                <Input
                  value={hospitalForm.state}
                  onChange={(e) => setHospitalForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 uppercase"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 py-1">
              <Switch
                checked={hospitalForm.active}
                onCheckedChange={(checked) => setHospitalForm(prev => ({ ...prev, active: checked }))}
              />
              <Label className="text-gray-300 text-sm cursor-pointer">Hospital ativo</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowHospitalDialog(false)} className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleSaveHospital} disabled={saving || !hospitalForm.name} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {editingHospital ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contest Dialog */}
      <Dialog open={showContestDialog} onOpenChange={setShowContestDialog}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              {editingContest ? 'Editar Concurso' : 'Novo Concurso'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Título</Label>
              <Input
                value={contestForm.title}
                onChange={(e) => setContestForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título do concurso"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Instituição</Label>
              <Input
                value={contestForm.institution}
                onChange={(e) => setContestForm(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Nome da instituição"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Estado</Label>
                <Input
                  value={contestForm.state}
                  onChange={(e) => setContestForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Status</Label>
                <Select
                  value={contestForm.status}
                  onValueChange={(value) => setContestForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="CLOSED">Encerrado</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-xs font-medium">Prazo de Inscrição</Label>
              <Input
                type="date"
                value={contestForm.registrationDeadline}
                onChange={(e) => setContestForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowContestDialog(false)} className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleSaveContest} disabled={saving || !contestForm.title} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {editingContest ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              Nova Localização
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Cidade</Label>
                <Input
                  value={locationForm.city}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-medium">Estado</Label>
                <Input
                  value={locationForm.state}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500 uppercase"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowLocationDialog(false)} className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleSaveLocation} disabled={saving || !locationForm.city} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm mt-2">
            Tem certeza que deseja excluir <span className="text-white font-medium">&quot;{deleteTarget?.name}&quot;</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null) }}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={executeDelete}
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Metric Card Component ───────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  isCurrency = false,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  change: number
  isCurrency?: boolean
}) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg, iconColor)}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {change >= 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={cn('text-xs font-semibold', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400">vs. mês anterior</span>
        </div>
      </CardContent>
    </Card>
  )
}
