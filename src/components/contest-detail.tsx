'use client'

import { useState, useEffect } from 'react'
import { formatDate, getRoleLabel, getProfessionalTypeColor, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { shareToWhatsApp, shareShiftLink } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft, MapPin, Calendar, ExternalLink, Share2, Trophy, FileText
} from 'lucide-react'

interface ContestDetail {
  id: string
  title: string
  description: string | null
  professionalType: string
  city: string
  state: string
  deadline: string | null
  link: string | null
  status: string
  createdAt: string
}

interface Props {
  contestId: string
  onBack: () => void
}

export function ContestDetail({ contestId, onBack }: Props) {
  const [contest, setContest] = useState<ContestDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContest()
  }, [contestId])

  const loadContest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/contests/${contestId}`)
      if (res.ok) {
        setContest(await res.json())
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-6 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Concurso não encontrado</p>
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
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">Detalhes do Concurso</h2>
        </div>
        <button
          onClick={() => {
            const text = `🏆 Concurso: ${contest.title}\n📍 ${contest.city}/${contest.state}\n${contest.deadline ? `📅 Prazo: ${formatDate(contest.deadline)}\n` : ''}\nDisponível no Plantão Help!`
            const link = shareShiftLink(contestId)
            window.open(shareToWhatsApp(text, link), '_blank')
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Share2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Main Info Card */}
      <Card className="rounded-xl shadow-sm border-0 overflow-hidden border-l-4 border-l-emerald-400">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-emerald-200" />
            <span className="text-emerald-100 text-sm font-medium">Concurso</span>
          </div>
          <h3 className="text-xl font-bold">{contest.title}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium bg-white/20 text-white')}>
              {getStatusLabel(contest.status)}
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          {/* Description */}
          {contest.description && (
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{contest.description}</p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">{contest.city}/{contest.state}</span>
          </div>

          {/* Deadline */}
          {contest.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600">Prazo: {formatDate(contest.deadline)}</span>
            </div>
          )}

          {/* Professional Type Badge */}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
            <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border border-current/20', getProfessionalTypeColor(contest.professionalType))}>
              {getRoleLabel(contest.professionalType)}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(contest.status))}>
              {getStatusLabel(contest.status)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        {contest.link && (
          <Button
            asChild
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-semibold"
          >
            <a href={contest.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Edital
            </a>
          </Button>
        )}

        <Button
          onClick={() => {
            const text = `🏆 Concurso: ${contest.title}\n📍 ${contest.city}/${contest.state}\n${contest.deadline ? `📅 Prazo: ${formatDate(contest.deadline)}\n` : ''}\nDisponível no Plantão Help!`
            const link = shareShiftLink(contestId)
            window.open(shareToWhatsApp(text, link), '_blank')
          }}
          variant="outline"
          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl h-10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar no WhatsApp
        </Button>
      </div>
    </div>
  )
}
