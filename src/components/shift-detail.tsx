'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, renderStars, getRoleLabel, getProfessionalTypeColor, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Star, Building2,
  User, Phone, Shield, Loader2, MessageSquare, Heart, Share2
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { shareToWhatsApp, shareShiftLink } from '@/lib/utils'

interface ShiftDetail {
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
    avatar: string | null
    avgRating: number
    totalRatings: number
  }
  buyer: {
    id: string
    name: string
    role: string
    avatar: string | null
  } | null
  hospital: {
    id: string
    name: string
    address: string | null
    city: string
    state: string
    phone: string | null
  } | null
  ratings: {
    id: string
    stars: number
    comment: string | null
    createdAt: string
    rater: {
      id: string
      name: string
      avatar: string | null
    }
  }[]
}

interface Props {
  shiftId: string
  onBack: () => void
}

export function ShiftDetail({ shiftId, onBack }: Props) {
  const { user, setShowAuthModal, setAuthMode, favoriteIds, toggleFavorite } = useAppStore()
  const [shift, setShift] = useState<ShiftDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [ratingStars, setRatingStars] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showBuyConfirm, setShowBuyConfirm] = useState(false)

  const isFavorite = favoriteIds.includes(shiftId)

  useEffect(() => {
    loadShift()
  }, [shiftId])

  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    try {
      if (isFavorite) {
        await fetch(`/api/favorites/${shiftId}?userId=${user.id}`, { method: 'DELETE' })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, shiftId }),
        })
      }
      toggleFavorite(shiftId)
      toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
    } catch {
      toast.error('Erro ao atualizar favoritos')
    }
  }

  const loadShift = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shiftId}`)
      if (res.ok) {
        setShift(await res.json())
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!user) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    setBuying(true)
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy', buyerId: user.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Plantão comprado com sucesso!')
        loadShift()
      } else {
        toast.error(data.error || 'Erro ao comprar plantão')
      }
    } catch {
      toast.error('Erro ao processar compra')
    } finally {
      setBuying(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Plantão cancelado')
        loadShift()
      } else {
        toast.error(data.error || 'Erro ao cancelar plantão')
      }
    } catch {
      toast.error('Erro ao cancelar plantão')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!user || !shift) return
    setSubmittingRating(true)
    try {
      const receiverId = shift.sellerId === user.id ? shift.buyer?.id : shift.sellerId
      if (!receiverId) return

      const res = await fetch(`/api/shifts/${shiftId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raterId: user.id,
          receiverId,
          stars: ratingStars,
          comment: ratingComment,
        }),
      })
      if (res.ok) {
        toast.success('Avaliação enviada!')
        setShowRatingForm(false)
        setRatingComment('')
        setRatingStars(5)
        loadShift()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao enviar avaliação')
      }
    } catch {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmittingRating(false)
    }
  }

  const canBuy = user && shift?.status === 'AVAILABLE' && user.id !== shift.sellerId && user.registrationStatus === 'APPROVED'
  const canCancel = user && shift && (user.id === shift.sellerId || user.role === 'ADMIN') && shift.status !== 'CANCELLED'
  const canRate = user && shift && shift.status === 'SOLD' && (user.id === shift.buyerId || user.id === shift.sellerId)
  const hasRated = shift?.ratings.some(r => r.rater.id === user?.id)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-6 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    )
  }

  if (!shift) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Plantão não encontrado</p>
        <Button variant="outline" onClick={onBack} className="mt-4">Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">Detalhes do Plantão</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!shift) return
              const text = `🏥 Plantão: ${shift.title}\n📍 ${shift.city}/${shift.state}\n📅 ${formatDate(shift.date)}\n💰 ${formatCurrency(shift.value)}\n\nDisponível no Plantão Help!`
              const link = shareShiftLink(shiftId)
              window.open(shareToWhatsApp(text, link), '_blank')
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
              isFavorite
                ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <Heart className={cn(
              'w-4.5 h-4.5 transition-all duration-300',
              isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
            )} />
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden border-l-4 border-l-emerald-400">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
          <h3 className="text-xl font-bold">{shift.title}</h3>
          <p className="text-emerald-100 text-sm mt-1">{shift.location}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-200" />
              <span className="text-sm">{formatDate(shift.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-200" />
              <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold">{formatCurrency(shift.value)}</div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{shift.city}/{shift.state}</span>
            </div>
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(shift.status))}>
              {getStatusLabel(shift.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.professionalType))}>
              {getRoleLabel(shift.professionalType)}
            </span>
          </div>
          {shift.description && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{shift.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Info */}
      {shift.hospital && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-800">{shift.hospital.name}</p>
                {shift.hospital.address && (
                  <p className="text-xs text-gray-500">{shift.hospital.address}</p>
                )}
                {shift.hospital.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{shift.hospital.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Info */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4">
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Vendedor</p>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-emerald-200">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                {shift.seller.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800">{shift.seller.name}</p>
              <div className="flex items-center gap-2">
                <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.seller.role))}>
                  {getRoleLabel(shift.seller.role)}
                </span>
                {shift.seller.professionalDoc && (
                  <span className="text-xs text-gray-400">{shift.seller.professionalDoc}</span>
                )}
              </div>
              {shift.seller.avgRating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-amber-500 text-sm">{renderStars(shift.seller.avgRating)}</span>
                  <span className="text-xs text-gray-400">({shift.seller.totalRatings})</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer Info */}
      {shift.buyer && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Comprador</p>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-amber-200">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold">
                  {shift.buyer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-gray-800">{shift.buyer.name}</p>
                <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(shift.buyer.role))}>
                  {getRoleLabel(shift.buyer.role)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ratings */}
      {shift.ratings.length > 0 && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Avaliações</p>
            <div className="space-y-3">
              {shift.ratings.map((rating) => (
                <div key={rating.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-gray-100">
                        {rating.rater.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-700">{rating.rater.name}</span>
                    <span className="text-amber-500 text-xs">{renderStars(rating.stars)}</span>
                  </div>
                  {rating.comment && (
                    <p className="text-xs text-gray-500 mt-1 ml-8">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Form */}
      {canRate && !hasRated && !showRatingForm && (
        <Button
          onClick={() => setShowRatingForm(true)}
          variant="outline"
          className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl"
        >
          <Star className="w-4 h-4 mr-2" />
          Avaliar esta transação
        </Button>
      )}

      {showRatingForm && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Avaliar transação</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="text-2xl transition-colors"
                >
                  <Star className={cn(
                    'w-7 h-7',
                    star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  )} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Deixe um comentário (opcional)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="rounded-lg resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                disabled={submittingRating}
              >
                {submittingRating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRatingForm(false)}
                className="rounded-lg"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buy Confirmation Dialog */}
      <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja comprar o plantão '{shift?.title}' por {shift ? formatCurrency(shift.value) : ''}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBuy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar Compra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action Buttons */}
      <div className="space-y-2">
        {canBuy && (
          <Button
            onClick={() => setShowBuyConfirm(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-semibold"
            disabled={buying}
          >
            {buying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Comprar Plantão
          </Button>
        )}
        {canCancel && (
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-10"
            disabled={cancelling}
          >
            {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cancelar Plantão
          </Button>
        )}
        {!user && shift.status === 'AVAILABLE' && (
          <Button
            onClick={() => {
              setAuthMode('login')
              setShowAuthModal(true)
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
          >
            Entre para comprar
          </Button>
        )}
      </div>
    </div>
  )
}

