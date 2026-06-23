'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore, type UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getRoleLabel, formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft,
  Stethoscope, HeartPulse, Thermometer, Building2,
  ShieldCheck, Sparkles, Star, Moon, Sun, Lock, Mail, User, Phone, MapPin,
} from 'lucide-react'

interface RegistrationFee {
  id: string
  professionalType: UserRole
  value: number
  description: string | null
}

// Password strength calculator
function getPasswordStrength(password: string): { score: number; label: string; color: string; bgColor: string } {
  if (!password) return { score: 0, label: '', color: '', bgColor: '' }

  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Fraca', color: 'text-red-500', bgColor: 'bg-red-500' }
  if (score <= 2) return { score: 2, label: 'Razoável', color: 'text-amber-500', bgColor: 'bg-amber-500' }
  if (score <= 3) return { score: 3, label: 'Boa', color: 'text-emerald-400', bgColor: 'bg-emerald-400' }
  if (score <= 4) return { score: 4, label: 'Forte', color: 'text-emerald-600', bgColor: 'bg-emerald-600' }
  return { score: 5, label: 'Muito forte', color: 'text-emerald-700', bgColor: 'bg-emerald-700' }
}

const roleCards: { role: UserRole; label: string; icon: React.ElementType; emoji: string; description: string }[] = [
  { role: 'MEDICO', label: 'Médico(a)', icon: Stethoscope, emoji: '🩺', description: 'CRM' },
  { role: 'ENFERMEIRO', label: 'Enfermeiro(a)', icon: HeartPulse, emoji: '💊', description: 'COREN' },
  { role: 'TECNICO_ENFERMAGEM', label: 'Téc. Enfermagem', icon: Thermometer, emoji: '🏥', description: 'COREN' },
  { role: 'EMPRESA', label: 'Empresa', icon: Building2, emoji: '🏢', description: 'CNPJ' },
]

