'use client'

import { useState } from 'react'
import { MobileAuthShell } from '@/components/mobile-auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, ArrowRight } from 'lucide-react'

export default function MobileLoginPage() {
  const { setUser } = useAppStore()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
      setSuccess(true)
      setUser(data)
      toast.success(`Bem-vindo(a), ${data.name}!`)
      // Brief delay so the success animation shows, then redirect to /mobile
      setTimeout(() => {
        router.replace('/mobile')
      }, 800)
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileAuthShell>
      {success ? (
        <div className="flex flex-col items-center justify-center py-12 animate-successPop">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Login realizado!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Redirecionando para o app...
          </p>
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mt-4" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Entrar na sua conta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Acesse o marketplace de plantões médicos
            </p>
          </div>

          <form onSubmit={handleLogin} className={cn('space-y-4 animate-fadeIn', error && 'animate-shake')}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl pl-10 h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl pl-10 pr-11 h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-90"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-semibold shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 active:scale-[0.98] mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              Entrar
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Demo credentials helper */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              💡 Conta de demonstração
            </p>
            <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-400">
              <p><span className="font-medium">Médico:</span> dr.silva@medico.com</p>
              <p><span className="font-medium">Senha:</span> 123456</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('dr.silva@medico.com')
                setPassword('123456')
              }}
              className="mt-3 w-full text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            >
              Preencher automaticamente
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Não tem conta?{' '}
            <button
              type="button"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2"
              onClick={() => router.push('/mobile/register')}
            >
              Cadastre-se grátis
            </button>
          </p>
        </>
      )}
    </MobileAuthShell>
  )
}
