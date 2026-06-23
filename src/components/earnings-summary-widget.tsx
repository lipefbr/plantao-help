'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight, Trophy } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

interface EarningsSummaryWidgetProps {
  userId: string
  onSeeAll: () => void
}

interface EarningsData {
  totalEarned: number
  totalSpent: number
  thisMonthEarned: number
  thisMonthSpent: number
  soldCount: number
  boughtCount: number
  netBalance: number
}

export function EarningsSummaryWidget({ userId, onSeeAll }: EarningsSummaryWidgetProps) {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        // Fetch sold shifts (earnings) and bought shifts (expenses)
        const [soldRes, boughtRes] = await Promise.all([
          fetch(`/api/shifts?sellerId=${userId}&status=SOLD`),
          fetch(`/api/shifts?buyerId=${userId}&status=SOLD`),
        ])

        let sold: Array<{ value: number; date: string }> = []
        let bought: Array<{ value: number; date: string }> = []

        if (soldRes.ok) sold = await soldRes.json()
        if (boughtRes.ok) bought = await boughtRes.json()

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const thisMonthEarned = sold
          .filter(s => {
            const d = new Date(s.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
          })
          .reduce((sum, s) => sum + s.value, 0)

        const thisMonthSpent = bought
          .filter(s => {
            const d = new Date(s.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
          })
          .reduce((sum, s) => sum + s.value, 0)

        const totalEarned = sold.reduce((sum, s) => sum + s.value, 0)
        const totalSpent = bought.reduce((sum, s) => sum + s.value, 0)

        setData({
          totalEarned,
          totalSpent,
          thisMonthEarned,
          thisMonthSpent,
          soldCount: sold.length,
          boughtCount: bought.length,
          netBalance: totalEarned - totalSpent,
        })
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadEarnings()
  }, [userId])

  if (loading) {
    return (
      <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Don't show widget if user has no activity at all
  if (data.soldCount === 0 && data.boughtCount === 0) {
    return (
      <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Comece a ganhar hoje
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publique seu primeiro plantão e acompanhe seus ganhos aqui
              </p>
            </div>
            <Button
              onClick={onSeeAll}
              size="sm"
              variant="outline"
              className="rounded-lg text-xs h-8 shrink-0"
            >
              Ver
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Resumo Financeiro</span>
        </div>
        <button
          onClick={onSeeAll}
          className="text-[11px] font-medium text-emerald-50 hover:text-white transition-colors flex items-center gap-0.5"
        >
          Ver tudo
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Net balance hero */}
        <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
            Saldo líquido (ganhos - gastos)
          </p>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              'text-2xl font-extrabold',
              data.netBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            )}>
              {formatCurrency(data.netBalance)}
            </p>
            {data.netBalance > 0 && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                Positivo
              </span>
            )}
          </div>
        </div>

        {/* This month section */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
              Este mês
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Earned this month */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  Ganhou
                </p>
              </div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(data.thisMonthEarned)}
              </p>
            </div>
            {/* Spent this month */}
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                <p className="text-[10px] font-medium text-red-700 dark:text-red-400">
                  Gastou
                </p>
              </div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                {formatCurrency(data.thisMonthSpent)}
              </p>
            </div>
          </div>
        </div>

        {/* All-time stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total ganho</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                {formatCurrency(data.totalEarned)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total gasto</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                {formatCurrency(data.totalSpent)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
