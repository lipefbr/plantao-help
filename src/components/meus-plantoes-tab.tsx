'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, getStatusColor, getStatusLabel, getShiftType, getShiftTypeColor, getShiftTypeIcon, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Clock, Star, Briefcase, LogIn, User, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

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
  buyerId: string | null
  seller: {
    id: string
    name: string
    role: string
    professionalDoc: string | null
    avgRating: number
    totalRatings: number
  }
  buyer: {
    id: string
    name: string
    role: string
    avatar: string | null
  } | null
  hospital: { id: string; name: string } | null
}

export function MeusPlantoesTab() {
  const { user, setShowAuthModal, setAuthMode, setSelectedShiftId } = useAppStore()
  const [publishedShifts, setPublishedShifts] = useState<ShiftItem[]>([])
  const [boughtShifts, setBoughtShifts] = useState<ShiftItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMyShifts()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadMyShifts = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Load shifts I published (all statuses)
      const publishedRes = await fetch(`/api/shifts?sellerId=${user.id}&allStatuses=true`)
      const published = publishedRes.ok ? await publishedRes.json() : []

      // Load shifts I bought
      const boughtRes = await fetch(`/api/shifts?buyerId=${user.id}&status=SOLD`)
      const bought = boughtRes.ok ? await boughtRes.json() : []

      setPublishedShifts(published)
      setBoughtShifts(bought)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleShiftClick = (shiftId: string) => {
    setSelectedShiftId(shiftId)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Meus Plantões</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Faça login para ver seus plantões publicados e comprados
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

  const ShiftCard = ({ shift, type }: { shift: ShiftItem; type: 'published' | 'bought' }) => (
    <Card
      className="rounded-xl shadow-sm border-0 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border-l-4 border-l-emerald-400"
      onClick={() => handleShiftClick(shift.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-800 truncate">{shift.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">{shift.city}/{shift.state}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">{formatDate(shift.date)} • {shift.startTime}-{shift.endTime}</span>
            </div>
            {/* Show buyer for published, seller for bought */}
            {type === 'published' && shift.buyer && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Comprador: {shift.buyer.name}</span>
              </div>
            )}
            {type === 'bought' && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Vendedor: {shift.seller.name}</span>
                {shift.seller.avgRating > 0 && (
                  <span className="text-xs text-amber-500">{renderStars(shift.seller.avgRating)}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-700 font-bold text-sm">{formatCurrency(shift.value)}</p>
            <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 border border-current/20', getShiftTypeColor(getShiftType(shift.startTime, shift.endTime)))}>
              {getShiftTypeIcon(getShiftType(shift.startTime, shift.endTime))} {getShiftType(shift.startTime, shift.endTime)}
            </span>
            <div className="mt-1">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium inline-block', getStatusColor(shift.status))}>
                {getStatusLabel(shift.status)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Financial calculations
  const totalEarned = publishedShifts.filter(s => s.status === 'SOLD').reduce((sum, s) => sum + s.value, 0)
  const totalSpent = boughtShifts.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Meus Plantões</h2>
        <Button variant="ghost" size="sm" onClick={loadMyShifts} className="text-emerald-600 gap-1">
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Resumo Financeiro</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                <p className="text-emerald-200 text-[11px]">Total Ganho</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalEarned)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-200" />
                <p className="text-emerald-200 text-[11px]">Total Gasto</p>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-emerald-200 text-[11px]">Publicados</p>
              <p className="text-base font-bold">{publishedShifts.length}</p>
            </div>
            <div>
              <p className="text-emerald-200 text-[11px]">Comprados</p>
              <p className="text-base font-bold">{boughtShifts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="published" className="w-full">
          <TabsList className="w-full bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="published" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Publicados ({publishedShifts.length})
            </TabsTrigger>
            <TabsTrigger value="bought" className="flex-1 rounded-lg text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Comprados ({boughtShifts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-4">
            {publishedShifts.length === 0 ? (
              <Card className="rounded-2xl bg-gray-50 border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Você ainda não publicou nenhum plantão</p>
                  <p className="text-xs text-gray-400 mt-1">Publique seu primeiro plantão para começar!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {publishedShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} type="published" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bought" className="mt-4">
            {boughtShifts.length === 0 ? (
              <Card className="rounded-2xl bg-gray-50 border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Você ainda não comprou nenhum plantão</p>
                  <p className="text-xs text-gray-400 mt-1">Explore os plantões disponíveis no marketplace!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {boughtShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} type="bought" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
