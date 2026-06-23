'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Loader2, Eye, EyeOff, CheckCircle2, Mail, Lock, ArrowRight, ArrowLeft,
  KeyRound, UserPlus, ShieldCheck, Sparkles, Stethoscope, HeartPulse,
  TrendingUp, Star, Moon, Sun,
} from 'lucide-react'

export default function WebLoginPage() {
  const { setUser, darkMode, toggleDarkMode, user } = useAppStore()
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

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Redirect already-logged-in users to the app
  useEffect(() => {
    if (user) {
      router.replace('/mobile')
    }
  }, [user, router])

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
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 flex">
      {/* ===== LEFT BRANDING PANEL (desktop only) ===== */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 6s linear infinite' }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Top: back to home + logo */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Voltar ao início
            </Link>
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="Plantão Help"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/30"
              />
              <span className="text-lg font-bold">
                Plantão<span className="text-emerald-200">Help</span>
              </span>
            </div>
          </div>

          {/* Middle: value proposition */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma #1 para plantões médicos
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Bem-vindo de volta ao seu marketplace de plantões
            </h1>
            <p className="mt-4 text-lg text-emerald-100 leading-relaxed">
              Compre, venda e gerencie plantões médicos, de enfermagem e técnico
              com segurança. Conecte-se a centenas de oportunidades em todo o Brasil.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {[
                { icon: ShieldCheck, text: 'Profissionais verificados com CRM/COREN' },
                { icon: TrendingUp, text: 'Publique e encontre plantões em segundos' },
                { icon: Star, text: 'Sistema de avaliação e reputação confiável' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-emerald-50">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: stats + testimonial */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { value: '500+', label: 'Profissionais' },
                { value: '50+', label: 'Cidades' },
                { value: '4.8★', label: 'Avaliação' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                  <p className="text-2xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-emerald-100 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 max-w-md">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">
                🩺
              </div>
              <div>
                <p className="text-sm italic text-emerald-50 leading-snug">
                  &ldquo;Em minutos consigo publicar e encontrar compradores interessados.&rdquo;
                </p>
                <p className="text-xs text-emerald-200 mt-1 font-medium">Dr. Rafael Mendes — Cardiologista</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== RIGHT FORM PANEL ===== */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile + desktop right side): logo + dark mode toggle */}
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src="/logo.jpg"
              alt="Plantão Help"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Plantão<span className="text-emerald-600 dark:text-emerald-400">Help</span>
            </span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="lg:hidden text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Início
            </Link>
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-90"
              aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </header>

        {/* Form area — centered vertically */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-6">
          <div className="w-full max-w-md">
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
              <div className="animate-fadeIn">
                {/* Heading */}
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Entrar na sua conta
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Bem-vindo de volta! Acesse o marketplace de plantões.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className={cn('space-y-5', error && 'animate-shake')}>
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl pl-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 text-base placeholder:text-gray-400"
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
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-xl pl-11 pr-12 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 text-base placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200 active:scale-90"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary login button */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all duration-200 active:scale-[0.98] mt-1 group"
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

                {/* Create account button */}
                <Button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="w-full bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl h-12 text-base font-bold transition-all duration-200 active:scale-[0.98] group"
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
                    Ver contas de demonstração
                    {showDemo ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {showDemo && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 relative overflow-hidden animate-fadeIn">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-2xl" />
                      <div className="relative space-y-2">
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Contas de demonstração
                        </p>
                        {[
                          { icon: Stethoscope, label: 'Médico', email: 'dr.silva@medico.com', pass: '123456' },
                          { icon: HeartPulse, label: 'Enfermeiro', email: 'maria@enfermeiro.com', pass: '123456' },
                          { icon: ShieldCheck, label: 'Admin', email: 'admin@plantaohelp.com', pass: 'admin123' },
                        ].map((demo) => {
                          const Icon = demo.icon
                          return (
                            <button
                              key={demo.email}
                              type="button"
                              onClick={() => {
                                setEmail(demo.email)
                                setPassword(demo.pass)
                                setShowDemo(false)
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{demo.label}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{demo.email} • {demo.pass}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-5 sm:px-8 py-4 shrink-0 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
            <p>&copy; 2025 PlantãoHelp. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Início</Link>
              <span>•</span>
              <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Criar conta</Link>
            </div>
          </div>
        </footer>
      </main>

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
    </div>
  )
}
