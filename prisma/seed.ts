import { PrismaClient, UserRole, ContestStatus, ShiftStatus } from '@prisma/client'
import { hash } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Plans ─────────────────────────────────────────
  console.log('Creating plans...')
  const planBasico = await prisma.plan.create({
    data: {
      name: 'Básico',
      price: 0,
      description: 'Para profissionais começando no marketplace',
      features: JSON.stringify([
        'Publicar até 5 plantões/mês',
        'Buscar plantões disponíveis',
        'Perfil básico',
        'Notificações por email',
      ]),
      maxShifts: 5,
      isActive: true,
    },
  })

  const planProfissional = await prisma.plan.create({
    data: {
      name: 'Profissional',
      price: 49.90,
      description: 'Para profissionais ativos no marketplace',
      features: JSON.stringify([
        'Plantões ilimitados',
        'Destaque nos resultados de busca',
        'Dashboard de ganhos completo',
        'Alertas personalizados',
        'Suporte prioritário',
      ]),
      maxShifts: 0,
      isActive: true,
    },
  })

  const planPremium = await prisma.plan.create({
    data: {
      name: 'Premium',
      price: 99.90,
      description: 'Para empresas e profissionais de alto volume',
      features: JSON.stringify([
        'Tudo do Profissional',
        'Gestão de equipe',
        'Relatórios avançados',
        'API de integração',
        'Gerente de conta dedicado',
        'Selo verificado premium',
      ]),
      maxShifts: 0,
      isActive: true,
    },
  })

  const planEmpresa = await prisma.plan.create({
    data: {
      name: 'Empresa',
      price: 199.90,
      description: 'Para hospitais e clínicas',
      features: JSON.stringify([
        'Tudo do Premium',
        'Múltiplos usuários',
        'Gestão de escalas',
        'Integração com RH',
        'Faturamento corporativo',
        'SLA de suporte 24/7',
      ]),
      maxShifts: 0,
      isActive: true,
    },
  })

  // ─── Users ─────────────────────────────────────────
  console.log('Creating users...')

  const admin = await prisma.user.create({
    data: {
      email: 'admin@plantaohelp.com',
      password: 'admin123',
      name: 'Administrador',
      role: UserRole.ADMIN,
      registrationStatus: 'APPROVED',
      phone: '(11) 99999-0000',
      city: 'São Paulo',
      state: 'SP',
    },
  })

  const drSilva = await prisma.user.create({
    data: {
      email: 'dr.silva@medico.com',
      password: '123456',
      name: 'Dr. Carlos Silva',
      role: UserRole.MEDICO,
      registrationStatus: 'APPROVED',
      document: '123.456.789-00',
      professionalDoc: 'CRM 12345',
      phone: '(11) 98765-4321',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Cardiologista com 15 anos de experiência.',
      planId: planProfissional.id,
    },
  })

  const mariaEnf = await prisma.user.create({
    data: {
      email: 'maria@enfermeiro.com',
      password: '123456',
      name: 'Maria Santos',
      role: UserRole.ENFERMEIRO,
      registrationStatus: 'APPROVED',
      document: '987.654.321-00',
      professionalDoc: 'COREN 54321',
      phone: '(21) 97654-3210',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bio: 'Enfermeira especializada em UTI adulto.',
      planId: planBasico.id,
    },
  })

  const tecnicoCarlos = await prisma.user.create({
    data: {
      email: 'carlos@tecnico.com',
      password: '123456',
      name: 'Carlos Lima',
      role: UserRole.TECNICO_ENFERMAGEM,
      registrationStatus: 'APPROVED',
      document: '456.789.123-00',
      professionalDoc: 'COREN 67890',
      phone: '(31) 96543-2109',
      city: 'Belo Horizonte',
      state: 'MG',
      planId: planBasico.id,
    },
  })

  const empresa = await prisma.user.create({
    data: {
      email: 'contato@hospitalsp.com',
      password: '123456',
      name: 'Hospital São Paulo',
      role: UserRole.EMPRESA,
      registrationStatus: 'APPROVED',
      document: '12.345.678/0001-90',
      phone: '(11) 3456-7890',
      city: 'São Paulo',
      state: 'SP',
      companyName: 'Hospital São Paulo LTDA',
      planId: planEmpresa.id,
    },
  })

  const draAna = await prisma.user.create({
    data: {
      email: 'dra.ana@medico.com',
      password: '123456',
      name: 'Dra. Ana Oliveira',
      role: UserRole.MEDICO,
      registrationStatus: 'APPROVED',
      professionalDoc: 'CRM 67890',
      phone: '(11) 91234-5678',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Neurologista com foco em emergências.',
      planId: planPremium.id,
    },
  })

  const pendingUser = await prisma.user.create({
    data: {
      email: 'novo@medico.com',
      password: '123456',
      name: 'Dr. Novo Pendente',
      role: UserRole.MEDICO,
      registrationStatus: 'PENDING',
      professionalDoc: 'CRM 99999',
      city: 'Curitiba',
      state: 'PR',
    },
  })

  // ─── Hospitals ─────────────────────────────────────
  console.log('Creating hospitals...')
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: { name: 'Hospital Albert Einstein', address: 'Av. Albert Einstein, 627', city: 'São Paulo', state: 'SP', phone: '(11) 2151-1234' },
    }),
    prisma.hospital.create({
      data: { name: 'Hospital Sírio-Libanês', address: 'R. Dona Adma Jafet, 91', city: 'São Paulo', state: 'SP', phone: '(11) 3394-0300' },
    }),
    prisma.hospital.create({
      data: { name: 'Hospital das Clínicas', address: 'Av. Dr. Enéas Carvalho de Aguiar, 255', city: 'São Paulo', state: 'SP', phone: '(11) 2661-6000' },
    }),
    prisma.hospital.create({
      data: { name: 'Hospital São Paulo', address: 'R. Napoleão de Barros, 715', city: 'São Paulo', state: 'SP', phone: '(11) 5576-4000' },
    }),
    prisma.hospital.create({
      data: { name: 'Santa Casa de Misericórdia', address: 'R. Santa Clara, 77', city: 'Rio de Janeiro', state: 'RJ', phone: '(21) 2394-1600' },
    }),
    prisma.hospital.create({
      data: { name: 'Hospital Moinhos de Vento', address: 'R. Ramiro Barcelos, 910', city: 'Porto Alegre', state: 'RS', phone: '(51) 3314-1600' },
    }),
  ])

  // ─── Locations ─────────────────────────────────────
  console.log('Creating locations...')
  await Promise.all([
    prisma.location.create({ data: { city: 'São Paulo', state: 'SP' } }),
    prisma.location.create({ data: { city: 'Rio de Janeiro', state: 'RJ' } }),
    prisma.location.create({ data: { city: 'Belo Horizonte', state: 'MG' } }),
    prisma.location.create({ data: { city: 'Curitiba', state: 'PR' } }),
    prisma.location.create({ data: { city: 'Porto Alegre', state: 'RS' } }),
    prisma.location.create({ data: { city: 'Salvador', state: 'BA' } }),
    prisma.location.create({ data: { city: 'Brasília', state: 'DF' } }),
    prisma.location.create({ data: { city: 'Recife', state: 'PE' } }),
    prisma.location.create({ data: { city: 'Fortaleza', state: 'CE' } }),
    prisma.location.create({ data: { city: 'Goiânia', state: 'GO' } }),
  ])

  // ─── Shifts ────────────────────────────────────────
  console.log('Creating shifts...')
  const now = new Date()
  const shifts = await Promise.all([
    prisma.shift.create({
      data: {
        title: 'UTI Adulto — Noturno',
        description: 'Plantão noturno em UTI adulto, escala 12h.',
        date: new Date(now.getTime() + 2 * 86400000),
        startTime: '19:00',
        endTime: '07:00',
        value: 1200,
        location: 'Hospital Albert Einstein',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: empresa.id,
        hospitalId: hospitals[0].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'Pronto-Socorro — Diurno',
        description: 'Plantão diurno no PS, escala 12h.',
        date: new Date(now.getTime() + 3 * 86400000),
        startTime: '07:00',
        endTime: '19:00',
        value: 900,
        location: 'Hospital Sírio-Libanês',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: empresa.id,
        hospitalId: hospitals[1].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'UTI Neonatal — Noturno',
        description: 'Plantão noturno em UTI neonatal.',
        date: new Date(now.getTime() + 1 * 86400000),
        startTime: '19:00',
        endTime: '07:00',
        value: 1400,
        location: 'Hospital das Clínicas',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.SOLD,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: empresa.id,
        buyerId: mariaEnf.id,
        hospitalId: hospitals[2].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'Centro Cirúrgico — Diurno',
        description: 'Centro cirúrgico, escala 6h.',
        date: new Date(now.getTime() + 4 * 86400000),
        startTime: '07:00',
        endTime: '13:00',
        value: 800,
        location: 'Hospital São Paulo',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: empresa.id,
        hospitalId: hospitals[3].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'Emergência — Noturno',
        description: 'Plantão de emergência noturna.',
        date: new Date(now.getTime() + 5 * 86400000),
        startTime: '19:00',
        endTime: '07:00',
        value: 1100,
        location: 'Santa Casa de Misericórdia',
        city: 'Rio de Janeiro',
        state: 'RJ',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: drSilva.id,
        hospitalId: hospitals[4].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'Clínica Médica — Diurno',
        description: 'Clínica médica, escala 12h.',
        date: new Date(now.getTime() - 1 * 86400000),
        startTime: '07:00',
        endTime: '19:00',
        value: 750,
        location: 'Hospital Moinhos de Vento',
        city: 'Porto Alegre',
        state: 'RS',
        status: ShiftStatus.SOLD,
        professionalType: UserRole.MEDICO,
        sellerId: drSilva.id,
        buyerId: draAna.id,
        hospitalId: hospitals[5].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'UTI Pediátrica — Noturno',
        description: 'UTI pediátrica noturno.',
        date: new Date(now.getTime() + 7 * 86400000),
        startTime: '19:00',
        endTime: '07:00',
        value: 1300,
        location: 'Hospital Albert Einstein',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: empresa.id,
        hospitalId: hospitals[0].id,
      },
    }),
    prisma.shift.create({
      data: {
        title: 'Enfermaria — Misto',
        description: 'Enfermaria geral, escala mista.',
        date: new Date(now.getTime() + 6 * 86400000),
        startTime: '13:00',
        endTime: '01:00',
        value: 950,
        location: 'Hospital Sírio-Libanês',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.CANCELLED,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: empresa.id,
        hospitalId: hospitals[1].id,
      },
    }),
  ])

  // ─── Contests ──────────────────────────────────────
  console.log('Creating contests...')
  await Promise.all([
    prisma.contest.create({
      data: {
        title: 'Concurso SUS — Médico Cardiologista',
        description: 'Concurso público para médico cardiologista no SUS.',
        professionalType: UserRole.MEDICO,
        city: 'São Paulo',
        state: 'SP',
        deadline: new Date(now.getTime() + 30 * 86400000),
        link: 'https://example.com/concurso/sus-sp',
        status: ContestStatus.ACTIVE,
      },
    }),
    prisma.contest.create({
      data: {
        title: 'Concurso HU — Enfermeiro UTI',
        description: 'Concurso para enfermeiro de UTI no Hospital Universitário.',
        professionalType: UserRole.ENFERMEIRO,
        city: 'Rio de Janeiro',
        state: 'RJ',
        deadline: new Date(now.getTime() + 45 * 86400000),
        link: 'https://example.com/concurso/hu-rj',
        status: ContestStatus.ACTIVE,
      },
    }),
    prisma.contest.create({
      data: {
        title: 'Concurso Municipal — Téc. Enfermagem',
        description: 'Concurso municipal para técnico de enfermagem.',
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        city: 'Belo Horizonte',
        state: 'MG',
        deadline: new Date(now.getTime() + 60 * 86400000),
        link: 'https://example.com/concurso/mun-bh',
        status: ContestStatus.ACTIVE,
      },
    }),
  ])

  // ─── Registration Fees ─────────────────────────────
  console.log('Creating registration fees...')
  await Promise.all([
    prisma.registrationFee.create({ data: { professionalType: UserRole.MEDICO, value: 29.90, description: 'Taxa de cadastro para médicos' } }),
    prisma.registrationFee.create({ data: { professionalType: UserRole.ENFERMEIRO, value: 19.90, description: 'Taxa de cadastro para enfermeiros' } }),
    prisma.registrationFee.create({ data: { professionalType: UserRole.TECNICO_ENFERMAGEM, value: 14.90, description: 'Taxa de cadastro para técnicos' } }),
    prisma.registrationFee.create({ data: { professionalType: UserRole.EMPRESA, value: 99.90, description: 'Taxa de cadastro para empresas' } }),
  ])

  // ─── Notifications ────────────────────────────────
  console.log('Creating notifications...')
  await Promise.all([
    prisma.notification.create({ data: { userId: drSilva.id, title: 'Bem-vindo ao Plantão Help!', message: 'Sua conta foi aprovada. Comece a explorar plantões agora!', type: 'SUCCESS' } }),
    prisma.notification.create({ data: { userId: mariaEnf.id, title: 'Novo plantão disponível', message: 'Um plantão de UTI Neonatal em São Paulo foi publicado.', type: 'INFO' } }),
    prisma.notification.create({ data: { userId: admin.id, title: 'Novo cadastro pendente', message: 'Dr. Novo Pendente aguarda aprovação.', type: 'WARNING' } }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('  🔑 CREDENCIAIS DE ACESSO')
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log('  ADMIN:')
  console.log('    Email: admin@plantaohelp.com')
  console.log('    Senha: admin123')
  console.log('')
  console.log('  MÉDICO:')
  console.log('    Email: dr.silva@medico.com')
  console.log('    Senha: 123456')
  console.log('')
  console.log('  ENFERMEIRO:')
  console.log('    Email: maria@enfermeiro.com')
  console.log('    Senha: 123456')
  console.log('')
  console.log('  TÉCNICO:')
  console.log('    Email: carlos@tecnico.com')
  console.log('    Senha: 123456')
  console.log('')
  console.log('  EMPRESA:')
  console.log('    Email: contato@hospitalsp.com')
  console.log('    Senha: 123456')
  console.log('')
  console.log('═══════════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
