'use client'

import { useState } from 'react'
import { MobileAuthShell } from '@/components/mobile-auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, ArrowRight,
  KeyRound, UserPlus, ChevronDown, ChevronUp, ShieldCheck, Sparkles
} from 'lucide-react'

export default function MobileLoginPage() {
  const { setUser } = useAppStore()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

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
    setTimeout(() => {
      setForgotSent(false)
      setForgotEmail('')
    }, 300)
  }

  return (
    <MobileAuthShell>
      {success ? (
        <div className="flex flex-col items-center justify-center py-16 animate-successPop">
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
        <div className="flex flex-col min-h-[calc(100vh-320px)]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Bem-vindo de volta 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Entre com seus dados para acessar o marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className={cn('space-y-5 animate-fadeIn', error && 'animate-shake')}>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-2xl pl-12 h-14 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 text-base placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2 flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  Esqueci a senha
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-2xl pl-12 pr-14 h-14 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 text-base placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200 active:scale-90"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary login button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 text-base font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all duration-200 active:scale-[0.98] mt-2 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Create account button - PROMINENT at bottom */}
          <Button
            type="button"
            onClick={() => router.push('/mobile/register')}
            className="w-full bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl h-14 text-base font-bold transition-all duration-200 active:scale-[0.98] group"
          >
            <UserPlus className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
            Criar conta gratuita
          </Button>

          {/* Demo credentials - collapsible */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver conta de demonstração
              {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDemo && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-2xl" />
                <div className="relative">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Conta de demonstração
                  </p>
                  <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-400">
                    <p><span className="font-semibold">Médico:</span> dr.silva@medico.com</p>
                    <p><span className="font-semibold">Senha:</span> 123456</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('dr.silva@medico.com')
                      setPassword('123456')
                      setShowDemo(false)
                    }}
                    className="mt-3 w-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Preencher automaticamente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
