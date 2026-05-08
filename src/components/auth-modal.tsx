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
import { getRoleLabel, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface RegistrationFee {
  id: string
  professionalType: UserRole
  value: number
  description: string | null
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, setUser } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fees, setFees] = useState<RegistrationFee[]>([])

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
      setUser(data)
      setShowAuthModal(false)
      toast.success('Conta criada com sucesso! Aguarde aprovação.')
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-emerald-700">
            {authMode === 'login' ? 'Entrar na sua conta' : 'Criar conta'}
          </DialogTitle>
        </DialogHeader>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="rounded-lg"
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
                  className="rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Entrar
            </Button>
            <p className="text-center text-sm text-gray-500">
              Não tem conta?{' '}
              <button
                type="button"
                className="text-emerald-600 font-medium hover:underline"
                onClick={() => handleModeSwitch('register')}
              >
                Cadastre-se
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nome completo</Label>
              <Input
                id="reg-name"
                placeholder="Dr. João Silva"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="rounded-lg"
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
                className="rounded-lg"
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
                  className="rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-role">Tipo de profissional</Label>
              <Select value={regRole} onValueChange={(v) => setRegRole(v as UserRole)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICO">Médico(a)</SelectItem>
                  <SelectItem value="ENFERMEIRO">Enfermeiro(a)</SelectItem>
                  <SelectItem value="TECNICO_ENFERMAGEM">Téc. Enfermagem</SelectItem>
                  <SelectItem value="EMPRESA">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-doc">CPF / Documento</Label>
              <Input
                id="reg-doc"
                placeholder="000.000.000-00"
                value={regDocument}
                onChange={(e) => setRegDocument(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-prof-doc">{getProfessionalDocLabel()}</Label>
              <Input
                id="reg-prof-doc"
                placeholder={`Número do ${getProfessionalDocLabel()}`}
                value={regProfessionalDoc}
                onChange={(e) => setRegProfessionalDoc(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Telefone</Label>
              <Input
                id="reg-phone"
                placeholder="(00) 00000-0000"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="rounded-lg"
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
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-state">Estado</Label>
                <Input
                  id="reg-state"
                  placeholder="SP"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  className="rounded-lg"
                  maxLength={2}
                />
              </div>
            </div>
            {regRole === 'EMPRESA' && (
              <div className="space-y-2">
                <Label htmlFor="reg-company">Nome da Empresa</Label>
                <Input
                  id="reg-company"
                  placeholder="Hospital XYZ"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  className="rounded-lg"
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
                className="rounded-lg resize-none"
                rows={2}
              />
            </div>

            {fees.length > 0 && getFeeForRole() > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Taxa de cadastro para {getRoleLabel(regRole)}:</span>{' '}
                  {formatCurrency(getFeeForRole())}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Sua conta ficará pendente até a confirmação do pagamento.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar conta
            </Button>
            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <button
                type="button"
                className="text-emerald-600 font-medium hover:underline"
                onClick={() => handleModeSwitch('login')}
              >
                Faça login
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
