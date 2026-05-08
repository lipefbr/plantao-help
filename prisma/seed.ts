import { PrismaClient, UserRole, RegistrationStatus, ShiftStatus, ContestStatus } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await db.rating.deleteMany()
  await db.shift.deleteMany()
  await db.contest.deleteMany()
  await db.hospital.deleteMany()
  await db.registrationFee.deleteMany()
  await db.location.deleteMany()
  await db.user.deleteMany()

  // Create admin
  const admin = await db.user.create({
    data: {
      email: 'admin@plantaohelp.com',
      password: 'admin123',
      name: 'Administrador',
      role: UserRole.ADMIN,
      registrationStatus: RegistrationStatus.APPROVED,
      city: 'São Paulo',
      state: 'SP',
    },
  })

  // Create locations
  const locations = await Promise.all([
    db.location.create({ data: { city: 'São Paulo', state: 'SP' } }),
    db.location.create({ data: { city: 'Rio de Janeiro', state: 'RJ' } }),
    db.location.create({ data: { city: 'Belo Horizonte', state: 'MG' } }),
    db.location.create({ data: { city: 'Curitiba', state: 'PR' } }),
    db.location.create({ data: { city: 'Salvador', state: 'BA' } }),
    db.location.create({ data: { city: 'Brasília', state: 'DF' } }),
    db.location.create({ data: { city: 'Porto Alegre', state: 'RS' } }),
    db.location.create({ data: { city: 'Recife', state: 'PE' } }),
    db.location.create({ data: { city: 'Campinas', state: 'SP' } }),
    db.location.create({ data: { city: 'Fortaleza', state: 'CE' } }),
  ])

  // Create registration fees
  await Promise.all([
    db.registrationFee.create({ data: { professionalType: UserRole.MEDICO, value: 199.90, description: 'Taxa de cadastro para Médicos' } }),
    db.registrationFee.create({ data: { professionalType: UserRole.ENFERMEIRO, value: 99.90, description: 'Taxa de cadastro para Enfermeiros' } }),
    db.registrationFee.create({ data: { professionalType: UserRole.TECNICO_ENFERMAGEM, value: 69.90, description: 'Taxa de cadastro para Técnicos de Enfermagem' } }),
    db.registrationFee.create({ data: { professionalType: UserRole.EMPRESA, value: 499.90, description: 'Taxa de cadastro para Empresas' } }),
  ])

  // Create hospitals
  const hospitals = await Promise.all([
    db.hospital.create({ data: { name: 'Hospital das Clínicas - SP', address: 'Av. Dr. Enéas de Carvalho Aguiar, 255', city: 'São Paulo', state: 'SP', phone: '(11) 2661-7000' } }),
    db.hospital.create({ data: { name: 'Hospital Sírio-Libanês', address: 'R. Dona Adma Jafet, 91', city: 'São Paulo', state: 'SP', phone: '(11) 3394-0200' } }),
    db.hospital.create({ data: { name: 'Hospital Albert Einstein', address: 'Av. Albert Einstein, 627', city: 'São Paulo', state: 'SP', phone: '(11) 2151-1233' } }),
    db.hospital.create({ data: { name: 'Hospital Universitário - RJ', address: 'Av. Brigadeiro Trompowsky, s/n', city: 'Rio de Janeiro', state: 'RJ', phone: '(21) 3938-2000' } }),
    db.hospital.create({ data: { name: 'Hospital Copa D\'Or', address: 'R. Figueiredo Magalhães, 875', city: 'Rio de Janeiro', state: 'RJ', phone: '(21) 2545-3600' } }),
    db.hospital.create({ data: { name: 'Hospital das Clínicas - BH', address: 'Av. Prof. Alfredo Balena, 110', city: 'Belo Horizonte', state: 'MG', phone: '(31) 3409-9000' } }),
    db.hospital.create({ data: { name: 'Hospital Erasto Gaertner', address: 'R. Dr. Ovande do Amaral, 201', city: 'Curitiba', state: 'PR', phone: '(41) 3316-4000' } }),
    db.hospital.create({ data: { name: 'Hospital Português', address: 'R. Odilon Vasconcelos, 107', city: 'Salvador', state: 'BA', phone: '(71) 2102-5000' } }),
    db.hospital.create({ data: { name: 'Hospital de Base - DF', address: 'SMHN Quadra 101, Bloco A', city: 'Brasília', state: 'DF', phone: '(61) 3325-4000' } }),
    db.hospital.create({ data: { name: 'Hospital Moinhos de Vento', address: 'R. Ramiro Barcelos, 910', city: 'Porto Alegre', state: 'RS', phone: '(51) 3314-3000' } }),
  ])

  // Create sample users
  const medico1 = await db.user.create({
    data: {
      email: 'dr.silva@medico.com',
      password: '123456',
      name: 'Dr. Carlos Silva',
      role: UserRole.MEDICO,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '123.456.789-00',
      professionalDoc: 'CRM-SP 123456',
      phone: '(11) 99999-1111',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Médico cardiologista com 10 anos de experiência em UTI.',
    },
  })

  const medico2 = await db.user.create({
    data: {
      email: 'dra.santos@medico.com',
      password: '123456',
      name: 'Dra. Ana Santos',
      role: UserRole.MEDICO,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '987.654.321-00',
      professionalDoc: 'CRM-RJ 654321',
      phone: '(21) 99999-2222',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bio: 'Médica emergencista especializada em trauma.',
    },
  })

  const medico3 = await db.user.create({
    data: {
      email: 'dr.oliveira@medico.com',
      password: '123456',
      name: 'Dr. Pedro Oliveira',
      role: UserRole.MEDICO,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '456.789.123-00',
      professionalDoc: 'CRM-MG 789012',
      phone: '(31) 99999-3333',
      city: 'Belo Horizonte',
      state: 'MG',
      bio: 'Clínico geral com experiência em plantões noturnos.',
    },
  })

  const medicoPending = await db.user.create({
    data: {
      email: 'dr.novo@medico.com',
      password: '123456',
      name: 'Dr. João Novo',
      role: UserRole.MEDICO,
      registrationStatus: RegistrationStatus.PENDING,
      document: '111.222.333-44',
      professionalDoc: 'CRM-SP 999888',
      phone: '(11) 98888-4444',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Recém-formado buscando oportunidades.',
    },
  })

  const enfermeiro1 = await db.user.create({
    data: {
      email: 'maria@enfermeiro.com',
      password: '123456',
      name: 'Enf. Maria Costa',
      role: UserRole.ENFERMEIRO,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '222.333.444-55',
      professionalDoc: 'COREN-SP 123456',
      phone: '(11) 97777-5555',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Enfermeira com 8 anos de experiência em centro cirúrgico.',
    },
  })

  const enfermeiro2 = await db.user.create({
    data: {
      email: 'jose@enfermeiro.com',
      password: '123456',
      name: 'Enf. José Ferreira',
      role: UserRole.ENFERMEIRO,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '333.444.555-66',
      professionalDoc: 'COREN-RJ 654321',
      phone: '(21) 96666-6666',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bio: 'Enfermeiro especializado em emergência.',
    },
  })

  const tecnico1 = await db.user.create({
    data: {
      email: 'lucas@tecnico.com',
      password: '123456',
      name: 'Téc. Lucas Pereira',
      role: UserRole.TECNICO_ENFERMAGEM,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '444.555.666-77',
      professionalDoc: 'COREN-SP 789012',
      phone: '(11) 95555-7777',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Técnico de enfermagem com experiência em UTI adulto.',
    },
  })

  const tecnico2 = await db.user.create({
    data: {
      email: 'camila@tecnico.com',
      password: '123456',
      name: 'Téc. Camila Rodrigues',
      role: UserRole.TECNICO_ENFERMAGEM,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '555.666.777-88',
      professionalDoc: 'COREN-PR 345678',
      phone: '(41) 94444-8888',
      city: 'Curitiba',
      state: 'PR',
      bio: 'Técnica de enfermagem pediátrica.',
    },
  })

  const empresa1 = await db.user.create({
    data: {
      email: 'contato@hospitalabc.com',
      password: '123456',
      name: 'Hospital ABC LTDA',
      role: UserRole.EMPRESA,
      registrationStatus: RegistrationStatus.APPROVED,
      document: '12.345.678/0001-99',
      phone: '(11) 3333-1111',
      city: 'São Paulo',
      state: 'SP',
      companyName: 'Hospital ABC',
      bio: 'Rede hospitalar com 3 unidades em São Paulo.',
    },
  })

  // Create shifts
  const now = new Date()
  const shifts = await Promise.all([
    db.shift.create({
      data: {
        title: 'Plantão UTI Adulto - Noturno',
        description: 'Plantão noturno na UTI adulto. Necessário experiência mínima de 2 anos. Equipamentos de proteção fornecidos.',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 1800.00,
        location: 'Hospital das Clínicas - SP',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: medico1.id,
        hospitalId: hospitals[0].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Emergência - Diurno',
        description: 'Plantão diurno na emergência. Atendimento de média complexidade.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 1500.00,
        location: 'Hospital Sírio-Libanês',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: medico1.id,
        hospitalId: hospitals[1].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Centro Cirúrgico',
        description: 'Plantão integral no centro cirúrgico. Necessário COREN ativo.',
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 800.00,
        location: 'Hospital Albert Einstein',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: enfermeiro1.id,
        hospitalId: hospitals[2].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão UTI Pediátrica - Noturno',
        description: 'Plantão noturno na UTI pediátrica. Experiência com crianças obrigatória.',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 900.00,
        location: 'Hospital Universitário - RJ',
        city: 'Rio de Janeiro',
        state: 'RJ',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: enfermeiro2.id,
        hospitalId: hospitals[3].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão UTI Adulto - Diurno',
        description: 'Plantão diurno na UTI adulto. Auxílio nos procedimentos e monitoramento.',
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 450.00,
        location: 'Hospital das Clínicas - SP',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: tecnico1.id,
        hospitalId: hospitals[0].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Emergência - Noturno',
        description: 'Plantão noturno na emergência. Suporte aos enfermeiros e médicos.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 500.00,
        location: 'Hospital Copa D\'Or',
        city: 'Rio de Janeiro',
        state: 'RJ',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: tecnico2.id,
        hospitalId: hospitals[4].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Clínica Médica - 12h',
        description: 'Plantão de 12h na clínica médica. Atendimento ambulatorial e internação.',
        date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 1200.00,
        location: 'Hospital das Clínicas - BH',
        city: 'Belo Horizonte',
        state: 'MG',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: medico3.id,
        hospitalId: hospitals[5].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Oncologia - Diurno',
        description: 'Plantão no setor de oncologia. Quimioterapia e acompanhamento.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 700.00,
        location: 'Hospital Erasto Gaertner',
        city: 'Curitiba',
        state: 'PR',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: enfermeiro2.id,
        hospitalId: hospitals[6].id,
      },
    }),
    // A sold shift
    db.shift.create({
      data: {
        title: 'Plantão Emergência - Integral',
        description: 'Plantão integral na emergência. Já preenchido.',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 1600.00,
        location: 'Hospital Sírio-Libanês',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.SOLD,
        professionalType: UserRole.MEDICO,
        sellerId: medico1.id,
        buyerId: medico2.id,
        hospitalId: hospitals[1].id,
      },
    }),
    // Company posted shift
    db.shift.create({
      data: {
        title: 'Plantão Hospital ABC - UTI',
        description: 'Vaga para médico intensivista. Hospital ABC oferece estrutura completa.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 2200.00,
        location: 'Hospital ABC - Unidade Centro',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: empresa1.id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Pediatria - Diurno',
        description: 'Plantão diurno na pediatria. Ótimo ambiente de trabalho.',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 550.00,
        location: 'Hospital Português',
        city: 'Salvador',
        state: 'BA',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: empresa1.id,
        hospitalId: hospitals[7].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Maternidade - Noturno',
        description: 'Plantão noturno na maternidade. Necessário experiência em obstetrícia.',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 950.00,
        location: 'Hospital de Base - DF',
        city: 'Brasília',
        state: 'DF',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.ENFERMEIRO,
        sellerId: enfermeiro1.id,
        hospitalId: hospitals[8].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão Neurologia - 12h',
        description: 'Plantão no setor de neurologia. Acompanhamento de pacientes com AVC.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        startTime: '07:00',
        endTime: '19:00',
        value: 1400.00,
        location: 'Hospital Moinhos de Vento',
        city: 'Porto Alegre',
        state: 'RS',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.MEDICO,
        sellerId: medico3.id,
        hospitalId: hospitals[9].id,
      },
    }),
    db.shift.create({
      data: {
        title: 'Plantão UTI Neonatal - Noturno',
        description: 'Plantão noturno na UTI neonatal. Cuidados com recém-nascidos.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '07:00',
        value: 480.00,
        location: 'Hospital das Clínicas - SP',
        city: 'São Paulo',
        state: 'SP',
        status: ShiftStatus.AVAILABLE,
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        sellerId: tecnico1.id,
        hospitalId: hospitals[0].id,
      },
    }),
  ])

  // Create ratings
  const soldShift = shifts[8] // The sold shift
  await db.rating.create({
    data: {
      shiftId: soldShift.id,
      raterId: medico2.id,
      receiverId: medico1.id,
      stars: 4,
      comment: 'Ótima comunicação e plantão bem organizado.',
    },
  })

  // Create contests
  await Promise.all([
    db.contest.create({
      data: {
        title: 'Concurso SUS São Paulo - Médico Clínico Geral',
        description: 'Concurso público para médicos clínicos gerais no SUS de São Paulo. 50 vagas disponíveis.',
        professionalType: UserRole.MEDICO,
        city: 'São Paulo',
        state: 'SP',
        deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-sp-medico',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso Hospital Municipal - Enfermeiro',
        description: 'Processo seletivo para enfermeiros no Hospital Municipal de São Paulo. 30 vagas.',
        professionalType: UserRole.ENFERMEIRO,
        city: 'São Paulo',
        state: 'SP',
        deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-sp-enfermeiro',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso SES RJ - Técnico de Enfermagem',
        description: 'Concurso da Secretaria Estadual de Saúde do RJ. 100 vagas para técnicos.',
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        city: 'Rio de Janeiro',
        state: 'RJ',
        deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-rj-tecnico',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso HC - Médico Emergencista',
        description: 'Concurso para médicos emergencistas no Hospital das Clínicas de BH.',
        professionalType: UserRole.MEDICO,
        city: 'Belo Horizonte',
        state: 'MG',
        deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-bh-medico',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso UPA Curitiba - Enfermeiro',
        description: 'Seleção para enfermeiros nas UPAs de Curitiba. 20 vagas.',
        professionalType: UserRole.ENFERMEIRO,
        city: 'Curitiba',
        state: 'PR',
        deadline: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-pr-enfermeiro',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso HU - Técnico de Enfermagem SP',
        description: 'Processo seletivo simplificado para técnicos de enfermagem. 40 vagas.',
        professionalType: UserRole.TECNICO_ENFERMAGEM,
        city: 'São Paulo',
        state: 'SP',
        deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-sp-tecnico',
        status: ContestStatus.ACTIVE,
      },
    }),
    db.contest.create({
      data: {
        title: 'Concurso SESAB - Médico Cardiologista',
        description: 'Concurso da Secretaria de Saúde da Bahia para cardiologistas. 10 vagas.',
        professionalType: UserRole.MEDICO,
        city: 'Salvador',
        state: 'BA',
        deadline: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        link: 'https://example.com/concurso-ba-medico',
        status: ContestStatus.ACTIVE,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`   - ${1} admin created`)
  console.log(`   - ${locations.length} locations created`)
  console.log(`   - ${4} registration fees created`)
  console.log(`   - ${hospitals.length} hospitals created`)
  console.log(`   - ${8} users created (doctors, nurses, technicians, company)`)
  console.log(`   - ${shifts.length} shifts created`)
  console.log(`   - ${1} rating created`)
  console.log(`   - ${7} contests created`)
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
