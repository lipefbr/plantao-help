'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type UserRole } from '@/lib/store'
import { formatCurrency, formatDate, getRoleLabel, getProfessionalTypeColor, getStatusColor, getStatusLabel, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield, Users, Building2, Trophy, MapPin, DollarSign,
  Check, X, Plus, Edit, Trash2, Loader2, Search, TrendingUp,
  Calendar, Star, BarChart3, Eye, ArrowUpDown, Clock, Banknote,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { toast } from 'sonner'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

const adminSubTabs = ['dashboard', 'users', 'shifts', 'hospitals', 'contests', 'locations', 'fees'] as const
type AdminSubTab = typeof adminSubTabs[number]

export function AdminTab() {
  const { adminSubTab, setAdminSubTab, user } = useAppStore()

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Acesso restrito a administradores</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Painel Administrativo</h2>

      <Tabs value={adminSubTab} onValueChange={(v) => setAdminSubTab(v as AdminSubTab)} className="w-full">
        <TabsList className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Users className="w-3.5 h-3.5 mr-1" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Plantões
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Hospitais
          </TabsTrigger>
          <TabsTrigger value="contests" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Concursos
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            Locais
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex-1 min-w-0 rounded-lg text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 py-1.5">
            <DollarSign className="w-3.5 h-3.5 mr-1" />
            Taxas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <DashboardPanel />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="shifts" className="mt-4">
          <ShiftsPanel />
        </TabsContent>
        <TabsContent value="hospitals" className="mt-4">
          <HospitalsPanel />
        </TabsContent>
        <TabsContent value="contests" className="mt-4">
          <ContestsPanel />
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <LocationsPanel />
        </TabsContent>
        <TabsContent value="fees" className="mt-4">
          <FeesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ──────────────────────────────────────
// DASHBOARD PANEL
// ──────────────────────────────────────
const CHART_COLORS = ['#10B981', '#14B8A6', '#F59E0B', '#A855F7', '#F43F5E', '#3B82F6']

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10B981',
  SOLD: '#3B82F6',
  CANCELLED: '#F43F5E',
}

const ROLE_COLORS: Record<string, string> = {
  MEDICO: '#10B981',
  ENFERMEIRO: '#14B8A6',
  TECNICO_ENFERMAGEM: '#F59E0B',
  EMPRESA: '#A855F7',
}

function DashboardPanel() {
  const { user } = useAppStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
      loadAnalytics()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?adminId=${user.id}`)
      if (res.ok) setStats(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }

  const loadAnalytics = async () => {
    if (!user) return
    setAnalyticsLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?adminId=${user.id}`)
      if (res.ok) setAnalytics(await res.json())
    } catch { /* */ }
    finally { setAnalyticsLoading(false) }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className={cn('rounded-xl', i % 2 === 0 ? 'h-28' : 'h-24')} />)}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900 hover:-translate-y-0.5 transition-transform border-l-4 border-l-emerald-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalUsers?.total || 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Usuários</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {stats.totalUsers?.byRole && Object.entries(stats.totalUsers.byRole).map(([role, count]: [string, any]) => (
                <span key={role} className={cn('text-[8px] px-1.5 py-0.5 rounded-full font-medium', getProfessionalTypeColor(role))}>
                  {getRoleLabel(role)}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 hover:-translate-y-0.5 transition-transform border-l-4 border-l-blue-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalShifts?.total || 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Plantões</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {stats.totalShifts?.byStatus && Object.entries(stats.totalShifts.byStatus).map(([status, count]: [string, any]) => (
                <span key={status} className={cn('text-[8px] px-1.5 py-0.5 rounded-full font-medium', getStatusColor(status))}>
                  {getStatusLabel(status)}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900 hover:-translate-y-0.5 transition-transform border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(stats.revenue || 0)}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Receita (plantões vendidos)</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Média: {formatCurrency(stats.averageShiftValue || 0)}/plantão</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 hover:-translate-y-0.5 transition-transform border-l-4 border-l-purple-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stats.totalContests?.total || 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Concursos</p>
            <div className="flex gap-1 mt-1">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">Ativos: {stats.totalContests?.byStatus?.ACTIVE || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Building2 className="w-4 h-4 mx-auto text-teal-600 mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.totalHospitals || 0}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Hospitais</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <MapPin className="w-4 h-4 mx-auto text-rose-600 mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.totalLocations || 0}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Localizações</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <Star className="w-4 h-4 mx-auto text-amber-600 mb-1" />
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stats.totalRatings || 0}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400">Avaliações</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Relatório de Receita ── */}
      <RevenueReportCard />

      {/* Recent pending registrations */}
      {stats.recentRegistrations && stats.recentRegistrations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cadastros Pendentes</h3>
          <div className="space-y-2">
            {stats.recentRegistrations.map((u: any) => (
              <Card key={u.id} className="rounded-xl shadow-sm border-0">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', getProfessionalTypeColor(u.role))}>
                        {getRoleLabel(u.role)}
                      </span>
                      {u.city && <span className="text-[9px] text-gray-400">{u.city}/{u.state}</span>}
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">Pendente</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráficos Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gráficos</h3>
        </div>

        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Bar Chart - Plantões por Mês */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Plantões por Mês</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.monthlyShifts} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Plantões"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line Chart - Receita Mensal */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Receita Mensal</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `R$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Status dos Plantões */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status dos Plantões</p>
                {analytics.shiftStatus && analytics.shiftStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.shiftStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {analytics.shiftStatus.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-status-${index}`}
                            fill={STATUS_COLORS[entry.status] || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart - Usuários por Tipo */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Usuários por Tipo</p>
                {analytics.userRoles && analytics.userRoles.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.userRoles}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {analytics.userRoles.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-role-${index}`}
                            fill={ROLE_COLORS[entry.role] || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ──────────────────────────────────────
// USERS PANEL
// ──────────────────────────────────────
function UsersPanel() {
  const { user } = useAppStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('PENDING')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) setUsers(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleApprove = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminId: user.id }),
      })
      if (res.ok) {
        toast.success(status === 'APPROVED' ? 'Usuário aprovado!' : 'Usuário rejeitado')
        loadUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar status')
      }
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 rounded-lg h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className={cn('rounded-xl', i === 2 ? 'h-24' : 'h-20')} />)}</div>
      ) : users.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum usuário encontrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((u: any) => (
            <Card key={u.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(u.role))}>
                        {getRoleLabel(u.role)}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getStatusColor(u.registrationStatus))}>
                        {getStatusLabel(u.registrationStatus)}
                      </span>
                    </div>
                    {u.professionalDoc && <p className="text-[10px] text-gray-400 mt-1">Doc: {u.professionalDoc}</p>}
                    {u.city && <p className="text-[10px] text-gray-400">{u.city}/{u.state}</p>}
                  </div>
                  {u.registrationStatus === 'PENDING' && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleApprove(u.id, 'APPROVED')}
                        className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleApprove(u.id, 'REJECTED')}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// HOSPITALS PANEL
