'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type UserRole } from '@/lib/store'
import { getRoleLabel, getRoleIcon, formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Stethoscope, HeartPulse, Thermometer, Building2, CheckCircle2 } from 'lucide-react'

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

// Role selection card data
const roleCards: { role: UserRole; label: string; icon: React.ElementType; emoji: string; description: string }[] = [
  { role: 'MEDICO', label: 'Médico(a)', icon: Stethoscope, emoji: '🩺', description: 'CRM registrado' },
  { role: 'ENFERMEIRO', label: 'Enfermeiro(a)', icon: HeartPulse, emoji: '💊', description: 'COREN registrado' },
  { role: 'TECNICO_ENFERMAGEM', label: 'Téc. Enfermagem', icon: Thermometer, emoji: '🏥', description: 'COREN registrado' },
  { role: 'EMPRESA', label: 'Empresa', icon: Building2, emoji: '🏢', description: 'CNPJ registrado' },
]

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, setUser } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fees, setFees] = useState<RegistrationFee[]>([])
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('MEDICO')
  const [regDocument, setRegDocument] = useState('')
  const [regProfessionalDoc, setRegProfessionalDoc] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regCity, setRegCity] = useState('')
  const [regState, setRegState] = useState('')
  const [regCompanyName, setRegCompanyName] = useState('')
  const [regBio, setRegBio] = useState('')

  const handleOpenChange = (open: boolean) => {
    setShowAuthModal(open)
    if (!open) {
      setLoginEmail('')
      setLoginPassword('')
      setRegName('')
      setRegEmail('')
      setRegPassword('')
      setRegRole('MEDICO')
      setRegDocument('')
      setRegProfessionalDoc('')
      setRegPhone('')
      setRegCity('')
      setRegState('')
      setRegCompanyName('')
      setRegBio('')
      setLoginSuccess(false)
    }
  }

  const loadFees = async () => {
    try {
      const res = await fetch('/api/admin/fees')
      if (res.ok) {
        const data = await res.json()
        setFees(data)
      }
    } catch {
      // silently fail
    }
  }

  const handleModeSwitch = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setLoginSuccess(false)
    if (mode === 'register' && fees.length === 0) {
      loadFees()
    }
  }

  const getProfessionalDocLabel = () => {
    switch (regRole) {
      case 'MEDICO': return 'CRM'
      case 'ENFERMEIRO':
      case 'TECNICO_ENFERMAGEM': return 'COREN'
      case 'EMPRESA': return 'CNPJ'
      default: return 'Documento Profissional'
    }
  }

  const getFeeForRole = () => {
    const fee = fees.find(f => f.professionalType === regRole)
    return fee ? fee.value : 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao fazer login')
        return
      }
      // Show success animation briefly
      setLoginSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setUser(data)
      setShowAuthModal(false)
      toast.success(`Bem-vindo(a), ${data.name}!`)
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          document: regDocument,
          professionalDoc: regProfessionalDoc,
          phone: regPhone,
          city: regCity,
          state: regState,
          companyName: regRole === 'EMPRESA' ? regCompanyName : undefined,
          bio: regBio,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erro ao registrar')
        return
      }
      setLoginSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setUser(data)
      setShowAuthModal(false)
      toast.success('Conta criada com sucesso! Aguarde aprovação.')
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(regPassword)

  return (
    <Dialog open={showAuthModal} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0" aria-describedby={undefined}>
        {/* Gradient header area */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 opacity-[0.07]" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/40 dark:to-gray-900/20" />
          <DialogHeader className="relative px-6 pt-6 pb-4">
            <DialogTitle className="text-center text-emerald-700 dark:text-emerald-400 text-xl">
              {loginSuccess ? (
                <span className="inline-flex items-center gap-2 animate-successPop">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  Sucesso!
                </span>
              ) : (
                authMode === 'login' ? 'Entrar na sua conta' : 'Criar conta'
              )}
            </DialogTitle>
            {!loginSuccess && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                {authMode === 'login'
                  ? 'Acesse o marketplace de plantões'
                  : 'Cadastre-se e comece agora'}
              </p>
            )}
          </DialogHeader>
          {/* Subtle gradient line at bottom of header */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-300/50 dark:via-emerald-700/30 to-transparent" />
        </div>

        <div className="px-6 py-4">
          {loginSuccess ? (
            <div className="flex flex-col items-center py-8 animate-successPop">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Redirecionando...</p>
            </div>
          ) : authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="rounded-lg pr-11 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 active:scale-[0.98]"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Entrar
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Não tem conta?{' '}
                <button
                  type="button"
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline underline-offset-2"
                  onClick={() => handleModeSwitch('register')}
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
              {/* Visual role selection cards */}
              <div className="space-y-2">
                <Label>Tipo de profissional</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleCards.map((card) => {
                    const isSelected = regRole === card.role
                    return (
                      <button
                        key={card.role}
                        type="button"
                        onClick={() => setRegRole(card.role)}
                        className={cn(
                          'relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-center',
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm shadow-emerald-200/50 dark:shadow-emerald-800/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                        )}
                      >
                        <span className="text-xl">{card.emoji}</span>
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

              <div className="space-y-2">
                <Label htmlFor="reg-name">Nome completo</Label>
                <Input
                  id="reg-name"
                  placeholder="Dr. João Silva"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-lg pr-11 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-90"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {regPassword && (
                  <div className="space-y-1.5 animate-fadeIn">
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
                      Força: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-doc">CPF / Documento</Label>
                <Input
                  id="reg-doc"
                  placeholder="000.000.000-00"
                  value={regDocument}
                  onChange={(e) => setRegDocument(e.target.value)}
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-prof-doc">{getProfessionalDocLabel()}</Label>
                <Input
                  id="reg-prof-doc"
                  placeholder={`Número do ${getProfessionalDocLabel()}`}
                  value={regProfessionalDoc}
                  onChange={(e) => setRegProfessionalDoc(e.target.value)}
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Telefone</Label>
                <Input
                  id="reg-phone"
                  placeholder="(00) 00000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-city">Cidade</Label>
                  <Input
                    id="reg-city"
                    placeholder="São Paulo"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-state">Estado</Label>
                  <Input
                    id="reg-state"
                    placeholder="SP"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    maxLength={2}
                  />
                </div>
              </div>
              {regRole === 'EMPRESA' && (
                <div className="space-y-2 animate-fadeIn">
                  <Label htmlFor="reg-company">Nome da Empresa</Label>
                  <Input
                    id="reg-company"
                    placeholder="Hospital XYZ"
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reg-bio">Bio / Descrição</Label>
                <Textarea
                  id="reg-bio"
                  placeholder="Conte um pouco sobre você..."
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  className="rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                  rows={2}
                />
              </div>

              {fees.length > 0 && getFeeForRole() > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 animate-fadeIn">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Taxa de cadastro para {getRoleLabel(regRole)}:</span>{' '}
                    {formatCurrency(getFeeForRole())}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Sua conta ficará pendente até a confirmação do pagamento.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 active:scale-[0.98]"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar conta
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Já tem conta?{' '}
                <button
                  type="button"
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline underline-offset-2"
                  onClick={() => handleModeSwitch('login')}
                >
                  Faça login
                </button>
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
