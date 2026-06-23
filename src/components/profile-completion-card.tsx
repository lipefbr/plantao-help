'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react'
import type { AuthUser } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ProfileCompletionCardProps {
  user: AuthUser
  onEdit: () => void
}

interface FieldCheck {
  key: string
  label: string
  filled: boolean
  emoji: string
}

export function ProfileCompletionCard({ user, onEdit }: ProfileCompletionCardProps) {
  // Define the fields that contribute to profile completeness
  const fields: FieldCheck[] = [
    { key: 'phone', label: 'Telefone', filled: !!user?.phone, emoji: '📞' },
    { key: 'city', label: 'Cidade', filled: !!user?.city, emoji: '📍' },
    { key: 'state', label: 'Estado', filled: !!user?.state, emoji: '🗺️' },
    { key: 'professionalDoc', label: 'Documento profissional', filled: !!user?.professionalDoc, emoji: '🪪' },
    { key: 'bio', label: 'Bio / Descrição', filled: !!user?.bio, emoji: '📝' },
  ]

  const filledCount = fields.filter(f => f.filled).length
  const totalCount = fields.length
  const percentage = Math.round((filledCount / totalCount) * 100)

  // Don't show the card if profile is 100% complete
  if (filledCount === totalCount) {
    return null
  }

  // Determine color based on completion percentage
  const getColorClass = () => {
    if (percentage < 40) return 'from-red-400 to-amber-400'
    if (percentage < 80) return 'from-amber-400 to-emerald-400'
    return 'from-emerald-400 to-teal-400'
  }

  const getMotivationMessage = () => {
    if (percentage < 40) return 'Complete seu perfil para começar a publicar plantões'
    if (percentage < 80) return 'Quase lá! Complete o restante para um perfil completo'
    return 'Falta pouco! Termine de completar seu perfil'
  }

  return (
    <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/20 overflow-hidden">
      <CardContent className="p-4">
        {/* Header with percentage */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Perfil {percentage}% completo
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {getMotivationMessage()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {filledCount}<span className="text-sm text-gray-400">/{totalCount}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className={cn(
              'absolute top-0 left-0 h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out',
              getColorClass()
            )}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', backgroundSize: '200% 100%', animation: 'shimmer-slow 2s linear infinite' }} />
          </div>
        </div>

        {/* Field checklist */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors',
                field.filled
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
              )}
            >
              {field.filled ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
              )}
              <span className="truncate">{field.label}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <Button
          onClick={onEdit}
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-medium group"
        >
          Completar perfil
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
