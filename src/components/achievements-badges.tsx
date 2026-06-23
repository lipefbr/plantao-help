'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Target,
  Store,
  DollarSign,
  ShoppingCart,
  Star,
  Award,
  Heart,
  Lock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AuthUser } from '@/lib/store'
import { cn } from '@/lib/utils'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface Badge {
  id: string
  title: string
  description: string
  icon: LucideIcon
  tier: Tier
  progress: number
  unlocked: boolean
  currentValue: number
  targetValue: number
}

interface TierConfig {
  iconBg: string
  iconColor: string
  gradient: string
  ringColor: string
  glowShadow: string
  label: string
  dotColor: string
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  bronze: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-400 to-orange-500',
    ringColor: 'ring-amber-300/50',
    glowShadow: 'shadow-md shadow-amber-200/50 dark:shadow-amber-900/30',
    label: 'Bronze',
    dotColor: 'bg-amber-500',
  },
  silver: {
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500 dark:text-gray-300',
    gradient: 'from-gray-300 to-gray-500',
    ringColor: 'ring-gray-300/50',
    glowShadow: 'shadow-md shadow-gray-200/50 dark:shadow-gray-900/30',
    label: 'Prata',
    dotColor: 'bg-gray-400',
  },
  gold: {
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    gradient: 'from-yellow-400 to-amber-500',
    ringColor: 'ring-yellow-300/50',
    glowShadow: 'shadow-md shadow-yellow-200/60 dark:shadow-yellow-900/30',
    label: 'Ouro',
    dotColor: 'bg-yellow-500',
  },
  platinum: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-400 to-fuchsia-500',
    ringColor: 'ring-purple-300/50',
    glowShadow: 'shadow-md shadow-purple-200/60 dark:shadow-purple-900/30',
    label: 'Platina',
    dotColor: 'bg-purple-500',
  },
}

interface AchievementsBadgesProps {
  user: AuthUser
}

interface StatsData {
  totalPublished: number
  totalSold: number
  totalBought: number
  totalRatingsReceived: number
  accountAgeDays: number
}

