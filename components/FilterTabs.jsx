'use client'
import { useRef, useEffect } from 'react'
import styles from './FilterTabs.module.css'

/**
 * FilterTabs — onglets de filtrage horizontaux
 * Props :
 *   tabs    : { slug: string, label: string }[]
 *   active  : string   (slug actif)
 *   onChange: (slug: string) => void
 */
export default function FilterTabs({ tabs = [], active = '', onChange }) {
  const trackRef  = useRef(null)
  const activeRef = useRef(null)
  const inkRef    = useRef(null)

  /* ── Ink bar animation ───────────────────────────── */
  useEffect(() => {
    const track = trackRef.current
    const ink   = inkRef.current
    const btn   = activeRef.current
    if (!track || !ink || !btn) return

    const tRect = track.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()

    ink.style.width     = `${bRect.width}px`
    ink.style.transform = `translateX(${bRect.left - tRect.left}px)`
  }, [active, tabs])

  return (
    <nav
      ref={trackRef}
      className={styles.track}
      aria-label="Filtres par catégorie"
      role="tablist"
    >
      {/* Ink indicator */}
      <span ref={inkRef} className={styles.ink} aria-hidden />

      {tabs.map(tab => {
        const isActive = active === tab.slug
        return (
          <button
            key={tab.slug}
            ref={isActive ? activeRef : null}
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onChange?.(tab.slug)}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