export default function WebRegisterPage() {
  const { setUser, darkMode, toggleDarkMode, user } = useAppStore()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fees, setFees] = useState<RegistrationFee[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('MEDICO')
  const [professionalDoc, setProfessionalDoc] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')

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

  // Load fees once on mount
  useEffect(() => {
    fetch('/api/admin/fees')
      .then(res => res.ok ? res.json() : [])
      .then(data => setFees(data))
      .catch(() => {})
  }, [])

  const passwordStrength = getPasswordStrength(password)

  const getProfessionalDocLabel = () => {
    switch (role) {
      case 'MEDICO': return 'CRM'
      case 'ENFERMEIRO':
      case 'TECNICO_ENFERMAGEM': return 'COREN'
      case 'EMPRESA': return 'CNPJ'
      default: return 'Documento Profissional'
    }
  }

  const getFeeForRole = () => {
    const fee = fees.find(f => f.professionalType === role)
    return fee ? fee.value : 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          professionalDoc,
          phone,
          city,
          state,
          companyName: role === 'EMPRESA' ? companyName : undefined,
          bio,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao registrar')
        return
      }
      setSuccess(true)
      setUser(data)
      toast.success('Conta criada com sucesso! Aguarde aprovação.')
      setTimeout(() => {
        router.replace('/mobile')
      }, 1200)
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 flex">
      {/* ===== LEFT BRANDING PANEL (desktop only) ===== */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 6s linear infinite' }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl" />
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
              Cadastro 100% gratuito
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Junte-se a centenas de profissionais da saúde
            </h1>
            <p className="mt-4 text-lg text-emerald-100 leading-relaxed">
              Crie sua conta gratuita e comece a publicar, comprar e gerenciar
              plantões em todo o Brasil. Sem cartão de crédito.
            </p>

            {/* Benefits bullets */}
            <div className="mt-8 space-y-3">
              {[
                { icon: CheckCircle2, text: 'Publicação ilimitada de plantões' },
                { icon: ShieldCheck, text: 'Verificação com CRM/COREN para sua segurança' },
                { icon: Star, text: 'Avaliações que fortalecem sua reputação' },
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

          {/* Bottom: stats */}
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
        </div>
      </aside>

      {/* ===== RIGHT FORM PANEL ===== */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
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

        {/* Form area */}
        <div className="flex-1 flex items-start sm:items-center justify-center px-5 sm:px-8 py-6">
          <div className="w-full max-w-lg">
            {success ? (
              <div className="flex flex-col items-center justify-center py-16 animate-successPop">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Conta criada!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-6">
                  Aguarde a aprovação do administrador para acessar todos os recursos.
                </p>
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mt-4" />
              </div>
            ) : (
              <div className="animate-fadeIn">
                {/* Heading */}
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Criar conta gratuita
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Junte-se a centenas de profissionais da saúde. Leva menos de 2 minutos.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Role selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Tipo de profissional
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {roleCards.map((card) => {
                        const isSelected = role === card.role
                        const Icon = card.icon
                        return (
                          <button
                            key={card.role}
                            type="button"
                            onClick={() => setRole(card.role)}
                            className={cn(
                              'relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-center',
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm shadow-emerald-200/50 dark:shadow-emerald-800/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                            )}
                          >
                            <Icon className={cn('w-5 h-5', isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400')} />
                            <span className={cn(
                              'text-xs font-semibold leading-tight',
                              isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
                            )}>
                              {card.label}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{card.description}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-successPop">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Nome completo
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="name"
                        placeholder="Dr. João Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-xl pl-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Email + Password */}
                  <div className="grid sm:grid-cols-2 gap-4">
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
                          className="rounded-xl pl-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Senha
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mín. 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="rounded-xl pl-11 pr-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
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
                  </div>

                  {/* Password strength meter */}
                  {password && (
                    <div className="space-y-1.5 -mt-2 animate-fadeIn">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-all duration-300',
                              level <= passwordStrength.score
                                ? passwordStrength.bgColor
                                : 'bg-gray-200 dark:bg-gray-700'
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn('text-[11px] font-medium', passwordStrength.color)}>
                        Força da senha: {passwordStrength.label}
                      </p>
                    </div>
                  )}

                  {/* Professional doc + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prof-doc" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {getProfessionalDocLabel()}
                      </Label>
                      <Input
                        id="prof-doc"
                        placeholder={`Número do ${getProfessionalDocLabel()}`}
                        value={professionalDoc}
                        onChange={(e) => setProfessionalDoc(e.target.value)}
                        className="rounded-xl h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Telefone
                      </Label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                          id="phone"
                          placeholder="(00) 00000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="rounded-xl pl-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* City + State */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Cidade
                      </Label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                          id="city"
                          placeholder="São Paulo"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="rounded-xl pl-11 h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Estado
                      </Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        maxLength={2}
                        className="rounded-xl h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 uppercase"
                      />
                    </div>
                  </div>

                  {/* Company name (only for EMPRESA) */}
                  {role === 'EMPRESA' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <Label htmlFor="company" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Nome da Empresa
                      </Label>
                      <Input
                        id="company"
                        placeholder="Hospital XYZ"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="rounded-xl h-12 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0"
                      />
                    </div>
                  )}

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Bio / Descrição <span className="text-gray-400 normal-case">(opcional)</span>
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre você..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-950 transition-all duration-200 focus:ring-0 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Registration fee notice */}
                  {fees.length > 0 && getFeeForRole() > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 animate-fadeIn">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        <span className="font-semibold">Taxa de cadastro para {getRoleLabel(role)}:</span>{' '}
                        {formatCurrency(getFeeForRole())}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Sua conta ficará pendente até a confirmação do pagamento.
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all duration-200 active:scale-[0.98] mt-2 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar conta gratuita
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  {/* Terms note */}
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Termos de Uso</span> e{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Política de Privacidade</span>.
                  </p>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Já tem conta?{' '}
                  <Link
                    href="/login"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2"
                  >
                    Faça login
                  </Link>
                </p>
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
              <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Entrar</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
