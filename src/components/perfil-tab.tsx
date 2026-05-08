'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, AuthUser } from '@/lib/store'
import { formatCurrency, formatDate, getRoleLabel, getStatusColor, getStatusLabel, renderStars, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  User, Mail, Phone, MapPin, FileText, Shield, LogOut,
  Star, MessageSquare, Settings, LogIn, ChevronRight,
  Heart, Moon, Clock, MapPinIcon, Pencil, X, Save, Lock, Eye, EyeOff, Loader2,
  ScrollText, TrendingUp, ShoppingCart, DollarSign, CalendarDays, Award, BarChart3, Timer,
  Bell, Plus, Trash2, Sun, MoonStar, Sunrise, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

interface RatingItem {
  id: string
  stars: number
  comment: string | null
  createdAt: string
  rater: { id: string; name: string; avatar: string | null }
  shift: { id: string; title: string }
}

interface FavoriteShift {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  value: number
  city: string
  state: string
  status: string
  professionalType: string
  seller: { id: string; name: string; avgRating: number }
  hospital: { id: string; name: string } | null
}

interface UserStats {
  totalPublished: number
  totalSold: number
  totalCancelled: number
  totalBought: number
  totalEarned: number
  totalSpent: number
  avgRating: number
  mostCommonCity: string | null
  mostCommonState: string | null
  mostCommonShiftType: string | null
  accountAgeDays: number
  profileCompletion: number
  activityScore: number
  completionRate: number
  totalRatingsReceived: number
}

interface ShiftAlertItem {
  id: string
  userId: string
  professionalType: string | null
  city: string | null
  state: string | null
  minValue: number | null
  maxValue: number | null
  shiftType: string | null
  active: boolean
  createdAt: string
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
]

export function PerfilTab() {
  const { user, setUser, setShowAuthModal, setAuthMode, setActiveTab, setSelectedShiftId, darkMode, toggleDarkMode, favoriteIds, setFavoriteIds } = useAppStore()
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [favoriteShifts, setFavoriteShifts] = useState<FavoriteShift[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editState, setEditState] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editDoc, setEditDoc] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Legal dialog states
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // User stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Alerts state
  const [alerts, setAlerts] = useState<ShiftAlertItem[]>([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertForm, setAlertForm] = useState({
    professionalType: '',
    city: '',
    state: '',
    minValue: '',
    maxValue: '',
    shiftType: '',
  })
  const [savingAlert, setSavingAlert] = useState(false)

  useEffect(() => {
    if (user) {
      loadRatings()
      loadFavorites()
      loadUserStats()
      loadAlerts()
    }
  }, [user])

  // Sync edit form when user changes or edit mode activates
  useEffect(() => {
    if (user && isEditing) {
      setEditName(user.name || '')
      setEditPhone(user.phone || '')
      setEditCity(user.city || '')
      setEditState(user.state || '')
      setEditBio(user.bio || '')
      setEditDoc(user.professionalDoc || '')
    }
  }, [user, isEditing])

  const loadRatings = async () => {
    if (!user) return
    setLoadingRatings(true)
    try {
      const res = await fetch(`/api/users/${user.id}/ratings`)
      if (res.ok) {
        const data = await res.json()
        setRatings(data.ratings || [])
        setAvgRating(data.avgRating || 0)
        setTotalRatings(data.totalRatings || 0)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRatings(false)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    setLoadingFavorites(true)
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        // API returns { ...favorite, shift: { ...shiftData } }, extract shift data
        const shifts: FavoriteShift[] = data
          .filter((item: { shift: unknown }) => item.shift)
          .map((item: { shift: FavoriteShift; shiftId: string }) => ({
            ...item.shift,
            id: item.shiftId,
          }))
        setFavoriteShifts(shifts)
        setFavoriteIds(shifts.map((s: FavoriteShift) => s.id))
      }
    } catch {
      // silently fail
    } finally {
      setLoadingFavorites(false)
    }
  }

  const loadUserStats = async () => {
    if (!user) return
    setLoadingStats(true)
    try {
      const res = await fetch(`/api/users/${user.id}/stats`)
      if (res.ok) {
        const data = await res.json()
        setUserStats(data as UserStats)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingStats(false)
    }
  }

  const loadAlerts = async () => {
    if (!user) return
    setLoadingAlerts(true)
    try {
      const res = await fetch(`/api/alerts?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingAlerts(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleRemoveFavorite = async (shiftId: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/favorites/${shiftId}?userId=${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        setFavoriteShifts(favoriteShifts.filter(s => s.id !== shiftId))
        setFavoriteIds(favoriteIds.filter(id => id !== shiftId))
        toast.success('Removido dos favoritos')
      }
    } catch {
      // silently fail
    }
  }

  const handleStartEdit = () => {
    if (!user) return
    setEditName(user.name || '')
    setEditPhone(user.phone || '')
    setEditCity(user.city || '')
    setEditState(user.state || '')
    setEditBio(user.bio || '')
    setEditDoc(user.professionalDoc || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          city: editCity,
          state: editState,
          bio: editBio,
          professionalDoc: editDoc,
        })
      })
      if (res.ok) {
        const updatedUser = await res.json()
        setUser(updatedUser as AuthUser)
        setIsEditing(false)
        toast.success('Perfil atualizado com sucesso!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar perfil')
      }
    } catch {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (!currentPassword) {
      toast.error('Informe a senha atual')
      return
    }
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      if (res.ok) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Senha alterada com sucesso!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao alterar senha')
      }
    } catch {
      toast.error('Erro ao alterar senha')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleCreateAlert = async () => {
    if (!user) return

    const hasCriteria = alertForm.professionalType || alertForm.city || alertForm.state || alertForm.minValue || alertForm.maxValue || alertForm.shiftType
    if (!hasCriteria) {
      toast.error('Defina pelo menos um critério para o alerta')
      return
    }

    setSavingAlert(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...alertForm,
        })
      })
      if (res.ok) {
        setAlertForm({ professionalType: '', city: '', state: '', minValue: '', maxValue: '', shiftType: '' })
        setShowAlertForm(false)
        loadAlerts()
        toast.success('Alerta criado com sucesso!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao criar alerta')
      }
    } catch {
      toast.error('Erro ao criar alerta')
    } finally {
      setSavingAlert(false)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId))
        toast.success('Alerta excluído')
      }
    } catch {
      toast.error('Erro ao excluir alerta')
    }
  }

  const handleToggleAlert = async (alertId: string, currentActive: boolean) => {
    if (!user) return
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, active: !currentActive })
      })
      if (res.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, active: !currentActive } : a))
        toast.success(currentActive ? 'Alerta desativado' : 'Alerta ativado')
      }
    } catch {
      toast.error('Erro ao atualizar alerta')
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Perfil</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Faça login para ver seu perfil e histórico
        </p>
        <Button
          onClick={() => {
            setAuthMode('login')
            setShowAuthModal(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </Button>
      </div>
    )
  }

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const getProfessionalDocLabel = () => {
    switch (user.role) {
      case 'MEDICO': return 'CRM'
      case 'ENFERMEIRO':
      case 'TECNICO_ENFERMAGEM': return 'COREN'
      case 'EMPRESA': return 'CNPJ'
      default: return 'Documento Profissional'
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden relative">
        {/* Confetti-like decorative pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar with progress ring */}
            <div className="relative">
              <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="33" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="36" cy="36" r="33" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${((user.email ? 20 : 0) + (user.phone ? 20 : 0) + (user.city ? 15 : 0) + (user.professionalDoc ? 25 : 0) + (user.bio ? 20 : 0)) / 100 * 207.3} 207.3`} transform="rotate(-90 36 36)" />
              </svg>
              <Avatar className="w-16 h-16 border-3 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
              <p className="text-emerald-100 text-sm">{getRoleLabel(user.role)}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  user.registrationStatus === 'APPROVED' ? 'bg-emerald-400/30 text-emerald-50' :
                  user.registrationStatus === 'PENDING' ? 'bg-yellow-400/30 text-yellow-100' :
                  'bg-red-400/30 text-red-100'
                )}>
                  {getStatusLabel(user.registrationStatus)}
                </span>
                {/* Badge system */}
                {user.registrationStatus === 'APPROVED' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-400/30 text-emerald-50 inline-flex items-center gap-0.5">
                    ✓ Verificado
                  </span>
                )}
                {avgRating >= 4.5 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-400/30 text-amber-100 inline-flex items-center gap-0.5">
                    ⭐ Top
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {avgRating > 0 && (
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-lg">{renderStars(avgRating)}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''})</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Profile Completion Nudges */}
      <ProfileCompletionNudge
        user={user}
        onEdit={handleStartEdit}
      />

      {/* Profile Details */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TabsTrigger value="info" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Informações
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Heart className="w-3 h-3 mr-1" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Settings className="w-3 h-3 mr-1" />
            Config
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Bell className="w-3 h-3 mr-1" />
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Gradient divider accent */}
                <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Telefone</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{user.phone}</p>
                    </div>
                  </div>
                )}

                {(user.city || user.state) && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Localização</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{user.city}{user.city && user.state ? ', ' : ''}{user.state}</p>
                    </div>
                  </div>
                )}

                {user.professionalDoc && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{getProfessionalDocLabel()}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{user.professionalDoc}</p>
                    </div>
                  </div>
                )}

                {user.companyName && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Empresa</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{user.companyName}</p>
                    </div>
                  </div>
                )}

                {user.bio && (
                  <div className="p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Suas Estatísticas ── */}
          <Card className="rounded-xl shadow-sm border-0 mt-4 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Suas Estatísticas</h3>
              </div>

              {loadingStats ? (
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="text-center">
                      <Skeleton className="w-8 h-8 rounded-lg mx-auto mb-1.5" />
                      <Skeleton className="h-4 w-12 mx-auto mb-1" />
                      <Skeleton className="h-2.5 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : userStats ? (
                <div className="space-y-3">
                  {/* Row 1 */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.totalPublished}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Publicados</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.totalSold}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Vendidos</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.totalBought}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Comprados</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{formatCurrency(userStats.totalEarned)}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Total Ganho</p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="w-9 h-9 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{formatCurrency(userStats.totalSpent)}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Total Gasto</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.avgRating > 0 ? userStats.avgRating.toFixed(1) : '—'}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Avaliação Média</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.completionRate}%</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Taxa Conclusão</p>
                    </div>
                    <div className="text-center">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                        <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{userStats.accountAgeDays}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Membro há (dias)</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="mt-4">
          {/* Rating Distribution Chart */}
          {ratings.length > 0 && (
            <Card className="rounded-xl shadow-sm border-0 mb-4 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Distribuição de Avaliações</h3>
                </div>
                <div className="flex items-center gap-6">
                  {/* Average rating display */}
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </div>
                    <div className="text-amber-500 text-lg mt-0.5">
                      {renderStars(avgRating)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''}
                    </div>
                  </div>
                  {/* Horizontal bar chart */}
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(starCount => {
                      const count = ratings.filter(r => r.stars === starCount).length
                      const maxCount = Math.max(...[5, 4, 3, 2, 1].map(s => ratings.filter(r => r.stars === s).length), 1)
                      const widthPercent = (count / maxCount) * 100
                      return (
                        <div key={starCount} className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-6 text-right shrink-0">{starCount}★</span>
                          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 w-4 shrink-0">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {loadingRatings ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <Card className="rounded-2xl bg-gray-50 border-0">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma avaliação recebida ainda</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete transações para receber avaliações!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ratings.map((rating) => (
                <Card key={rating.id} className="rounded-xl shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-[10px] bg-gray-100 dark:bg-gray-800">
                            {rating.rater.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rating.rater.name}</span>
                      </div>
                      <span className="text-amber-500 text-sm">{renderStars(rating.stars)}</span>
                    </div>
                    {rating.comment && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{rating.comment}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      Plantão: {rating.shift.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          {loadingFavorites ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : favoriteShifts.length === 0 ? (
            <Card className="rounded-2xl bg-gray-50 border-0">
              <CardContent className="p-8 text-center">
                <Heart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum plantão favoritado</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Toque no ❤️ nos plantões para salvar aqui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {favoriteShifts.map((shift) => (
                <Card key={shift.id} className="rounded-xl shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          setSelectedShiftId(shift.id)
                          setActiveTab('plantoes')
                        }}
                      >
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{shift.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPinIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{shift.city}/{shift.state}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                        </div>
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mt-1">{formatCurrency(shift.value)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(shift.id)}
                        className="w-8 h-8 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Alertas de Plantão</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receba notificações quando plantões compatíveis forem publicados</p>
                  </div>
                </div>
                {!showAlertForm && (
                  <Button
                    onClick={() => setShowAlertForm(true)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Criar
                  </Button>
                )}
              </div>

              {/* Alert Creation Form */}
              {showAlertForm && (
                <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Criar Novo Alerta</p>
                    <Button
                      onClick={() => { setShowAlertForm(false); setAlertForm({ professionalType: '', city: '', state: '', minValue: '', maxValue: '', shiftType: '' }) }}
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Tipo Profissional</Label>
                      <select
                        value={alertForm.professionalType}
                        onChange={(e) => setAlertForm({ ...alertForm, professionalType: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      >
                        <option value="">Qualquer tipo</option>
                        <option value="MEDICO">Médico</option>
                        <option value="ENFERMEIRO">Enfermeiro</option>
                        <option value="TECNICO_ENFERMAGEM">Téc. Enfermagem</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Cidade</Label>
                        <Input
                          value={alertForm.city}
                          onChange={(e) => setAlertForm({ ...alertForm, city: e.target.value })}
                          placeholder="Qualquer cidade"
                          className="rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Estado</Label>
                        <select
                          value={alertForm.state}
                          onChange={(e) => setAlertForm({ ...alertForm, state: e.target.value })}
                          className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        >
                          <option value="">Qualquer estado</option>
                          {BRAZILIAN_STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Valor Mínimo (R$)</Label>
                        <Input
                          type="number"
                          value={alertForm.minValue}
                          onChange={(e) => setAlertForm({ ...alertForm, minValue: e.target.value })}
                          placeholder="0"
                          className="rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Valor Máximo (R$)</Label>
                        <Input
                          type="number"
                          value={alertForm.maxValue}
                          onChange={(e) => setAlertForm({ ...alertForm, maxValue: e.target.value })}
                          placeholder="Sem limite"
                          className="rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Tipo de Plantão</Label>
                      <select
                        value={alertForm.shiftType}
                        onChange={(e) => setAlertForm({ ...alertForm, shiftType: e.target.value })}
                        className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      >
                        <option value="">Qualquer tipo</option>
                        <option value="Diurno">☀️ Diurno</option>
                        <option value="Noturno">🌙 Noturno</option>
                        <option value="Misto">🌅 Misto</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={handleCreateAlert}
                        disabled={savingAlert}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2"
                      >
                        {savingAlert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                        {savingAlert ? 'Criando...' : 'Criar Alerta'}
                      </Button>
                      <Button
                        onClick={() => { setShowAlertForm(false); setAlertForm({ professionalType: '', city: '', state: '', minValue: '', maxValue: '', shiftType: '' }) }}
                        variant="outline"
                        className="flex-1 rounded-lg gap-2"
                        disabled={savingAlert}
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Alert List */}
              {loadingAlerts ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
                  <Bell className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum alerta configurado</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Crie alertas para ser notificado quando plantões compatíveis forem publicados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className={cn(
                      "rounded-xl border-0 shadow-sm transition-all",
                      alert.active ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50 opacity-60"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                              {alert.professionalType && (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                  {getRoleLabel(alert.professionalType as 'MEDICO' | 'ENFERMEIRO' | 'TECNICO_ENFERMAGEM' | 'EMPRESA' | 'ADMIN')}
                                </Badge>
                              )}
                              {alert.shiftType && (
                                <Badge variant="secondary" className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  {alert.shiftType === 'Diurno' ? '☀️' : alert.shiftType === 'Noturno' ? '🌙' : '🌅'} {alert.shiftType}
                                </Badge>
                              )}
                              {alert.city && (
                                <Badge variant="secondary" className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  📍 {alert.city}
                                </Badge>
                              )}
                              {alert.state && (
                                <Badge variant="secondary" className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {alert.state}
                                </Badge>
                              )}
                              {alert.minValue != null && (
                                <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                  Min {formatCurrency(alert.minValue)}
                                </Badge>
                              )}
                              {alert.maxValue != null && (
                                <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                  Max {formatCurrency(alert.maxValue)}
                                </Badge>
                              )}
                              {!alert.professionalType && !alert.shiftType && !alert.city && !alert.state && alert.minValue == null && alert.maxValue == null && (
                                <Badge variant="secondary" className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500">
                                  Qualquer plantão
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                              Criado em {formatDate(alert.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={alert.active}
                              onCheckedChange={() => handleToggleAlert(alert.id, alert.active)}
                              className="data-[state=checked]:bg-emerald-600"
                            />
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="w-7 h-7 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* Profile Edit Section */}
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              {!isEditing ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Editar Perfil</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Atualize suas informações pessoais</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartEdit}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Editar Perfil</p>
                    </div>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-name" className="text-xs text-gray-500 dark:text-gray-400">Nome</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-phone" className="text-xs text-gray-500 dark:text-gray-400">Telefone</Label>
                      <Input
                        id="edit-phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="rounded-lg text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-city" className="text-xs text-gray-500 dark:text-gray-400">Cidade</Label>
                        <Input
                          id="edit-city"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          placeholder="Cidade"
                          className="rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-state" className="text-xs text-gray-500 dark:text-gray-400">Estado</Label>
                        <Input
                          id="edit-state"
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          placeholder="UF"
                          className="rounded-lg text-sm"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-doc" className="text-xs text-gray-500 dark:text-gray-400">{getProfessionalDocLabel()}</Label>
                      <Input
                        id="edit-doc"
                        value={editDoc}
                        onChange={(e) => setEditDoc(e.target.value)}
                        placeholder={getProfessionalDocLabel()}
                        className="rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-bio" className="text-xs text-gray-500 dark:text-gray-400">Bio</Label>
                      <Textarea
                        id="edit-bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        className="rounded-lg text-sm min-h-[80px] resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2"
                    >
                      {savingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {savingProfile ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 rounded-lg gap-2"
                      disabled={savingProfile}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Alterar Senha</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mantenha sua conta segura</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password" className="text-xs text-gray-500 dark:text-gray-400">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      className="rounded-lg text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs text-gray-500 dark:text-gray-400">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="rounded-lg text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs text-gray-500 dark:text-gray-400">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="rounded-lg text-sm"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 mt-1"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {savingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dark mode */}
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Modo escuro</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alternar entre tema claro e escuro</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* App info */}
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Plantão Help</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Versão 1.1.0 • Marketplace de Plantões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal links */}
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-0">
              <button onClick={() => setShowTerms(true)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-xl">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Termos de Uso</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Condições de uso da plataforma</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <button onClick={() => setShowPrivacy(true)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-b-xl">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Política de Privacidade</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Como tratamos seus dados</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Button */}
      {user.role === 'ADMIN' && (
        <Button
          onClick={() => setActiveTab('admin')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 gap-2"
        >
          <Settings className="w-5 h-5" />
          Painel Administrativo
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      )}

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl h-10 gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </Button>

      {/* Terms of Use Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-lg max-h-[85vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-emerald-600" />
              Termos de Uso
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] pr-2 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Última atualização: Janeiro de 2025 • Versão 1.0
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">1. Aceitação dos Termos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Ao acessar e utilizar a plataforma Plantão Help, o usuário declara estar de acordo com os presentes Termos de Uso, que regulam o acesso e a utilização de todos os serviços oferecidos pela plataforma. Caso não concorde com qualquer disposição, o usuário deve cessar imediatamente o uso da plataforma.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">2. Descrição do Serviço</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                O Plantão Help é uma plataforma digital de marketplace que conecta profissionais de saúde (médicos, enfermeiros e técnicos de enfermagem) a oportunidades de plantões em estabelecimentos de saúde. A plataforma atua como intermediária, facilitando a negociação entre vendedores e compradores de plantões, não sendo responsável pela execução direta dos serviços médicos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">3. Cadastro e Conta do Usuário</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Para utilizar os serviços da plataforma, o usuário deve criar uma conta fornecendo informações verdadeiras, completas e atualizadas. O usuário é responsável pela segurança de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Profissionais de saúde devem informar seu número de registro profissional (CRM, COREN) que será verificado pela administração.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">4. Publicação e Compra de Plantões</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                O usuário pode publicar plantões para venda, informando dados como data, horário, valor, localização e hospital. A compra de um plantão é realizada diretamente pela plataforma. Após a confirmação da compra, o comprador assume a responsabilidade pelo cumprimento do plantão junto ao estabelecimento de saúde. Cancelamentos estão sujeitos às políticas específicas de cada plantão.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">5. Taxas e Pagamentos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                A plataforma pode cobrar taxas de registro de acordo com o tipo profissional do usuário. Os valores praticados nos plantões são definidos livremente pelos vendedores. O Plantão Help poderá cobrar uma taxa de serviço sobre as transações realizadas na plataforma, conforme informado no momento da operação.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">6. Avaliações e Reputação</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Após a conclusão de um plantão, as partes podem avaliar mutuamente a experiência por meio de um sistema de estrelas (1 a 5) e comentários. As avaliações são públicas e contribuem para a reputação dos usuários na plataforma. Avaliações falsas, ofensivas ou que violem a boa-fé podem ser removidas pela administração.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">7. Responsabilidades do Usuário</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                O usuário se compromete a: (a) fornecer informações verdadeiras e atualizadas; (b) cumprir os plantões adquiridos; (c) respeitar a legislação profissional vigente; (d) não utilizar a plataforma para fins ilícitos; (e) manter a confidencialidade de suas credenciais de acesso; (f) comunicar imediatamente qualquer uso não autorizado de sua conta.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">8. Limitação de Responsabilidade</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                O Plantão Help não se responsabiliza por: (a) atrasos ou falhas na execução dos plantões; (b) condutas dos usuários que violem a lei ou estes Termos; (c) danos indiretos, incidentais ou consequenciais; (d) interrupções temporárias do serviço por motivos técnicos. A plataforma atua como intermediária e não garante a qualidade dos serviços prestados pelos profissionais.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">9. Modificações nos Termos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                O Plantão Help reserva-se o direito de modificar estes Termos de Uso a qualquer momento, notificando os usuários por meio da plataforma ou por e-mail. O uso continuado da plataforma após as modificações implica na aceitação dos novos termos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">10. Legislação Aplicável</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Estes Termos são regidos pela legislação brasileira. Quaisquer disputas serão submetidas ao foro da comarca do domicílio do usuário, conforme o Código de Defesa do Consumidor. Para dúvidas sobre estes Termos, entre em contato pelo e-mail contato@plantaohelp.com.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-lg max-h-[85vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Política de Privacidade
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] pr-2 space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Última atualização: Janeiro de 2025 • Versão 1.0
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">1. Informações que Coletamos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Coletamos as seguintes categorias de informações: <strong>Dados de identificação:</strong> nome completo, e-mail, telefone, CPF/CNPJ; <strong>Dados profissionais:</strong> CRM, COREN ou outro registro profissional, especialidade; <strong>Dados de localização:</strong> cidade e estado de atuação; <strong>Dados de transação:</strong> histórico de plantões publicados, comprados e vendidos, valores transacionados; <strong>Dados de uso:</strong> logs de acesso, interações na plataforma, endereço IP.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">2. Como Utilizamos suas Informações</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                As informações coletadas são utilizadas para: (a) criação e gerenciamento de contas; (b) verificação de identidade e registro profissional; (c) viabilizar a compra e venda de plantões; (d) comunicação sobre transações, atualizações e novidades; (e) geração de avaliações e reputação; (f) melhoria contínua da plataforma; (g) cumprimento de obrigações legais e regulatórias.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">3. Compartilhamento de Dados</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Seus dados podem ser compartilhados com: (a) outros usuários, na medida necessária para a realização de transações (nome, profissional tipo e avaliação); (b) autoridades competentes, quando exigido por lei ou ordem judicial; (c) prestadores de serviços que auxiliam na operação da plataforma (hospedagem, processamento de pagamentos), sempre sob obrigações de confidencialidade. Não vendemos seus dados pessoais a terceiros.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">4. Armazenamento e Segurança</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Seus dados são armazenados em servidores seguros com criptografia e controles de acesso rigorosos. Adotamos medidas técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. As senhas são armazenadas de forma criptografada (hash) e não podem ser recuperadas em texto claro.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">5. Seus Direitos (LGPD)</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem direito a: (a) confirmar a existência de tratamento de dados; (b) acessar seus dados pessoais; (c) corrigir dados incompletos, inexatos ou desatualizados; (d) solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; (e) solicitar a portabilidade dos dados; (f) eliminar dados tratados com consentimento; (g) revogar o consentimento a qualquer momento.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">6. Cookies e Tecnologias Semelhantes</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, como: cookies essenciais para o funcionamento da plataforma; cookies de preferência para lembrar suas configurações (como tema escuro); cookies analíticos para entender como a plataforma é utilizada. Você pode gerenciar suas preferências de cookies nas configurações do navegador.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">7. Retenção de Dados</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Dados de transações financeiras são mantidos pelo prazo mínimo estabelecido pela legislação tributária e contábil. Após o período de retenção, os dados são eliminados ou anonimizados de forma segura.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">8. Menores de Idade</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                A plataforma Plantão Help não é destinada a menores de 18 anos. Não coletamos intencionalmente dados pessoais de menores. Caso tomemos conhecimento de que um menor forneu dados pessoais sem o consentimento dos pais ou responsáveis, tomaremos medidas para excluir essas informações.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">9. Alterações nesta Política</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos você sobre mudanças significativas por meio da plataforma ou por e-mail. A data da última atualização será sempre indicada no topo deste documento. Recomendamos a revisão periódica desta política.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">10. Contato</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre o tratamento de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail: <strong>privacidade@plantaohelp.com</strong>. Respondemos solicitações de titulares de dados em até 15 dias úteis, conforme previsto na LGPD.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Profile Completion Nudge Component ───
interface ProfileField {
  key: string
  label: string
  filled: boolean
  suggestion: string
  icon: React.ReactNode
  weight: number // importance weight
}

function ProfileCompletionNudge({ user, onEdit }: { user: AuthUser; onEdit: () => void }) {
  const fields: ProfileField[] = [
    {
      key: 'name',
      label: 'Nome',
      filled: !!user.name,
      suggestion: 'Adicione seu nome completo',
      icon: <User className="w-3.5 h-3.5" />,
      weight: 15,
    },
    {
      key: 'email',
      label: 'Email',
      filled: !!user.email,
      suggestion: 'Adicione seu email',
      icon: <Mail className="w-3.5 h-3.5" />,
      weight: 15,
    },
    {
      key: 'phone',
      label: 'Telefone',
      filled: !!user.phone,
      suggestion: 'Adicione seu telefone para contato rápido',
      icon: <Phone className="w-3.5 h-3.5" />,
      weight: 15,
    },
    {
      key: 'city',
      label: 'Cidade',
      filled: !!user.city,
      suggestion: 'Adicione sua cidade para receber recomendações melhores',
      icon: <MapPin className="w-3.5 h-3.5" />,
      weight: 12,
    },
    {
      key: 'state',
      label: 'Estado',
      filled: !!user.state,
      suggestion: 'Adicione seu estado para ver plantões na sua região',
      icon: <MapPin className="w-3.5 h-3.5" />,
      weight: 8,
    },
    {
      key: 'professionalDoc',
      label: user.role === 'MEDICO' ? 'CRM' : user.role === 'ENFERMEIRO' || user.role === 'TECNICO_ENFERMAGEM' ? 'COREN' : 'Documento Profissional',
      filled: !!user.professionalDoc,
      suggestion: 'Adicione seu documento profissional para verificação',
      icon: <FileText className="w-3.5 h-3.5" />,
      weight: 20,
    },
    {
      key: 'bio',
      label: 'Bio',
      filled: !!user.bio,
      suggestion: 'Adicione uma bio para que outros conheçam você',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      weight: 15,
    },
  ]

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0)
  const filledWeight = fields.filter(f => f.filled).reduce((sum, f) => sum + f.weight, 0)
  const completionPercent = Math.round((filledWeight / totalWeight) * 100)

  const missingFields = fields.filter(f => !f.filled)
  const isComplete = completionPercent === 100

  // Get color based on completion
  const getProgressColor = () => {
    if (completionPercent >= 80) return 'from-emerald-400 to-emerald-500'
    if (completionPercent >= 50) return 'from-amber-400 to-emerald-400'
    return 'from-red-400 to-amber-400'
  }

  const getProgressTextColor = () => {
    if (completionPercent >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (completionPercent >= 50) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card className={cn(
      "rounded-xl shadow-sm border-0 overflow-hidden transition-all duration-300",
      isComplete ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-400'
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {isComplete ? 'Perfil Completo!' : 'Complete seu Perfil'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isComplete
                  ? 'Seu perfil está completo. Continue atualizando!'
                  : `${completionPercent}% preenchido`}
              </p>
            </div>
          </div>
          <span className={cn('text-2xl font-bold', getProgressTextColor())}>
            {completionPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', getProgressColor())}
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* Field completion indicators */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {fields.map(field => (
            <div
              key={field.key}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200',
                field.filled
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              )}
            >
              {field.filled ? (
                <CheckCircle2 className="w-2.5 h-2.5" />
              ) : (
                <AlertCircle className="w-2.5 h-2.5" />
              )}
              {field.label}
            </div>
          ))}
        </div>

        {/* Missing field suggestions */}
        {missingFields.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-medium">
              Sugestões para melhorar seu perfil
            </p>
            {missingFields.slice(0, 3).map(field => (
              <div
                key={field.key}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg group hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer"
                onClick={onEdit}
              >
                <div className="w-5 h-5 bg-white dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0">
                  {field.icon}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">{field.suggestion}</p>
                <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 shrink-0" />
              </div>
            ))}
            {missingFields.length > 3 && (
              <button
                onClick={onEdit}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 ml-1"
              >
                +{missingFields.length - 3} mais sugestões
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
