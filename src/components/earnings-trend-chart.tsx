'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Portuguese month abbreviations and full names (0-indexed month)
const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MONTH_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface MonthInfo {
  key: string // 'YYYY-MM'
  label: string // 'Mai'
  fullLabel: string // 'Maio'
  year: number
  month: number // 0-indexed
}

interface ChartPoint extends MonthInfo {
  value: number
}

interface SoldShift {
  id?: string
  value: number
  date: string
}

interface EarningsTrendChartProps {
  userId: string
}

/**
 * Returns the last 6 months (including the current month) as MonthInfo array,
 * ordered from oldest to most recent.
 */
function getLast6Months(now: Date = new Date()): MonthInfo[] {
  const months: MonthInfo[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() // 0-indexed
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    months.push({
      key,
      label: MONTH_ABBR[month],
      fullLabel: MONTH_FULL[month],
      year,
      month,
    })
  }
  return months
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartPoint }>
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-0.5">
        {point.fullLabel}
      </p>
      <p className="font-bold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(point.value)}
      </p>
    </div>
  )
}

export function EarningsTrendChart({ userId }: EarningsTrendChartProps) {
  const [shifts, setShifts] = useState<SoldShift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/shifts?sellerId=${userId}&status=SOLD`)
        if (!res.ok) {
          if (!cancelled) setShifts([])
          return
        }
        const data = (await res.json()) as SoldShift[]
        if (!cancelled) setShifts(data)
      } catch {
        if (!cancelled) setShifts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const months = useMemo(() => getLast6Months(), [])

  const chartData: ChartPoint[] = useMemo(() => {
    return months.map((m) => {
      const sum = shifts
        .filter((s) => {
          const d = new Date(s.date)
          return d.getFullYear() === m.year && d.getMonth() === m.month
        })
        .reduce((acc, s) => acc + (Number(s.value) || 0), 0)
      return { ...m, value: sum }
    })
  }, [months, shifts])

  const stats = useMemo(() => {
    const values = chartData.map((p) => p.value)
    const total = values.reduce((a, b) => a + b, 0)
    const max = Math.max(...values)
    const bestIdx = values.indexOf(max)
    const best = chartData[bestIdx]
    const avg = total / 6
    return {
      best,
      bestValue: max,
      average: avg,
      total,
      hasData: total > 0,
    }
  }, [chartData])

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-3.5 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-[140px] mt-3 -ml-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse" />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 h-12 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!stats.hasData) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Tendência de Ganhos
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Últimos 6 meses</span>
        </div>
        <div className="mt-6 mb-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <TrendingDown className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Sem dados suficientes
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px]">
            Comece a vender plantões para ver sua tendência de ganhos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Tendência de Ganhos
          </h3>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Últimos 6 meses</span>
      </div>

      {/* Chart */}
      <div className="h-[140px] mt-3 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              className="dark:opacity-20"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              dy={4}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#earningsTrendGradient)"
              dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Melhor mês
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(stats.bestValue)}
          </p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">
            {stats.best?.fullLabel ?? '—'}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Média mensal
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(stats.average)}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Total 6 meses
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(stats.total)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EarningsTrendChart
