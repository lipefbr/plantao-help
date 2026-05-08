'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, getRoleLabel, getStatusColor, getStatusLabel, renderStars, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User, Mail, Phone, MapPin, FileText, Shield, LogOut,
  Star, MessageSquare, Settings, LogIn, ChevronRight,
  Heart, Moon, Clock, MapPinIcon
} from 'lucide-react'

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

export function PerfilTab() {
  const { user, setUser, setShowAuthModal, setAuthMode, setActiveTab, setSelectedShiftId, darkMode, toggleDarkMode, favoriteIds, setFavoriteIds } = useAppStore()
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [favoriteShifts, setFavoriteShifts] = useState<FavoriteShift[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  useEffect(() => {
    if (user) {
      loadRatings()
      loadFavorites()
    }
  }, [user])

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
        setFavoriteShifts(data)
        setFavoriteIds(data.map((s: FavoriteShift) => s.id))
      }
    } catch {
      // silently fail
    } finally {
      setLoadingFavorites(false)
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
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-3 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
              <p className="text-emerald-100 text-sm">{getRoleLabel(user.role)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  user.registrationStatus === 'APPROVED' ? 'bg-emerald-400/30 text-emerald-50' :
                  user.registrationStatus === 'PENDING' ? 'bg-yellow-400/30 text-yellow-100' :
                  'bg-red-400/30 text-red-100'
                )}>
                  {getStatusLabel(user.registrationStatus)}
                </span>
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
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
        </TabsContent>

        <TabsContent value="ratings" className="mt-4">
          {loadingRatings ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma avaliação recebida ainda</p>
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
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : favoriteShifts.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="p-8 text-center">
                <Heart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
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

        <TabsContent value="settings" className="mt-4 space-y-4">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Versão 1.0.0 • Marketplace de Plantões</p>
                </div>
              </div>
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
    </div>
  )
}

// Need to import toast for the favorites tab
import { toast } from 'sonner'
