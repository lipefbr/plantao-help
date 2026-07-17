'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, ArrowRight,
  ShieldCheck, Stethoscope, LockKeyhole, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const { setUser, user } = useAppStore()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [shakeError, setShakeError] = useState('')

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.replace('/admin/dashboard')
    } else if (user && user.role !== 'ADMIN') {
      // Logged in but not admin
      setShakeError('Esta conta não tem permissões de administrador.')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShakeError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao fazer login')
        setError(true)
        setTimeout(() => setError(false), 600)
        return
      }

      // Check if user is admin
      if (data.role !== 'ADMIN') {
        setShakeError('Acesso negado. Apenas administradores podem acessar este painel.')
        toast.error('Acesso restrito a administradores')
        return
      }

      setSuccess(true)
      setUser(data)
      toast.success(`Bem-vindo, ${data.name}!`)

      setTimeout(() => {
        router.replace('/admin/dashboard')
      }, 800)
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo & Title Card */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Painel Admin
          </h1>
          <p className="text-emerald-300/80 mt-2 text-sm">
            Acesso restrito a administradores do sistema
          </p>
        </div>

        {/* Login Card */}
        <div className={cn(
          'bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all',
          error && 'animate-shake'
        )}>
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 animate-successPop">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-white">
                Acesso autorizado!
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Redirecionando para o painel...
              </p>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mt-4" />
            </div>
          ) : (
            <>
              {/* Error message */}
              {shakeError && (
                <div className="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">{shakeError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Email do Administrador
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@plantaohelp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl pl-11 h-12 bg-white/[0.06] border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/[0.08] transition-all duration-200 focus:ring-0 text-base"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Senha
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl pl-11 pr-12 h-12 bg-white/[0.06] border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/[0.08] transition-all duration-200 focus:ring-0 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-white/[0.1] transition-all duration-200 active:scale-90"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] mt-1 group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="w-5 h-5 mr-2" />
                      Acessar Painel
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@plantaohelp.com')
                    setPassword('admin123')
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-300">Conta de demonstração</p>
                    <p className="text-xs text-gray-500">admin@plantaohelp.com • admin123</p>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-md group-hover:bg-emerald-500/30 transition-colors">
                    Auto-fill
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
          >
            ← Voltar para o site
          </button>
          <p className="text-xs text-gray-600 mt-3">
            &copy; 2025 PlantãoHelp. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
