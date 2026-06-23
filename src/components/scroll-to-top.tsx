'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Floating "scroll to top" button.
 * Attaches to a scroll container by id. Uses absolute positioning so it works
 * inside the phone frame container on desktop.
 */
export function ScrollToTop({ targetId }: { targetId: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const handleScroll = () => {
      setVisible(target.scrollTop > 320)
    }
    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener('scroll', handleScroll)
  }, [targetId])

  const handleClick = useCallback(() => {
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [targetId])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Voltar ao topo"
      className="scroll-top-btn visible"
    >
      <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  )
}