export function AchievementsBadges({ user }: AchievementsBadgesProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [statsRes, favRes] = await Promise.all([
          fetch(`/api/users/${user.id}/stats`),
          fetch(`/api/favorites?userId=${user.id}`),
        ])

        let s: StatsData | null = null
        if (statsRes.ok) {
          const json = await statsRes.json()
          s = {
            totalPublished: json.totalPublished ?? 0,
            totalSold: json.totalSold ?? 0,
            totalBought: json.totalBought ?? 0,
            totalRatingsReceived: json.totalRatingsReceived ?? 0,
            accountAgeDays: json.accountAgeDays ?? 0,
          }
        }

        let favCount = 0
        if (favRes.ok) {
          const favJson = await favRes.json()
          favCount = Array.isArray(favJson) ? favJson.length : 0
        }

        if (!cancelled) {
          setStats(s)
          setFavoritesCount(favCount)
        }
      } catch {
        // silently fail - badges will just show 0 progress
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  const badges = useMemo<Badge[]>(() => {
    // Profile completion fields for "Primeiro Passo"
    const profileFields = [user.phone, user.city, user.state, user.professionalDoc, user.bio]
    const filledProfileFields = profileFields.filter(Boolean).length

    const publishedShifts = stats?.totalPublished ?? 0
    const soldShifts = stats?.totalSold ?? 0
    const boughtShifts = stats?.totalBought ?? 0
    const ratingsReceived = stats?.totalRatingsReceived ?? 0
    const daysSinceRegistration = stats?.accountAgeDays ?? 0
    const favCount = favoritesCount ?? 0

    const makeBadge = (
      id: string,
      title: string,
      description: string,
      icon: LucideIcon,
      tier: Tier,
      currentValue: number,
      targetValue: number
    ): Badge => {
      const progress = Math.min(100, Math.round((currentValue / targetValue) * 100))
      return {
        id,
        title,
        description,
        icon,
        tier,
        progress,
        unlocked: currentValue >= targetValue,
        currentValue,
        targetValue,
      }
    }

    return [
      makeBadge(
        'first-step',
        'Primeiro Passo',
        'Complete seu perfil profissional',
        Target,
        'bronze',
        filledProfileFields,
        5
      ),
      makeBadge(
        'starter-seller',
        'Vendedor Iniciante',
        'Publique seu primeiro plantão',
        Store,
        'bronze',
        publishedShifts,
        1
      ),
      makeBadge(
        'first-sale',
        'Primeira Venda',
        'Venda seu primeiro plantão',
        DollarSign,
        'silver',
        soldShifts,
        1
      ),
      makeBadge(
        'active-buyer',
        'Comprador Ativo',
        'Compre 3 plantões na plataforma',
        ShoppingCart,
        'silver',
        boughtShifts,
        3
      ),
      makeBadge(
        'well-rated',
        'Bem Avaliado',
        'Receba 5 avaliações de outros usuários',
        Star,
        'gold',
        ratingsReceived,
        5
      ),
      makeBadge(
        'top-seller',
        'Top Vendedor',
        'Venda 10 plantões com sucesso',
        Trophy,
        'gold',
        soldShifts,
        10
      ),
      makeBadge(
        'loyal-member',
        'Membro Fiel',
        'Seja membro da plataforma por 30 dias',
        Award,
        'platinum',
        daysSinceRegistration,
        30
      ),
      makeBadge(
        'collector',
        'Colecionador',
        'Salve 5 plantões nos favoritos',
        Heart,
        'silver',
        favCount,
        5
      ),
    ]
  }, [user, stats, favoritesCount])

  const unlockedCount = badges.filter((b) => b.unlocked).length

  // Find the next achievement to unlock: locked badge with the highest progress
  const nextAchievement = useMemo(() => {
    const locked = badges.filter((b) => !b.unlocked)
    if (locked.length === 0) return null
    return locked.reduce(
      (max, b) => (b.progress > max.progress ? b : max),
      locked[0]
    )
  }, [badges])

  const NextIcon = nextAchievement?.icon

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
            <Trophy className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white dark:ring-gray-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
              Conquistas
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {unlockedCount} de {badges.length} desbloqueadas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {unlockedCount}/{badges.length}
          </span>
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((badge, idx) => (
          <BadgeCard key={badge.id} badge={badge} index={idx} />
        ))}
      </div>

      {/* Next achievement footer */}
      {nextAchievement && NextIcon && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
            <NextIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Próxima conquista
              </p>
              <ChevronRight className="w-3 h-3 text-emerald-500 dark:text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {nextAchievement.title}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${nextAchievement.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 shrink-0">
                {nextAchievement.currentValue}/{nextAchievement.targetValue}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* All badges unlocked celebration */}
      {!nextAchievement && unlockedCount === badges.length && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm shadow-purple-200/60 dark:shadow-purple-900/30">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
              Parabéns! Você desbloqueou todas as conquistas! 🎉
            </p>
            <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80">
              Continue ativo para manter seu perfil em destaque
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = TIER_CONFIG[badge.tier]
  const Icon = badge.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="button"
      aria-label={`${badge.title}: ${badge.description}. Progresso: ${badge.currentValue} de ${badge.targetValue}.`}
    >
      <div
        className={cn(
          'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group',
          'hover:scale-[1.04] focus-within:scale-[1.04]',
          badge.unlocked
            ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900 shadow-sm hover:shadow-md hover:shadow-emerald-100/60 dark:hover:shadow-emerald-900/20'
            : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-70 hover:opacity-100'
        )}
      >
        {/* Icon container */}
        <div className="relative">
          {badge.unlocked ? (
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ring-2',
                config.gradient,
                config.ringColor,
                config.glowShadow
              )}
            >
              <Icon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
          ) : (
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center grayscale',
                config.iconBg
              )}
            >
              <Icon className={cn('w-5 h-5 opacity-60', config.iconColor)} />
            </div>
          )}

          {/* Check / Lock overlay */}
          {badge.unlocked ? (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-[11px] font-semibold text-center leading-tight text-gray-800 dark:text-gray-200">
          {badge.title}
        </p>

        {/* Progress or "Completo!" */}
        {badge.unlocked ? (
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Completo!
          </p>
        ) : (
          <div className="w-full">
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${badge.progress}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center mt-0.5 font-medium">
              {badge.currentValue}/{badge.targetValue}
            </p>
          </div>
        )}

        {/* Tier indicator */}
        <div className="flex items-center gap-1">
          <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
          <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
            {config.label}
          </span>
        </div>

        {/* Subtle glow overlay for unlocked */}
        {badge.unlocked && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[210px] pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
              <p className="font-semibold">{badge.title}</p>
            </div>
            <p className="text-gray-300 dark:text-gray-200 leading-tight">
              {badge.description}
            </p>
            <p
              className={cn(
                'mt-1 font-bold',
                badge.unlocked
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              )}
            >
              {badge.currentValue} / {badge.targetValue}
              {badge.unlocked && ' ✓'}
            </p>
          </div>
          {/* arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
        </div>
      )}
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-1.5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-14 bg-gray-100 dark:bg-gray-800/50 rounded-xl" />
    </div>
  )
}
