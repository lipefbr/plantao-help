'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, MessageCircle, Mail, ChevronRight, ExternalLink } from 'lucide-react'

const faqItems = [
  {
    question: 'Como funciona o Plantão Help?',
    answer: 'O Plantão Help é um marketplace onde profissionais da saúde podem comprar e vender plantões. Você publica seu plantão disponível, outros profissionais podem comprá-lo, e ambos avaliam a transação.'
  },
  {
    question: 'Quais profissionais podem se cadastrar?',
    answer: 'Médicos, Enfermeiros e Técnicos de Enfermagem podem se cadastrar como pessoa física. Todos precisam passar por uma verificação de documentos (CRM/COREN) antes de utilizar a plataforma.'
  },
  {
    question: 'Como é feita a aprovação do cadastro?',
    answer: 'Após o cadastro, nossa equipe administrativa verifica seus documentos profissionais (CRM, COREN). O processo geralmente leva até 24 horas. Você receberá uma notificação quando for aprovado.'
  },
  {
    question: 'Quanto custa para usar a plataforma?',
    answer: 'O cadastro é gratuito! As taxas de registro variam por tipo profissional: Médicos pagam R$99,90, Enfermeiros R$79,90 e Técnicos de Enfermagem R$59,90. Essas taxas são pagas uma única vez.'
  },
  {
    question: 'Posso cancelar um plantão publicado?',
    answer: 'Sim, você pode cancelar um plantão enquanto ele ainda estiver com status "Disponível" (não comprado). Após a compra, o cancelamento deve ser tratado diretamente entre as partes.'
  },
  {
    question: 'Como funciona o sistema de avaliações?',
    answer: 'Após a conclusão de um plantão (compra realizada), tanto o comprador quanto o vendedor podem avaliar a transação com 1 a 5 estrelas e um comentário opcional. As avaliações são públicas e ajudam a construir a reputação dos profissionais.'
  },
  {
    question: 'Os plantões são filtrados por região?',
    answer: 'Sim! Ao se cadastrar, você informa sua cidade e estado. Os plantões e concursos são filtrados pela sua região para mostrar apenas oportunidades relevantes para você.'
  },
  {
    question: 'O que são os Concursos?',
    answer: 'A seção de Concursos lista concursos públicos e processos seletivos na área da saúde, filtrados pelo seu tipo profissional e região. Você encontra informações sobre prazos, vagas e links para os editais.'
  },
  {
    question: 'Como compartilhar um plantão?',
    answer: 'Em qualquer detalhe de plantão, você encontrará o botão de compartilhar (ícone de seta). Você pode compartilhar via WhatsApp ou copiar o link direto do plantão.'
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Levamos a segurança a sério. Seus dados profissionais são verificados pela nossa equipe, e todas as transações são registradas com avaliações para garantir a confiabilidade da comunidade.'
  }
]

export function FaqHelpSection() {
  const [showAll, setShowAll] = useState(false)
  const displayedItems = showAll ? faqItems : faqItems.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* FAQ Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Perguntas Frequentes</h3>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          {displayedItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!showAll && faqItems.length > 4 && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-sm"
            onClick={() => setShowAll(true)}
          >
            Ver mais perguntas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Contact Support */}
      <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-teal-100 dark:bg-teal-800/30 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Precisa de ajuda?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Nossa equipe está aqui para você</p>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="mailto:suporte@plantaohelp.com"
              className="flex items-center gap-3 p-2.5 bg-white/80 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group"
            >
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">suporte@plantaohelp.com</span>
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 bg-white/80 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp: (11) 99999-9999</span>
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
