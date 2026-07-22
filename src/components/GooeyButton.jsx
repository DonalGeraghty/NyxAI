import { useEffect, useRef, useState } from 'react'
import './GooeyButton.css'

export default function GooeyButton({ children, disabled, type = 'button' }) {
  const effectRef = useRef(null)
  const timersRef = useRef([])
  const [active, setActive] = useState(false)

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => clearTimers, [])

  const animate = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    clearTimers()
    const effect = effectRef.current
    effect.replaceChildren()
    effect.classList.remove('active')
    void effect.offsetWidth
    effect.classList.add('active')
    setActive(true)

    for (let index = 0; index < 12; index += 1) {
      const angle = ((360 / 12) * index + Math.random() * 8 - 4) * (Math.PI / 180)
      const particle = document.createElement('span')
      particle.className = 'gooey-particle'
      particle.style.setProperty('--x', `${Math.cos(angle) * 55}px`)
      particle.style.setProperty('--y', `${Math.sin(angle) * 55}px`)
      particle.style.setProperty('--delay', `${Math.random() * 100}ms`)
      particle.style.setProperty('--color', `var(--gooey-color-${(index % 4) + 1})`)
      effect.appendChild(particle)
    }

    timersRef.current.push(setTimeout(() => {
      setActive(false)
      effect.classList.remove('active')
    }, 600))
    timersRef.current.push(setTimeout(() => effect.replaceChildren(), 900))
  }

  return (
    <span className="gooey-button-wrap">
      <button
        type={type}
        className={`gooey-button${active ? ' is-active' : ''}`}
        disabled={disabled}
        onClick={animate}
      >
        {children}
      </button>
      <span className={`gooey-button-text${active ? ' is-active' : ''}`} aria-hidden="true">
        {children}
      </span>
      <span className="gooey-button-effect" ref={effectRef} aria-hidden="true" />
    </span>
  )
}
