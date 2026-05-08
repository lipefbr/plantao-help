import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    MEDICO: 'Médico',
    ENFERMEIRO: 'Enfermeiro',
    TECNICO_ENFERMAGEM: 'Téc. Enfermagem',
    EMPRESA: 'Empresa',
    ADMIN: 'Administrador',
  }
  return labels[role] || role
}

export function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    MEDICO: '🩺',
    ENFERMEIRO: '💊',
    TECNICO_ENFERMAGEM: '🏥',
    EMPRESA: '🏢',
    ADMIN: '⚙️',
  }
  return icons[role] || '👤'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponível',
    SOLD: 'Vendido',
    CANCELLED: 'Cancelado',
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    ACTIVE: 'Ativo',
    CLOSED: 'Encerrado',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800',
    SOLD: 'bg-amber-100 text-amber-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function renderStars(rating: number): string {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}

export function getProfessionalTypeColor(type: string): string {
  const colors: Record<string, string> = {
    MEDICO: 'bg-blue-100 text-blue-800',
    ENFERMEIRO: 'bg-purple-100 text-purple-800',
    TECNICO_ENFERMAGEM: 'bg-orange-100 text-orange-800',
    EMPRESA: 'bg-teal-100 text-teal-800',
    ADMIN: 'bg-gray-100 text-gray-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins}min atrás`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h atrás`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d atrás`
  return formatDate(date)
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  }
  return phone
}

export function shareShiftLink(shiftId: string): string {
  // Returns a shareable link for the shift
  if (typeof window !== 'undefined') {
    return `${window.location.origin}?shift=${shiftId}`
  }
  return ''
}

export function shareToWhatsApp(text: string, link: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`
}
