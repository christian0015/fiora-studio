'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { getCategories, getBestFlowerForCategory, formatPrice } from '@/libs/data'
import styles from './ExploreFlowers.module.css'

/* ══════════════════════════════════════════════════════════════
   ExploreFlowers
   ══════════════════════════════════════════════════════════════ */
export default function ExploreFlowers() {
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

  /* ── Animation GSAP ───────────────────────────────────────── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger }  = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!sectionRef.current) return

      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-ef="title"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '[data-ef="title"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-ef="eye"]',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '[data-ef="eye"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-ef="card"]',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '[data-ef="grid"]', start: 'top 80%' } }
        )
        gsap.fromTo('[data-ef="line"]',
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: '[data-ef="line"]', start: 'top 85%' } }
        )
      }, sectionRef.current)
    }

    if (cards.length > 0) {
      init()
    }
    return () => ctxRef.current?.revert()
  }, [cards])

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="ef-title">
      {/* ── En-tête ─────────────────────────────────────── */}
      <div className={styles.header}>
        <p className={styles.eyebrow} data-ef="eye">Explorer la collection</p>

        <div className={styles.titleRow}>
          <h2 className={styles.title} id="ef-title" data-ef="title">
            Chaque fleur<br />
            <em>raconte quelque chose</em>
          </h2>
          <Link href="/boutique" className={styles.headerLink}>
            Voir tout
            <span className={styles.headerLinkArrow} aria-hidden>→</span>
          </Link>
        </div>

        <span className={styles.titleLine} data-ef="line" aria-hidden />
      </div>

      {/* ── Grille catégories ───────────────────────────── */}
      <div className={styles.grid} data-ef="grid">
        {cards.map(({ category, flower }, i) => (
          <CategoryCard
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
   CategoryCard
   ══════════════════════════════════════════════════════════════ */
function CategoryCard({ category, flower, index, onNavigate }) {
  const imgSrc = flower?.images?.[0] ?? null
  const isLarge = index === 0

  return (
    <article
      className={`${styles.card} ${isLarge ? styles.cardLarge : ''}`}
      data-ef="card"
      onClick={() => onNavigate(category.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate(category.slug)}
      aria-label={`Explorer ${category.label}`}
    >
      {/* ── Image ──────────────────────────────────────── */}
      <div className={styles.imgWrap}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={flower?.name ?? category.label}
            className={styles.img}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={styles.imgPlaceholder} aria-hidden>
            <span>{category.icon}</span>
          </div>
        )}

        <div className={styles.overlay} aria-hidden />
        <span className={styles.catBadge} aria-hidden>{category.icon}</span>
      </div>

      {/* ── Contenu ────────────────────────────────────── */}
      <div className={styles.content}>
        <div className={styles.contentTop}>
          <p className={styles.catLabel}>{category.label}</p>
          <p className={styles.catDesc}>{category.description}</p>
        </div>

        {/* Fleur mise en avant */}
        {flower && (
          <div className={styles.flowerPreview}>
            <div className={styles.flowerInfo}>
              <span className={styles.flowerName}>{flower.name}</span>
              <span className={styles.flowerPrice}>
                à partir de {formatPrice(flower.price, flower.currency)}
              </span>
            </div>
            <span className={styles.cardArrow} aria-hidden>→</span>
          </div>
        )}

        {/* Si aucune fleur */}
        {!flower && (
          <div className={styles.flowerPreview}>
            <span className={styles.flowerName}>Bientôt disponible</span>
            <span className={styles.cardArrow} aria-hidden>→</span>
          </div>
        )}
      </div>
    </article>
  )
}