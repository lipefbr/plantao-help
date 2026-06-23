'use client'

import { useState } from 'react'
import { MobileAuthShell } from '@/components/mobile-auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, ArrowRight, KeyRound, Sparkles } from 'lucide-react'

export default function MobileLoginPage() {
  const { setUser } = useAppStore()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  // Forgot password dialog state
  const [showForgotDialog, setShowForgotDialog] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setForgotSent(true)
        toast.success('Instruções enviadas para seu email!')
      } else {
        toast.error(data.error || 'Erro ao enviar instruções')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgotDialog = () => {
    setShowForgotDialog(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setForgotSent(false)
      setForgotEmail('')
    }, 300)
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2 flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Esqueci minha senha
                </button>
              </div>
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

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Manter conectado neste dispositivo
              </Label>
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
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Conta de demonstração
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
                className="mt-3 w-full text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors active:scale-95"
              >
                Preencher automaticamente
              </button>
            </div>
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

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={(open) => !open && closeForgotDialog()}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-0 rounded-2xl" aria-describedby={undefined}>
          {forgotSent ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4 animate-successPop">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Instruções enviadas!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Se o email <span className="font-medium text-gray-700 dark:text-gray-300">{forgotEmail}</span> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <Button
                onClick={closeForgotDialog}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
              >
                Entendi
              </Button>
            </div>
          ) : (
            <>
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white">
                <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)', backgroundSize: '200% 200%' }} />
                <DialogHeader className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <DialogTitle className="text-lg font-bold">Recuperar senha</DialogTitle>
                  <DialogDescription className="text-emerald-100 text-sm mt-1">
                    Informe seu email para receber instruções de recuperação
                  </DialogDescription>
                </DialogHeader>
              </div>
              <form onSubmit={handleForgotPassword} className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email cadastrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="rounded-xl pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForgotDialog}
                    className="flex-1 rounded-xl h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                  >
                    {forgotLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MobileAuthShell>
  )
}