// ──────────────────────────────────────
function HospitalsPanel() {
  const { user } = useAppStore()
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')

  const loadHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hospitals')
      if (res.ok) setHospitals(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadHospitals() }, [loadHospitals])

  const resetForm = () => {
    setName(''); setAddress(''); setCity(''); setState(''); setPhone('')
    setEditingId(null); setShowForm(false)
  }

  const handleEdit = (h: any) => {
    setName(h.name); setAddress(h.address || ''); setCity(h.city); setState(h.state); setPhone(h.phone || '')
    setEditingId(h.id); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const url = editingId ? `/api/hospitals/${editingId}` : '/api/hospitals'
      const method = editingId ? 'PUT' : 'POST'
      const body: any = { name, address, city, state, phone, userId: user.id }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingId ? 'Hospital atualizado!' : 'Hospital criado!')
        resetForm()
        loadHospitals()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar hospital')
      }
    } catch {
      toast.error('Erro ao salvar hospital')
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este hospital?')) return
    try {
      const res = await fetch(`/api/hospitals/${id}?userId=${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Hospital excluído!')
        loadHospitals()
      } else {
        toast.error('Erro ao excluir hospital')
      }
    } catch {
      toast.error('Erro ao excluir hospital')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{hospitals.length} hospitais</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">{editingId ? 'Editar Hospital' : 'Novo Hospital'}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Nome *" value={name} onChange={e => setName(e.target.value)} required className="rounded-lg text-sm" />
              <Input placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} className="rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
                <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
              </div>
              <Input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-lg text-sm" />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Salvar</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-lg text-sm">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : hospitals.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum hospital cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {hospitals.map((h: any) => (
            <Card key={h.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                  <p className="text-xs text-gray-500">{h.city}/{h.state}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(h)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(h.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// CONTESTS PANEL
// ──────────────────────────────────────
function ContestsPanel() {
  const { user } = useAppStore()
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [professionalType, setProfessionalType] = useState<UserRole>('MEDICO')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [deadline, setDeadline] = useState('')
  const [link, setLink] = useState('')

  const loadContests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contests')
      if (res.ok) setContests(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadContests() }, [loadContests])

  const resetForm = () => {
    setTitle(''); setDescription(''); setProfessionalType('MEDICO')
    setCity(''); setState(''); setDeadline(''); setLink('')
    setEditingId(null); setShowForm(false)
  }

  const handleEdit = (c: any) => {
    setTitle(c.title); setDescription(c.description || ''); setProfessionalType(c.professionalType)
    setCity(c.city); setState(c.state); setLink(c.link || '')
    setDeadline(c.deadline ? new Date(c.deadline).toISOString().split('T')[0] : '')
    setEditingId(c.id); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const url = editingId ? `/api/contests/${editingId}` : '/api/contests'
      const method = editingId ? 'PUT' : 'POST'
      const body: any = {
        title, description, professionalType, city, state,
        deadline: deadline || null, link: link || null,
        userId: user.id,
      }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingId ? 'Concurso atualizado!' : 'Concurso criado!')
        resetForm()
        loadContests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao salvar concurso')
      }
    } catch {
      toast.error('Erro ao salvar concurso')
    }
  }

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir este concurso?')) return
    try {
      const res = await fetch(`/api/contests/${id}?userId=${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Concurso excluído!')
        loadContests()
      } else {
        toast.error('Erro ao excluir concurso')
      }
    } catch {
      toast.error('Erro ao excluir concurso')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{contests.length} concursos</p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">{editingId ? 'Editar Concurso' : 'Novo Concurso'}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Título *" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg text-sm" />
              <Textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="rounded-lg text-sm resize-none" rows={2} />
              <Select value={professionalType} onValueChange={(v) => setProfessionalType(v as UserRole)}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                  <SelectItem value="ENFERMEIRO">Enfermeiro(a)</SelectItem>
                  <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
                <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
              </div>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-lg text-sm" />
              <Input placeholder="Link" value={link} onChange={e => setLink(e.target.value)} className="rounded-lg text-sm" />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Salvar</Button>
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-lg text-sm">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : contests.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum concurso cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contests.map((c: any) => (
            <Card key={c.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.city}/{c.state}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(c.professionalType))}>
                        {getRoleLabel(c.professionalType)}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', getStatusColor(c.status))}>
                        {getStatusLabel(c.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(c)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
                      <Edit className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// REVENUE REPORT CARD
// ──────────────────────────────────────
function RevenueReportCard() {
  const { user } = useAppStore()
  const [revenue, setRevenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadRevenue()
  }, [user])

  const loadRevenue = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/revenue?adminId=${user.id}`)
      if (res.ok) setRevenue(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }

  if (loading) {
    return <Skeleton className="h-40 rounded-xl" />
  }

  if (!revenue) return null

  const trendUp = revenue.revenueTrend >= 0

  return (
    <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-white">Relatório de Receita</h3>
        </div>
        <p className="text-2xl font-bold text-white">{formatCurrency(revenue.totalRevenue)}</p>
        <p className="text-emerald-100 text-[10px]">Receita total (plantões vendidos)</p>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Este Mês</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(revenue.revenueThisMonth)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mês Passado</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(revenue.revenueLastMonth)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Média/Plantão</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(revenue.averageShiftValue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tendência</p>
            <div className="flex items-center gap-1">
              {trendUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={cn('text-sm font-bold', trendUp ? 'text-emerald-600' : 'text-red-600')}>
                {Math.abs(revenue.revenueTrend).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Cities */}
        {revenue.topCities && revenue.topCities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Top Cidades</p>
            <div className="space-y-1">
              {revenue.topCities.slice(0, 3).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">{c.city}/{c.state}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatCurrency(c.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────
// SHIFTS PANEL
// ──────────────────────────────────────
function ShiftsPanel() {
  const { user } = useAppStore()
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadShifts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('adminId', user.id)
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      const res = await fetch(`/api/admin/shifts?${params.toString()}`)
      if (res.ok) setShifts(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [user, filterStatus, sortBy, sortOrder])

  useEffect(() => { loadShifts() }, [loadShifts])

  const handleViewDetail = (shift: any) => {
    setSelectedShift(shift)
    setShowDetail(true)
  }

  const handleCancelShift = async () => {
    if (!user || !cancellingId) return
    try {
      const res = await fetch(`/api/admin/shifts/${cancellingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          reason: cancelReason || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Plantão cancelado com sucesso!')
        setShowCancelDialog(false)
        setCancellingId(null)
        setCancelReason('')
        loadShifts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao cancelar plantão')
      }
    } catch {
      toast.error('Erro ao cancelar plantão')
    }
  }

  const openCancelDialog = (shiftId: string) => {
    setCancellingId(shiftId)
    setCancelReason('')
    setShowCancelDialog(true)
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Filter shifts by search query client-side
  const filteredShifts = searchQuery
    ? shifts.filter((s: any) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.seller?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hospital?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shifts

  return (
    <div className="space-y-3">
      {/* Filters & Search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 rounded-lg h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="AVAILABLE">Disponível</SelectItem>
              <SelectItem value="SOLD">Vendido</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">{filteredShifts.length} plantões</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar plantão..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 rounded-lg h-9 text-sm w-full sm:w-48"
          />
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 mr-1">Ordenar:</span>
        {[
          { key: 'date', label: 'Data' },
          { key: 'value', label: 'Valor' },
          { key: 'status', label: 'Status' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSort(s.key)}
            className={cn(
              'flex items-center gap-0.5 text-[10px] px-2 py-1 rounded-md transition-colors',
              sortBy === s.key
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {s.label}
            <ArrowUpDown className="w-2.5 h-2.5" />
          </button>
        ))}
      </div>

      {/* Shifts List */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filteredShifts.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhum plantão encontrado</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredShifts.map((s: any) => (
            <Card key={s.id} className={cn('rounded-xl shadow-sm border-0 hover:-translate-y-0.5 transition-transform', s.status === 'CANCELLED' && 'opacity-60')}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{s.title}</p>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0', getStatusColor(s.status))}>
                        {getStatusLabel(s.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(s.date)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.startTime}-{s.endTime}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(s.value)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-gray-400">{s.city}/{s.state}</span>
                      {s.hospital && <span className="text-[10px] text-gray-400">• {s.hospital.name}</span>}
                      <span className="text-[10px] text-gray-400">• Vendedor: {s.seller?.name}</span>
                      {s.buyer && <span className="text-[10px] text-gray-400">• Comprador: {s.buyer.name}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleViewDetail(s)}
                      className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                    {s.status !== 'CANCELLED' && (
                      <button
                        onClick={() => openCancelDialog(s.id)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Shift Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Detalhes do Plantão
            </DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{selectedShift.title}</h3>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1', getStatusColor(selectedShift.status))}>
                  {getStatusLabel(selectedShift.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Data</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedShift.date)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Horário</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedShift.startTime} - {selectedShift.endTime}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Valor</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(selectedShift.value)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Tipo Profissional</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{getRoleLabel(selectedShift.professionalType)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{selectedShift.city}/{selectedShift.state}</span>
                  {selectedShift.location && <span className="text-xs text-gray-400">• {selectedShift.location}</span>}
                </div>
                {selectedShift.hospital && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedShift.hospital.name}</span>
                  </div>
                )}
              </div>

              {selectedShift.description && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase mb-1">Descrição</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedShift.description}</p>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                <p className="text-[10px] text-gray-400 uppercase">Vendedor</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedShift.seller?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedShift.seller?.name}</p>
                    <p className="text-[10px] text-gray-400">{selectedShift.seller?.email}</p>
                  </div>
                </div>

                {selectedShift.buyer && (
                  <>
                    <p className="text-[10px] text-gray-400 uppercase mt-2">Comprador</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {selectedShift.buyer.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedShift.buyer.name}</p>
                        <p className="text-[10px] text-gray-400">{selectedShift.buyer.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectedShift.status !== 'CANCELLED' && (
                <Button
                  onClick={() => {
                    setShowDetail(false)
                    openCancelDialog(selectedShift.id)
                  }}
                  variant="outline"
                  className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar Plantão
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Shift Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Cancelar Plantão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tem certeza que deseja cancelar este plantão? O vendedor será notificado.
            </p>
            <Textarea
              placeholder="Motivo do cancelamento (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="rounded-lg text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCancelShift}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg gap-2"
              >
                <X className="w-4 h-4" />
                Confirmar Cancelamento
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="rounded-lg"
              >
                Voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ──────────────────────────────────────
// LOCATIONS PANEL
// ──────────────────────────────────────
function LocationsPanel() {
  const { user } = useAppStore()
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const loadLocations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/locations')
      if (res.ok) setLocations(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadLocations() }, [loadLocations])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state, adminId: user.id }),
      })
      if (res.ok) {
        toast.success('Localização adicionada!')
        setCity(''); setState('')
        loadLocations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao adicionar localização')
      }
    } catch {
      toast.error('Erro ao adicionar localização')
    }
  }

  return (
    <div className="space-y-3">
      <Card className="rounded-xl shadow-sm border-0">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Adicionar Localização</p>
          <form onSubmit={handleAdd} className="flex items-end gap-2">
            <div className="flex-1">
              <Input placeholder="Cidade *" value={city} onChange={e => setCity(e.target.value)} required className="rounded-lg text-sm" />
            </div>
            <div className="w-20">
              <Input placeholder="UF *" value={state} onChange={e => setState(e.target.value)} required className="rounded-lg text-sm" maxLength={2} />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : locations.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhuma localização cadastrada</CardContent></Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {locations.map((loc: any) => (
            <Card key={loc.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-800">{loc.city}/{loc.state}</span>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', loc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800')}>
                  {loc.active ? 'Ativo' : 'Inativo'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// FEES PANEL
// ──────────────────────────────────────
function FeesPanel() {
  const { user } = useAppStore()
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const loadFees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fees')
      if (res.ok) setFees(await res.json())
    } catch { /* */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadFees() }, [loadFees])

  const handleEdit = (fee: any) => {
    setEditingId(fee.id)
    setEditValue(String(fee.value))
  }

  const handleSave = async (id: string) => {
    if (!user) return
    try {
      const res = await fetch('/api/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value: parseFloat(editValue), adminId: user.id }),
      })
      if (res.ok) {
        toast.success('Taxa atualizada!')
        setEditingId(null)
        loadFees()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar taxa')
      }
    } catch {
      toast.error('Erro ao atualizar taxa')
    }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : fees.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="p-6 text-center text-gray-500 text-sm">Nenhuma taxa cadastrada</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {fees.map((fee: any) => (
            <Card key={fee.id} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getProfessionalTypeColor(fee.professionalType))}>
                      {getRoleLabel(fee.professionalType)}
                    </span>
                    {fee.description && <p className="text-xs text-gray-500 mt-1">{fee.description}</p>}
                  </div>
                  {editingId === fee.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-24 rounded-lg text-sm h-8"
                      />
                      <Button size="sm" onClick={() => handleSave(fee.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="rounded-lg text-xs">
                        X
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(fee.value)}</span>
                      <button
                        onClick={() => handleEdit(fee)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

