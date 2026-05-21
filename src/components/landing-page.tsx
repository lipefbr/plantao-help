'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Stethoscope, ArrowRight, Shield, Clock, Users, Star, MapPin,
  Calendar, HeartPulse, CheckCircle2, ChevronDown, Sparkles,
  TrendingUp, Search, Briefcase, MessageCircle, Phone, Mail
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function LandingPage() {
  const { setShowAuthModal, setAuthMode } = useAppStore()
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({ shifts: 0, users: 0, cities: 0, rating: 0 })
  const [featuredShifts, setFeaturedShifts] = useState<Array<{
    id: string; title: string; city: string; state: string; value: number; professionalType: string; date: string
  }>>([])
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Intersection observer for scroll animations
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
        const res = await fetch('/api/shifts?status=AVAILABLE')
        if (res.ok) {
          const data = await res.json()
          setStats(prev => ({ ...prev, shifts: data.length }))
          setFeaturedShifts(data.slice(0, 3))
        }
      } catch { /* */ }
    }
    loadStats()
  }, [])

  // Animated counter
  useEffect(() => {
    if (stats.shifts === 0) return
    const targets = { shifts: stats.shifts || 150, users: 500, cities: 50, rating: 4.8 }
    const duration = 2000
    const steps = 40
    const timer = setInterval(() => {
      setStats(prev => ({
        shifts: Math.min(prev.shifts + (targets.shifts / steps), targets.shifts),
        users: Math.min(prev.users + (targets.users / steps), targets.users),
        cities: Math.min(prev.cities + (targets.cities / steps), targets.cities),
        rating: Math.min(prev.rating + (targets.rating / steps), targets.rating),
      }))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [stats.shifts > 0])

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el)
  }

  const isVisible = (id: string) => visibleSections.has(id)

  const handleSignup = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt="Plantão Help"
              className="w-9 h-9 rounded-xl object-cover shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
            />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Plantão</span>
              <span className="text-emerald-600 dark:text-emerald-400">Help</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-emerald-600 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-sm">Recursos</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-sm">Como Funciona</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-sm">Depoimentos</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-sm">Planos</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogin} className="text-gray-600 dark:text-gray-400 hover:text-emerald-600">
              Entrar
            </Button>
            <Button size="sm" onClick={handleSignup} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
              Criar Conta
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-emerald-950/30 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Plataforma #1 para plantões médicos
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                Repasse de{' '}
                <span className="gradient-text">plantões</span>{' '}
                com segurança e{' '}
                <span className="text-emerald-600 dark:text-emerald-400">praticidade</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Marketplace para compra e venda de plantões médicos, de enfermagem e técnico de enfermagem.
                Conectamos profissionais da saúde a oportunidades em todo o Brasil.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleSignup}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-13 px-8 text-base rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl transition-all duration-300 cta-glow"
                >
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="h-13 px-8 text-base rounded-xl border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:text-emerald-600"
                >
                  Já tenho conta
                </Button>
              </div>
              {/* Trust indicators */}
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Cadastro gratuito
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  100% seguro
                </div>
              </div>
            </div>

            {/* Right - Hero Image / Visual */}
            <div className="relative animate-hero-float">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-200/30 dark:shadow-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center p-8 sm:p-12 min-h-[320px]">
                <img
                  src="/logo.jpg"
                  alt="Plantão Help - Logo"
                  className="w-full max-w-xs rounded-2xl object-cover shadow-lg"
                />
                {/* Overlay card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.jpg"
                      alt="Plantão Help"
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">Plantão UTI Adulto - Noturno</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">São Paulo, SP • R$ 1.200,00</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shrink-0">Novo</Badge>
                  </div>
                </div>
              </div>
              {/* Floating badge top-right */}
              <div className="absolute -top-3 -right-3 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['🩺', '💊', '🏥'].map((emoji, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">+500 profissionais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-emerald-400" />
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative py-12 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 4s linear infinite' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, value: `${Math.round(stats.shifts)}+`, label: 'Plantões Ativos' },
              { icon: Users, value: `${Math.round(stats.users)}+`, label: 'Profissionais' },
              { icon: MapPin, value: `${Math.round(stats.cities)}+`, label: 'Cidades' },
              { icon: Star, value: stats.rating.toFixed(1), label: 'Avaliação Média' },
            ].map((stat, i) => (
              <div key={i} className="text-center text-white">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-200" />
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="text-emerald-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" ref={setRef('features')} className={`py-20 sm:py-28 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
              Recursos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
              Ferramentas completas para gerenciar seus plantões com eficiência e segurança
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Publique Plantões',
                desc: 'Anuncie seus plantões disponíveis em segundos. Defina valor, horário e local.',
                color: 'emerald',
              },
              {
                icon: Search,
                title: 'Busque Oportunidades',
                desc: 'Encontre plantões por cidade, estado, tipo profissional e faixa de preço.',
                color: 'teal',
              },
              {
                icon: Shield,
                title: 'Transações Seguras',
                desc: 'Profissionais verificados com CRM/COREN. Sistema de avaliação confiável.',
                color: 'blue',
              },
              {
                icon: TrendingUp,
                title: 'Concursos & Editais',
                desc: 'Acompanhe concursos públicos da sua região com alertas de prazo.',
                color: 'amber',
              },
              {
                icon: Star,
                title: 'Sistema de Avaliação',
                desc: 'Avalie e seja avaliado. Construa sua reputação na plataforma.',
                color: 'purple',
              },
              {
                icon: Clock,
                title: 'Calendário Integrado',
                desc: 'Visualize seus plantões em calendário. Nunca perca um compromisso.',
                color: 'rose',
              },
            ].map((feature, i) => {
              const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
                emerald: { bg: 'from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900', text: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                teal: { bg: 'from-teal-50 to-white dark:from-teal-950/30 dark:to-gray-900', text: 'text-teal-600 dark:text-teal-400', iconBg: 'bg-teal-100 dark:bg-teal-900/30' },
                blue: { bg: 'from-sky-50 to-white dark:from-sky-950/30 dark:to-gray-900', text: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-100 dark:bg-sky-900/30' },
                amber: { bg: 'from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-900', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30' },
                purple: { bg: 'from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/30' },
                rose: { bg: 'from-rose-50 to-white dark:from-rose-950/30 dark:to-gray-900', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-900/30' },
              }
              const c = colorClasses[feature.color]
              return (
                <Card key={i} className={`rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${c.bg} group`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" ref={setRef('how-it-works')} className={`py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50 transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
              Como Funciona
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Simples, rápido e seguro
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
              Em apenas 4 passos você já está pronto para comprar ou vender plantões
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', icon: '📋', title: 'Cadastre-se', desc: 'Crie sua conta gratuita com CRM/COREN e aguarde a verificação' },
              { step: '02', icon: '📅', title: 'Publique ou Busque', desc: 'Anuncie seus plantões ou encontre oportunidades na sua região' },
              { step: '03', icon: '🤝', title: 'Feche o Negócio', desc: 'Compre ou venda plantões com segurança pela plataforma' },
              { step: '04', icon: '⭐', title: 'Avalie', desc: 'Avalie a experiência e fortaleça a comunidade de profissionais' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-emerald-300 to-emerald-100 dark:from-emerald-700 dark:to-emerald-900" />
                )}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SHIFTS ===== */}
      {featuredShifts.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Destaques
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Plantões em destaque
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                Confira as oportunidades mais recentes na plataforma
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShifts.map((shift) => (
                <Card key={shift.id} className="rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 group cursor-pointer" onClick={handleSignup}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                        {shift.professionalType === 'MEDICO' ? '🩺 Médico' : shift.professionalType === 'ENFERMEIRO' ? '💊 Enfermeiro' : '🏥 Téc. Enfermagem'}
                      </Badge>
                      <span className="text-xs text-gray-400">{shift.date}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{shift.title}</h4>
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {shift.city}, {shift.state}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(shift.value)}</span>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
                        Ver detalhes
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" ref={setRef('testimonials')} className={`py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50 transition-all duration-700 ${isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              O que dizem os profissionais
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Rafael Mendes',
                role: 'Médico Cardiologista',
                quote: 'O PlantãoHelp revolucionou como faço repasse de plantões. Em minutos consigo publicar e encontrar compradores interessados.',
                rating: 5,
                avatar: '🩺',
              },
              {
                name: 'Enf. Juliana Costa',
                role: 'Enfermeira UTI',
                quote: 'Como enfermeira, encontrar plantões extras era difícil. Agora com o PlantãoHelp consigo visualizar todas as oportunidades da minha região.',
                rating: 5,
                avatar: '💊',
              },
              {
                name: 'Téc. Pedro Santos',
                role: 'Téc. Enfermagem',
                quote: 'Sistema seguro e confiável. As avaliações me ajudam a escolher os melhores plantões e o suporte é excelente.',
                rating: 5,
                avatar: '🏥',
              },
            ].map((testimonial, i) => (
              <Card key={i} className="rounded-2xl shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 testimonial-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" ref={setRef('pricing')} className={`py-20 sm:py-28 transition-all duration-700 ${isVisible('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
              Planos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Comece gratuitamente
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
              Escolha o plano ideal para o seu momento profissional
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Gratuito',
                price: 'R$ 0',
                period: '/mês',
                desc: 'Para começar a explorar a plataforma',
                features: ['Publicar até 3 plantões/mês', 'Busca de plantões ilimitada', 'Perfil básico', 'Notificações por e-mail'],
                cta: 'Criar Conta Grátis',
                highlighted: false,
              },
              {
                name: 'Profissional',
                price: 'R$ 29',
                period: '/mês',
                desc: 'Para profissionais que querem se destacar',
                features: ['Plantões ilimitados', 'Destaque nos resultados', 'Badge verificado', 'Recomendações personalizadas', 'Calendário integrado', 'Suporte prioritário'],
                cta: 'Começar Agora',
                highlighted: true,
              },
              {
                name: 'Institucional',
                price: 'R$ 99',
                period: '/mês',
                desc: 'Para hospitais e clínicas',
                features: ['Múltiplos usuários', 'Painel administrativo', 'Relatórios avançados', 'API de integração', 'Gerente de conta dedicado', 'SLA garantido'],
                cta: 'Falar com Vendas',
                highlighted: false,
              },
            ].map((plan, i) => (
              <Card key={i} className={`rounded-2xl border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 ${plan.highlighted ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-200/30 dark:shadow-emerald-900/20 scale-[1.02] pricing-card-highlight' : 'bg-white dark:bg-gray-900 hover:shadow-lg pricing-card'}`}>
                <CardContent className="p-6">
                  <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 ${plan.highlighted ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-gray-500'}`}>{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-emerald-200' : 'text-emerald-500'}`} />
                        <span className={plan.highlighted ? 'text-emerald-50' : 'text-gray-700 dark:text-gray-300'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 rounded-xl h-11 ${plan.highlighted ? 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30'}`}
                    onClick={handleSignup}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer-slow 4s linear infinite' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Junte-se a centenas de profissionais da saúde que já usam o PlantãoHelp para gerenciar seus plantões.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleSignup}
              className="bg-white text-emerald-700 hover:bg-emerald-50 h-13 px-8 text-base rounded-xl shadow-xl font-semibold transition-all duration-300 hover:scale-[1.02] cta-glow"
            >
              Criar Conta Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={handleLogin}
              className="h-13 px-8 text-base rounded-xl bg-white/15 text-white border border-white/25 hover:bg-white/25 hover:border-white/40 transition-all duration-300 backdrop-blur-sm font-semibold"
            >
              Entrar na sua conta
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="/logo.jpg"
                  alt="Plantão Help"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-lg font-bold text-white">
                  Plantão<span className="text-emerald-400">Help</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Marketplace para compra e venda de plantões médicos, de enfermagem e técnico de enfermagem.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Depoimentos</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contato@plantaohelp.com</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> (11) 9999-9999</li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2025 PlantãoHelp. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">Termos</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
