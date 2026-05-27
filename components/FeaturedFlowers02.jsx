'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getPopularFlowers } from '@/libs/data'
import FlowerCard from '@/components/FlowerCard'
import styles from './FeaturedFlowers02.module.css'

/* ═══════════════════════════════════════════════════════════════
   FEATURED FLOWERS  —  Fleurs populaires
   Grille respirante, grandes images, prix discret.
   ═══════════════════════════════════════════════════════════════ */
export default function FeaturedFlowers() {
  const sectionRef = useRef(null)
  const ctxRef     = useRef(null)
  const [flowers, setFlowers] = useState([]) // État local pour stocker les fleurs

  // ── Chargement des données asynchrones ───────────────────────
  useEffect(() => {
    async function loadFlowers() {
      try {
        const data = await getPopularFlowers(6)
        setFlowers(data || [])
      } catch (err) {
        console.error("Erreur lors du chargement des fleurs populaires:", err)
      }
    }
    loadFlowers()
  }, [])

  /* ── GSAP entrance — Se déclenche quand les données sont là ── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const section = sectionRef.current
      if (!section) return

      ctxRef.current = gsap.context(() => {
        /* Header */
        gsap.from('[data-ff="header"] > *', {
          y: 24, opacity: 0, stagger: 0.1, duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ff="header"]', start: 'top 87%' },
        })

        /* Cards — décalage naturel */
        gsap.from('[data-ff="card"]', {
          y: 48, opacity: 0,
          stagger: { amount: 0.6, from: 'start' },
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ff="grid"]', start: 'top 82%' },
        })

        /* CTA bas */
        gsap.from('[data-ff="cta"]', {
          y: 20, opacity: 0, duration: 0.65, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ff="cta"]', start: 'top 92%' },
        })
      }, section)
    }

    if (flowers.length > 0) {
      init()
    }
    return () => ctxRef.current?.revert()
  }, [flowers])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Fleurs populaires"
    >
      {/* ── Ligne décorative haute ──────────────────────────── */}
      <div className={styles.topRule} aria-hidden>
        <span className={styles.ruleLeft}  />
        <span className={styles.ruleDot}   />
        <span className={styles.ruleRight} />
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <div data-ff="header" className={styles.header}>
        <p className={`${styles.eyebrow} caption`}>
          Les plus appréciés
        </p>
        <h2 className={styles.headline}>
          <span>Bouquets</span>
          <em> qui marquent.</em>
        </h2>
        <p className={styles.subline}>
          Chaque composition est préparée le matin même, livrée le jour de votre choix.
        </p>
      </div>

      {/* ── Grille ──────────────────────────────────────────── */}
      <div
        data-ff="grid"
        className={styles.grid}
        role="list"
        aria-label="Sélection de bouquets"
      >
        {flowers.map((flower, i) => (
          <div
            key={flower.id || flower._id || i}
            data-ff="card"
            role="listitem"
            className={`${styles.cardWrap} ${i === 0 ? styles.cardWrapFeatured : ''}`}
          >
            <FlowerCard flower={flower} priority={i < 2} featured={i === 0} />
          </div>
        ))}
      </div>

      {/* ── CTA bas ──────────────────────────────────────────── */}
      <div data-ff="cta" className={styles.ctaRow}>
        <Link href="/boutique" className={styles.ctaLink}>
          Voir toute la collection
          <span className={styles.ctaArrow} aria-hidden>→</span>
        </Link>
      </div>
    </section>
  )
}