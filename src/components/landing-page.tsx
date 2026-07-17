'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Stethoscope, ArrowRight, Shield, Clock, Users, Star, MapPin,
  Calendar, HeartPulse, CheckCircle2, Sparkles, TrendingUp,
  Search, Briefcase, MessageCircle, Phone, Mail, ChevronRight,
  Zap, Award, Target, BarChart3, UserCheck, Building2,
  Menu, X, Play, ExternalLink,
} from 'lucide-react'

// ─── Animation keyframes (injected once) ──────────────────────────
const animationStyles = `
@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes float-medium {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}
@keyframes float-fast {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
.animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
.animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.animate-slide-left { animation: slide-in-left 0.7s ease-out forwards; }
.animate-slide-right { animation: slide-in-right 0.7s ease-out forwards; }
.animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
`

export function LandingPage() {
  const { user } = useAppStore()
  const router = useRouter()
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({ shifts: 0, users: 0, cities: 0, rating: 0 })
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Intersection observer for scroll animations
  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = animationStyles
    document.head.appendChild(styleEl)
    return () => { styleEl.remove() }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            shifts: data.totalShifts || 0,
            users: data.totalUsers || 0,
            cities: data.citiesCount || 50,
            rating: data.averageRating || 4.8,
          })
        }
      } catch {
        // Use defaults
      }
    }
    loadStats()
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  // ─── Floating Card Data (representing real system features) ─────
  const floatingCards = [
    {
      icon: Calendar,
      title: 'Plantão Disponível',
      subtitle: 'UTI - Noturno',
      value: 'R$ 1.200',
      badge: 'Noturno',
      position: 'top-left',
      delay: '0s',
    },
    {
      icon: Stethoscope,
      title: 'Dr. Rafael Mendes',
      subtitle: 'Cardiologista — CRM 12345',
      badge: 'Verificado',
      position: 'top-right',
      delay: '0.5s',
    },
    {
      icon: Building2,
      title: 'Hospital São Paulo',
      subtitle: 'São Paulo, SP',
      badge: '5.0 ★',
      position: 'bottom-left',
      delay: '1s',
    },
    {
      icon: TrendingUp,
      title: 'R$ 45.230',
      subtitle: 'Volume este mês',
      badge: '+23%',
      position: 'bottom-right',
      delay: '1.5s',
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Profissionais verificados com CRM, COREN e documentos validados. Transações protegidas do início ao fim.',
    },
    {
      icon: Zap,
      title: 'Publicação Instantânea',
      description: 'Publique seu plantão em segundos e encontre compradores interessados em tempo real.',
    },
    {
      icon: Star,
      title: 'Avaliações Confiáveis',
      description: 'Sistema de reputação baseado em avaliações reais, garantindo confiança entre as partes.',
    },
    {
      icon: MapPin,
      title: 'Cobertura Nacional',
      description: 'Plantões disponíveis em centenas de cidades em todo o Brasil. Encontre oportunidades perto de você.',
    },
    {
      icon: Clock,
      title: 'Gestão Completa',
      description: 'Acompanhe seus plantões, ganhos e agenda em um único lugar, com notificações em tempo real.',
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Milhares de profissionais de saúde conectados, criando a maior rede de repasse do Brasil.',
    },
  ]

  const features = [
    {
      icon: Search,
      title: 'Busca Inteligente',
      description: 'Filtros avançados por cidade, estado, tipo de plantão, valor e profissional. Encontre exatamente o que precisa.',
    },
    {
      icon: HeartPulse,
      title: 'Multi-Profissional',
      description: 'Suporte para Médicos, Enfermeiros e Técnicos de Enfermagem. Cada tipo com funcionalidades específicas.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard de Ganhos',
      description: 'Acompanhe seus ganhos, tendências e estatísticas em um painel visual completo e intuitivo.',
    },
    {
      icon: UserCheck,
      title: 'Verificação de Perfil',
      description: 'Processo de verificação de documentos que garante a segurança de todas as transações.',
    },
    {
      icon: Briefcase,
      title: 'Concursos e Editais',
      description: 'Acompanhe concursos públicos e editais na área da saúde em todo o Brasil em tempo real.',
    },
    {
      icon: Award,
      title: 'Sistema de Conquistas',
      description: 'Desbloqueie conquistas e badges conforme utiliza a plataforma. Quanto mais participa, mais destaque.',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Crie sua conta',
      description: 'Cadastre-se gratuitamente e escolha seu perfil profissional. Verifique seus documentos para acesso completo.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Explore ou Publique',
      description: 'Busque plantões disponíveis ou publique os seus. Defina valor, horário e local com facilidade.',
      icon: Search,
    },
    {
      step: '03',
      title: 'Conecte-se',
      description: 'Encontre o profissional ideal ou o plantão perfeito. Negocie com segurança pela plataforma.',
      icon: Users,
    },
    {
      step: '04',
      title: 'Realize e Avalie',
      description: 'Conclua o plantão, registre a experiência e avalie. Sua reputação cresce a cada transação.',
      icon: Star,
    },
  ]

  const differentials = [
    'Plataforma exclusiva para profissionais da saúde',
    'Verificação obrigatória de CRM/COREN',
    'Sem taxas ocultas — transparência total',
    'Suporte humanizado e especializado',
    'Notificações em tempo real',
    'Aplicativo responsivo para qualquer dispositivo',
  ]

  const testimonials = [
    {
      name: 'Dr. Rafael Mendes',
      role: 'Cardiologista — SP',
      text: 'Em minutos consigo publicar e encontrar compradores interessados. A verificação de documentos me dá total segurança.',
      avatar: '🩺',
      rating: 5,
    },
    {
      name: 'Enf. Maria Santos',
      role: 'Enfermeira — RJ',
      text: 'Finalmente uma plataforma feita pra gente! Encontro plantões noturnos perto de casa e o processo é super simples.',
      avatar: '💊',
      rating: 5,
    },
    {
      name: 'Téc. Carlos Lima',
      role: 'Téc. Enfermagem — MG',
      text: 'Já completei mais de 30 plantões pela plataforma. O dashboard de ganhos me ajuda a planejar minha agenda.',
      avatar: '🏥',
      rating: 5,
    },
  ]

  const isVisible = (id: string) => visibleSections.has(id)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="Plantão Help" className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-100" />
              <span className="text-lg font-extrabold text-gray-900">
                Plantão<span className="text-emerald-600">Help</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Benefícios', id: 'benefits' },
                { label: 'Funcionalidades', id: 'features' },
                { label: 'Como funciona', id: 'how-it-works' },
                { label: 'Depoimentos', id: 'testimonials' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
              >
                Entrar
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 text-sm font-semibold shadow-lg shadow-emerald-200/50 group"
              >
                Começar Grátis
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-emerald-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-emerald-100/50 animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {[
                { label: 'Benefícios', id: 'benefits' },
                { label: 'Funcionalidades', id: 'features' },
                { label: 'Como funciona', id: 'how-it-works' },
                { label: 'Depoimentos', id: 'testimonials' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full rounded-xl h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-200/50"
                >
                  Começar Grátis
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
        {/* Background gradient + grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Hero Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 mb-6 animate-fade-in-up">
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma #1 para plantões médicos
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Seus plantões.
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Sua agenda.
                </span>
                <br />
                Sua escolha.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                O marketplace que conecta profissionais de saúde a oportunidades de plantões em todo o Brasil. Compre, venda e gerencie com segurança.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-14 text-base font-bold shadow-xl shadow-emerald-200/50 group"
                >
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection('how-it-works')}
                  className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-emerald-300 rounded-2xl px-8 h-14 text-base font-semibold group"
                >
                  <Play className="w-4 h-4 mr-2 text-emerald-600" />
                  Como funciona
                </Button>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-6 sm:gap-8 mt-10 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {[
                  { value: `${stats.users}+`, label: 'Profissionais' },
                  { value: `${stats.shifts}+`, label: 'Plantões' },
                  { value: `${stats.rating}`, label: 'Avaliação' },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating Cards */}
            <div className="relative hidden lg:block min-h-[520px]">
              {floatingCards.map((card, i) => {
                const positionClasses = {
                  'top-left': 'top-4 left-0',
                  'top-right': 'top-4 right-0',
                  'bottom-left': 'bottom-4 left-0',
                  'bottom-right': 'bottom-4 right-0',
                }[card.position]

                const floatClass = i % 2 === 0 ? 'animate-float-slow' : 'animate-float-medium'
                const Icon = card.icon

                return (
                  <div
                    key={i}
                    className={`absolute ${positionClasses} ${floatClass}`}
                    style={{ animationDelay: card.delay }}
                  >
                    <Card className="bg-white/90 backdrop-blur-lg border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl w-64 overflow-hidden hover:shadow-2xl hover:shadow-emerald-100/50 transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/40">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{card.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          {card.value && (
                            <span className="text-lg font-extrabold text-emerald-600">{card.value}</span>
                          )}
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            {card.badge}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}

              {/* Center floating card (appointment style) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-medium" style={{ animationDelay: '0.8s' }}>
                <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0 shadow-2xl shadow-emerald-300/30 rounded-2xl w-56 overflow-hidden">
                  <CardContent className="p-4 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Próximo Plantão</p>
                        <p className="text-[10px] text-emerald-200">UTI — Noturno</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <Badge className="bg-white/20 text-white border-0 text-[9px]">Diurno</Badge>
                      <Badge className="bg-white/20 text-white border-0 text-[9px]">R$1.200</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">19:00 — 07:00, 15 Mar</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="relative py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Confiado por profissionais em todo o Brasil</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            {['Hospital Albert Einstein', 'Hospital Sírio-Libanês', 'Hospital das Clínicas', 'Santa Casa', 'Hospital Moinhos', 'Hospital Alemão'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section
        id="benefits"
        ref={(el) => { if (el) sectionRefs.current.set('benefits', el) }}
        className="py-20 sm:py-28 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${isVisible('benefits') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 px-4 py-1 rounded-full">
              Por que escolher
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Benefícios que fazem a diferença
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Tudo que você precisa para gerenciar plantões com segurança e eficiência
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <Card
                  key={i}
                  className={`bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 group ${isVisible('benefits') ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        id="features"
        ref={(el) => { if (el) sectionRefs.current.set('features', el) }}
        className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${isVisible('features') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 px-4 py-1 rounded-full">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ferramentas poderosas para profissionais
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Recursos pensados para facilitar sua rotina e maximizar suas oportunidades
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              const isEven = i % 2 === 0
              return (
                <div
                  key={i}
                  className={`flex gap-5 p-6 rounded-2xl hover:bg-emerald-50/50 transition-colors duration-300 group ${isVisible('features') ? (isEven ? 'animate-slide-left' : 'animate-slide-right') : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/30 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        id="how-it-works"
        ref={(el) => { if (el) sectionRefs.current.set('how-it-works', el) }}
        className="py-20 sm:py-28 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${isVisible('how-it-works') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 px-4 py-1 rounded-full">
              Passo a passo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Simples de começar, poderoso no dia a dia
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Em poucos passos você está conectado a centenas de oportunidades
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={i}
                  className={`relative text-center ${isVisible('how-it-works') ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {/* Connector line */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-300 to-transparent" />
                  )}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-200/30 mb-5">
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-lg sm:left-auto sm:right-auto sm:top-0 sm:-right-2">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ DIFFERENTIALS ═══════════ */}
      <section
        id="differentials"
        ref={(el) => { if (el) sectionRefs.current.set('differentials', el) }}
        className="py-20 sm:py-28 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden"
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid lg:grid-cols-2 gap-16 items-center ${isVisible('differentials') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <Badge className="bg-white/15 text-white border border-white/20 mb-4 px-4 py-1 rounded-full">
                Diferenciais
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Por que somos a referência em repasse de plantões
              </h2>
              <p className="mt-4 text-lg text-emerald-100 leading-relaxed">
                Construímos a plataforma que a área da saúde precisava: segura, transparente e feita por quem entende.
              </p>
              <Button
                onClick={() => router.push('/register')}
                className="mt-8 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl px-8 h-14 text-base font-bold shadow-xl group"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {differentials.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] hover:bg-white/[0.12] transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  </div>
                  <span className="text-sm font-medium text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section
        id="testimonials"
        ref={(el) => { if (el) sectionRefs.current.set('testimonials', el) }}
        className="py-20 sm:py-28 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${isVisible('testimonials') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4 px-4 py-1 rounded-full">
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              O que dizem os profissionais
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Milhares de profissionais de saúde já confiam no Plantão Help
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                className={`bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 group ${isVisible('testimonials') ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-6 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section
        id="cta"
        ref={(el) => { if (el) sectionRefs.current.set('cta', el) }}
        className="py-20 sm:py-28 relative"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-10 sm:p-16 text-center ${isVisible('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pronto para transformar seus plantões?
              </h2>
              <p className="mt-4 text-lg text-emerald-100 leading-relaxed max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já estão usando o Plantão Help para encontrar as melhores oportunidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl px-8 h-14 text-base font-bold shadow-xl group"
                >
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 rounded-2xl px-8 h-14 text-base font-semibold"
                >
                  Já tenho conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.jpg" alt="Plantão Help" className="w-9 h-9 rounded-xl object-cover" />
                <span className="text-lg font-extrabold text-white">
                  Plantão<span className="text-emerald-400">Help</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                O marketplace de plantões médicos mais confiável do Brasil.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2">
                {['Funcionalidades', 'Como funciona', 'Preços', 'Para empresas'].map((item, i) => (
                  <li key={i}>
                    <button onClick={() => scrollToSection('features')} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                {['Sobre nós', 'Blog', 'Carreiras', 'Contato'].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Termos de uso', 'Privacidade', 'Cookies', 'LGPD'].map((item, i) => (
                  <li key={i}>
                    <span className="text-sm text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; 2025 PlantãoHelp. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-600 hover:text-emerald-400 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-600 hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-600 hover:text-emerald-400 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
