'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Stethoscope, Calendar, TrendingUp, Plus, Search, ArrowRight, Star, MapPin, Clock, AlertCircle, CheckCircle2, Users, DollarSign, Briefcase } from 'lucide-react'

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

export function HomeTab() {
  const { user, setActiveTab, setShowAuthModal, setAuthMode, setSelectedShiftId } = useAppStore()
  const [shifts, setShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState<number>(0)
  const [myShiftsCount, setMyShiftsCount] = useState(0)

  useEffect(() => {
    loadFeaturedShifts()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserRating()
      loadMyShiftsCount()
    }
  }, [user])

  const loadFeaturedShifts = async () => {
    try {
      const res = await fetch('/api/shifts?status=AVAILABLE')
      if (res.ok) {
        const data = await res.json()
        setShifts(data.slice(0, 4))
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const loadUserRating = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/users/${user.id}/ratings`)
      if (res.ok) {
        const data = await res.json()
        setUserRating(data.avgRating || 0)
      }
    } catch {
      // silently fail
    }
  }

  const loadMyShiftsCount = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/shifts?sellerId=${user.id}&allStatuses=true`)
      if (res.ok) {
        const data = await res.json()
        setMyShiftsCount(data.length)
      }
    } catch {
      // silently fail
    }
  }

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId)
    setActiveTab('plantoes')
  }

  // Not logged in - hero section
  if (!user) {
    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="absolute top-1/2 right-4 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Plantão Help</h2>
            <p className="text-emerald-100 text-sm leading-relaxed mb-4">
              Marketplace para compra e venda de plantões médicos, de enfermagem e técnico de enfermagem.
              Repasse de plantões com segurança e praticidade.
            </p>
            <Button
              onClick={() => {
                setAuthMode('login')
                setShowAuthModal(true)
              }}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-lg shadow-lg"
            >
              Entrar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Professional Types */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Para profissionais da saúde</h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">🩺</span>
                </div>
                <p className="text-xs font-semibold text-blue-800">Médicos</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">💊</span>
                </div>
                <p className="text-xs font-semibold text-purple-800">Enfermeiros</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-base">🏥</span>
                </div>
                <p className="text-xs font-semibold text-orange-800">Téc. Enf.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4 text-center">
              <Calendar className="w-7 h-7 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Publique Plantões</p>
              <p className="text-xs text-gray-500 mt-1">Repasse seus horários facilmente</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4 text-center">
              <Search className="w-7 h-7 mx-auto text-amber-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Encontre Vagas</p>
              <p className="text-xs text-gray-500 mt-1">Busque plantões disponíveis</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-7 h-7 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Concursos</p>
              <p className="text-xs text-gray-500 mt-1">Acompanhe editais e concursos</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4 text-center">
              <Star className="w-7 h-7 mx-auto text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-800">Avaliações</p>
              <p className="text-xs text-gray-500 mt-1">Sistema de reputação confiável</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent shifts preview */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Plantões em destaque</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : shifts.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">Nenhum plantão disponível no momento</p>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(shift.professionalType))}>
                          {getRoleLabel(shift.professionalType)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-3 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setActiveTab('plantoes')}
          >
            Ver todos os plantões
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  // Logged in - dashboard
  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm">Olá,</p>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">{getRoleLabel(user.role)}</span>
            {user.registrationStatus === 'PENDING' && (
              <span className="text-xs bg-yellow-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Aguardando aprovação
              </span>
            )}
            {user.registrationStatus === 'APPROVED' && (
              <span className="text-xs bg-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Aprovado
              </span>
            )}
            {user.registrationStatus === 'REJECTED' && (
              <span className="text-xs bg-red-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Cadastro rejeitado
              </span>
            )}
          </div>
          {user.city && user.state && (
            <p className="text-emerald-200 text-xs mt-1.5">
              <MapPin className="w-3 h-3 inline mr-0.5" />
              {user.city}, {user.state}
            </p>
          )}
        </div>
      </div>

      {/* Pending approval warning */}
      {user.registrationStatus === 'PENDING' && (
        <Card className="rounded-xl border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Cadastro pendente de aprovação</p>
                <p className="text-xs text-amber-600 mt-1">
                  Seu cadastro está sendo analisado pela equipe administrativa. Você poderá publicar e comprar plantões após a aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">{shifts.length}</p>
            <p className="text-[10px] text-gray-500">Disponíveis</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Briefcase className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">{myShiftsCount}</p>
            <p className="text-[10px] text-gray-500">Meus Plantões</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-lg font-bold text-gray-800">{userRating > 0 ? userRating.toFixed(1) : '-'}</p>
            <p className="text-[10px] text-gray-500">Avaliação</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user.registrationStatus === 'APPROVED' && user.role !== 'ADMIN' && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setActiveTab('plantoes')}
            className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex flex-col gap-1 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Publicar Plantão</span>
          </Button>
          <Button
            onClick={() => setActiveTab('plantoes')}
            variant="outline"
            className="h-16 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl flex flex-col gap-1"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">Buscar Plantões</span>
          </Button>
        </div>
      )}

      {/* Concursos quick link */}
      <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('concursos')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Concursos Abertos</p>
                <p className="text-xs text-gray-500">Confira os editais da sua região</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Recent shifts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800">Plantões recentes</h3>
          <button
            onClick={() => setActiveTab('plantoes')}
            className="text-xs text-emerald-600 font-medium hover:underline"
          >
            Ver todos
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : shifts.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center text-gray-500">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">Nenhum plantão disponível</p>
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
                      </div>
                      {shift.seller && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-emerald-700">{shift.seller.name.charAt(0)}</span>
                          </div>
                          <span className="text-xs text-gray-500">{shift.seller.name}</span>
                          {shift.seller.avgRating > 0 && (
                            <span className="text-xs text-amber-500 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {shift.seller.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(shift.professionalType))}>
                        {getRoleLabel(shift.professionalType)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
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
