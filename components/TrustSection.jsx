'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './TrustSection.module.css'

/* ── Piliers ────────────────────────────────────────────── */
const PILLARS = [
  {
    id: 'livraison',
    icon: <DeliveryIcon />,
    label: 'Livraison Casablanca',
    value: 'Même jour',
    desc: 'Commandez avant 15h, votre bouquet arrive dans la journée. Zones desservies : Maarif, Anfa, CIL, Hay Riad, Ain Diab.',
  },
  {
    id: 'paiement',
    icon: <PaymentIcon />,
    label: 'Paiement à la livraison',
    value: 'Zéro risque',
    desc: 'Vous payez en cash uniquement à la réception. Aucune avance, aucune carte requise. Virement disponible.',
  },
  {
    id: 'qualite',
    icon: <QualityIcon />,
    label: 'Qualité florale',
    value: 'Fraîcheur garantie',
    desc: "Chaque tige est sélectionnée le matin même. Si vous n'êtes pas satisfait, nous remplaçons sans discussion.",
  },
  {
    id: 'rapidite',
    icon: <SpeedIcon />,
    label: 'Préparation express',
    value: '2 à 4 heures',
    desc: 'Assemblé à la main après votre commande. Jamais en stock, toujours frais. WhatsApp pour un suivi en temps réel.',
  },
]

export default function TrustSection() {
  const sectionRef = useRef(null)
  const pillarsRef = useRef(null)
  const ctxRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let gsap, ScrollTrigger

    async function init() {
      gsap = (await import('gsap')).default
      ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger

      gsap.registerPlugin(ScrollTrigger)

      const el = sectionRef.current
      const pillarsEl = pillarsRef.current
      if (!el || !pillarsEl) return

      // S'assurer que les piliers sont visibles avant animation
      gsap.set('[data-ts="pillar"]', { opacity: 1, y: 0 })

      ctxRef.current = gsap.context(() => {
        /* Ligne horizontale */
        gsap.fromTo('[data-ts="rule"]', 
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left center', duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } }
        )

        /* Header */
        gsap.fromTo('[data-ts="header"] > *', 
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%' } }
        )

        /* 🔥 PILIERS FIXÉ ICI (PROBLÈME PRINCIPAL RÉSOLU) */
        gsap.fromTo('[data-ts="pillar"]', 
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.2, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: pillarsEl, start: 'top 80%', once: true } }
        )

        /* CTA */
        gsap.fromTo('[data-ts="cta-wrap"]', 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: '[data-ts="cta-wrap"]', start: 'top 90%' } }
        )

        // sécurité layout
        ScrollTrigger.refresh()
      }, el)
    }

    init()

    return () => {
      ctxRef.current?.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Nos engagements"
    >
      <div className={styles.inner}>

        <div data-ts="rule" className={styles.rule} aria-hidden />

        <div data-ts="header" className={styles.header}>
          <p className={styles.eyebrow}>Nos engagements</p>
          <h2 className={styles.headline}>
            Offrir avec <em>confiance.</em>
          </h2>
        </div>

        {/* PILIERS REF */}
        <div
          ref={pillarsRef}
          data-ts="pillars"
          className={styles.pillars}
          role="list"
        >
          {PILLARS.map((p, i) => (
            <article
              key={p.id}
              data-ts="pillar"
              className={styles.pillar}
              role="listitem"
            >
              <span className={styles.pillarNum} aria-hidden>
                0{i + 1}
              </span>

              <div className={styles.pillarIcon} aria-hidden>
                {p.icon}
              </div>

              <div className={styles.pillarContent}>
                <p className={styles.pillarLabel}>{p.label}</p>
                <p className={styles.pillarValue}>{p.value}</p>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>

              {i < PILLARS.length - 1 && (
                <span className={styles.pillarSep} aria-hidden />
              )}
            </article>
          ))}
        </div>

        <div data-ts="cta-wrap" className={styles.ctaWrap}>
          <div className={styles.ctaRule} aria-hidden />
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            <WhatsAppIcon />
            Commander via WhatsApp
          </a>
          <div className={styles.ctaRule} aria-hidden />
        </div>

      </div>
    </section>
  )
}

/* ─── ICONS ───────────────────────────────────────────── */
function DeliveryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
      <rect x="9" y="11" width="14" height="10" rx="2"/>
      <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    </svg>
  )
}

function PaymentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="6.01" y2="15" strokeWidth="2"/>
      <line x1="10" y1="15" x2="14" y2="15"/>
    </svg>
  )
}

function QualityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12l2.5 2.5L16 9"/>
    </svg>
  )
}

function SpeedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}