'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getCategories, getBestFlowerForCategory, formatPrice } from '@/libs/data'
import styles from './ExploreFlowersBubbles.module.css'

/* ══════════════════════════════════════════════════════════════
   ExploreFlowersBubbles
   Version "coup d'œil" façon Glovo : chaque catégorie = une bulle
   (image + nom). Pensée pour montrer toutes les catégories d'un
   seul regard, sans distinction de taille ni scroll horizontal
   imposé — la ligne de bulles wrap sur plusieurs rangées.
   Garde exactement les mêmes fonctionnalités que ExploreFlowers :
   résolution async de la meilleure fleur par catégorie, navigation
   boutique filtrée, lien "Voir tout", animation d'entrée.
   ══════════════════════════════════════════════════════════════ */
export default function ExploreFlowersBubbles() {
  const sectionRef = useRef(null)
  const ctxRef  = useRef(null)
  const [cards, setCards] = useState([]) // Contiendra l'association catégorie + fleur résolue

  const categories = getCategories()

  // ── Résolution asynchrone de la meilleure fleur par catégorie ──
  useEffect(() => {
    async function loadBestFlowers() {
      try {
        const unresolvedCards = categories.map(async (cat) => {
          const bestFlower = await getBestFlowerForCategory(cat.slug)
          return {
            category: cat,
            flower: bestFlower,
          }
        })
        const resolvedCards = await Promise.all(unresolvedCards)
        setCards(resolvedCards)
      } catch (err) {
        console.error("Erreur lors de la récupération des meilleures fleurs:", err)
      }
    }
    loadBestFlowers()
  }, [])

  /* ── Navigation boutique avec filtre catégorie ────────────── */
  const goToCategory = useCallback((categorySlug) => {
    const params = new URLSearchParams()
    params.set('cat', categorySlug)
    window.location.href = `/boutique?${params.toString()}`
  }, [])

  /* ── Animation GSAP (légère, adaptée aux bulles) ──────────── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!sectionRef.current) return

      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-efb="title"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '[data-efb="title"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-efb="eye"]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '[data-efb="eye"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-efb="bubble"]',
          { y: 24, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, stagger: { amount: 0.45, from: 'start' }, duration: 0.55, ease: 'power3.out', scrollTrigger: { trigger: '[data-efb="row"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-efb="line"]',
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: '[data-efb="line"]', start: 'top 85%' } }
        )
      }, sectionRef.current)
    }

    if (cards.length > 0) {
      init()
    }
    return () => ctxRef.current?.revert()
  }, [cards])

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="efb-title">
      {/* ── En-tête ─────────────────────────────────────── */}
      <div className={styles.header}>
        <p className={styles.eyebrow} data-efb="eye">Explorer la collection</p>

        <div className={styles.titleRow}>
          <h2 className={styles.title} id="efb-title" data-efb="title">
            Chaque fleur<br />
            <em>raconte quelque chose</em>
          </h2>
          <Link href="/boutique" className={styles.headerLink}>
            Voir tout
            <span className={styles.headerLinkArrow} aria-hidden>→</span>
          </Link>
        </div>

        <span className={styles.titleLine} data-efb="line" aria-hidden />
      </div>

      {/* ── Ligne de bulles catégories ─────────────────── */}
      <div className={styles.row} data-efb="row">
        {cards.map(({ category, flower }, i) => (
          <CategoryBubble
            key={category.slug}
            category={category}
            flower={flower}
            index={i}
            onNavigate={goToCategory}
          />
        ))}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   CategoryBubble
   ══════════════════════════════════════════════════════════════ */
function CategoryBubble({ category, flower, index, onNavigate }) {
  const imgSrc = flower?.images?.[0] ?? null

  return (
    <button
      type="button"
      className={styles.bubble}
      data-efb="bubble"
      onClick={() => onNavigate(category.slug)}
      aria-label={`Explorer ${category.label}`}
    >
      {/* ── Cercle image ──────────────────────────────── */}
      <span className={styles.circle}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={flower?.name ?? category.label}
            className={styles.circleImg}
            loading={index < 6 ? 'eager' : 'lazy'}
          />
        ) : (
          <span className={styles.circlePlaceholder} aria-hidden>
            {category.icon}
          </span>
        )}
      </span>

      {/* ── Nom de la catégorie ───────────────────────── */}
      <span className={styles.bubbleLabel}>{category.label}</span>

      {/* ── Prix de la fleur phare (optionnel, discret) ── */}
      {flower ? (
        <span className={styles.bubblePrice}>
          dès {formatPrice(flower.price, flower.currency)}
        </span>
      ) : (
        <span className={styles.bubblePrice}>Bientôt</span>
      )}
    </button>
  )
}