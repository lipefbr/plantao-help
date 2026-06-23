'use client'

import { useState } from 'react'
import { MobileAuthShell } from '@/components/mobile-auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore, type UserRole } from '@/lib/store'
import { getRoleLabel, formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, Stethoscope, HeartPulse, Thermometer, Building2 } from 'lucide-react'

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

export default function MobileRegisterPage() {
  const { setUser } = useAppStore()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fees, setFees] = useState<RegistrationFee[]>([])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('MEDICO')
  const [document, setDocument] = useState('')
  const [professionalDoc, setProfessionalDoc] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')

  // Load fees once on mount
  useState(() => {
    fetch('/api/admin/fees')
      .then(res => res.ok ? res.json() : [])
      .then(data => setFees(data))
      .catch(() => {})
  })

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
          document,
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
      }, 1000)
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
            Conta criada!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center px-6">
            Aguarde a aprovação do administrador para acessar todos os recursos.
          </p>
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mt-4" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Criar conta gratuita
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Junte-se a centenas de profissionais da saúde
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
            {/* Role selection */}
            <div className="space-y-2">
              <Label>Tipo de profissional</Label>
              <div className="grid grid-cols-2 gap-2">
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
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
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

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Dr. João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl h-12 pr-11 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-90"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {password && (
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prof-doc">{getProfessionalDocLabel()}</Label>
                <Input
                  id="prof-doc"
                  placeholder={`Número do ${getProfessionalDocLabel()}`}
                  value={professionalDoc}
                  onChange={(e) => setProfessionalDoc(e.target.value)}
                  className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                  maxLength={2}
                />
              </div>
            </div>

            {role === 'EMPRESA' && (
              <div className="space-y-2 animate-fadeIn">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input
                  id="company"
                  placeholder="Hospital XYZ"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-xl h-12 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Descrição (opcional)</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 input-glow resize-none"
                rows={2}
              />
            </div>

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

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base font-semibold shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 active:scale-[0.98] mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              Criar conta
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Já tem conta?{' '}
            <button
              type="button"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2"
              onClick={() => router.push('/mobile/login')}
            >
              Faça login
            </button>
          </p>
        </>
      )}
    </MobileAuthShell>
  )
}
