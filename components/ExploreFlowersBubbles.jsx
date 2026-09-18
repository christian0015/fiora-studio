'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getCategories, getBestFlowerForCategory, formatPrice } from '@/libs/data'
import styles from './ExploreFlowersBubbles.module.css'

/* Hauteur du cluster mobile et rayon de base d'une bulle.
   Garder BUBBLE_HEIGHT synchro avec .cluster { height } dans le CSS. */
const BUBBLE_HEIGHT = 340
const BUBBLE_BOX = 116 // empreinte (largeur/hauteur logique) utilisée pour l'anti-chevauchement

/* ══════════════════════════════════════════════════════════════
   Pack circulaire simple : spirale dorée + relaxation
   anti-chevauchement + légère attraction vers le centre.
   Calculé une fois (et au resize), donne des positions stables
   et regroupées sans se chevaucher — pas de dépendance externe.
   ══════════════════════════════════════════════════════════════ */
function computeClusterLayout(count, width, height) {
  const cx = width / 2
  const cy = height / 2 - 12
  const golden = 137.50776405003785 * (Math.PI / 180)
  const positions = []

  for (let i = 0; i < count; i++) {
    const r = 12 * Math.sqrt(i + 1)
    const theta = i * golden
    positions.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) })
  }

  const minDist = BUBBLE_BOX * 0.92
  const pad = BUBBLE_BOX / 2 + 6

  for (let iter = 0; iter < 260; iter++) {
    for (let i = 0; i < count; i++) {
      positions[i].x += (cx - positions[i].x) * 0.012
      positions[i].y += (cy - positions[i].y) * 0.012
    }
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const dist = Math.hypot(dx, dy) || 0.001
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2
          const ux = dx / dist, uy = dy / dist
          positions[i].x -= ux * overlap
          positions[i].y -= uy * overlap
          positions[j].x += ux * overlap
          positions[j].y += uy * overlap
        }
      }
    }
    for (let i = 0; i < count; i++) {
      positions[i].x = Math.min(Math.max(positions[i].x, pad), width - pad)
      positions[i].y = Math.min(Math.max(positions[i].y, pad), height - pad - 30)
    }
  }
  return positions
}

/* ══════════════════════════════════════════════════════════════
   ExploreFlowersBubbles
   Desktop : cartes classiques, identiques à ExploreFlowers.
   Mobile (≤640px) : cluster de bulles organiques, regroupées au
   centre, chacune glissable au doigt et qui revient à sa place.
   Fonctionnalités inchangées : résolution async de la meilleure
   fleur par catégorie, navigation boutique filtrée, lien "Voir tout".
   ══════════════════════════════════════════════════════════════ */
export default function ExploreFlowersBubbles() {
  const sectionRef = useRef(null)
  const ctxRef = useRef(null)
  const clusterRef = useRef(null)
  const [cards, setCards] = useState([])
  const [positions, setPositions] = useState([])

  const categories = getCategories()

  // ── Résolution asynchrone de la meilleure fleur par catégorie ──
  useEffect(() => {
    async function loadBestFlowers() {
      try {
        const unresolvedCards = categories.map(async (cat) => {
          const bestFlower = await getBestFlowerForCategory(cat.slug)
          return { category: cat, flower: bestFlower }
        })
        setCards(await Promise.all(unresolvedCards))
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

  /* ── Calcul du cluster mobile (rejoué au resize) ──────────── */
  useEffect(() => {
    if (cards.length === 0) return
    function recompute() {
      const width = clusterRef.current?.clientWidth || Math.min(window.innerWidth - 40, 480)
      setPositions(computeClusterLayout(cards.length, width, BUBBLE_HEIGHT))
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [cards])

  /* ── Animation GSAP (titre + cartes desktop) ──────────────── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
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
        gsap.fromTo('[data-efb="card"]',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '[data-efb="grid"]', start: 'top 80%' } }
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

      {/* ── Desktop : grille de cartes classiques (identique à ExploreFlowers) ── */}
      <div className={styles.grid} data-efb="grid">
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

      {/* ── Mobile : cluster de bulles organiques ─────────── */}
      <div className={styles.cluster} ref={clusterRef}>
        {cards.map(({ category, flower }, i) => {
          const pos = positions[i] || { x: BUBBLE_HEIGHT / 2, y: BUBBLE_HEIGHT / 2 }
          return (
            <CategoryBubble
              key={category.slug}
              category={category}
              flower={flower}
              index={i}
              x={pos.x}
              y={pos.y}
              onNavigate={goToCategory}
            />
          )
        })}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   CategoryCard — desktop, identique à ExploreFlowers
   ══════════════════════════════════════════════════════════════ */
function CategoryCard({ category, flower, index, onNavigate }) {
  const imgSrc = flower?.images?.[0] ?? null
  const isLarge = index === 0

  return (
    <article
      className={`${styles.card} ${isLarge ? styles.cardLarge : ''}`}
      data-efb="card"
      onClick={() => onNavigate(category.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate(category.slug)}
      aria-label={`Explorer ${category.label}`}
    >
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

      <div className={styles.content}>
        <div className={styles.contentTop}>
          <p className={styles.catLabel}>{category.label}</p>
          <p className={styles.catDesc}>{category.description}</p>
        </div>

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

/* ══════════════════════════════════════════════════════════════
   CategoryBubble — mobile
   Forme organique (clip-path animé, différente par bulle),
   glissable au doigt (Framer Motion) et qui revient à sa place
   au relâchement (dragSnapToOrigin).
   ══════════════════════════════════════════════════════════════ */
function CategoryBubble({ category, flower, index, x, y, onNavigate }) {
  const imgSrc = flower?.images?.[0] ?? null
  const blobClass = styles[`blob${(index % 5) + 1}`]

  return (
    <motion.div
      className={styles.bubble}
      style={{ left: x, top: y }}
      drag
      dragMomentum={false}
      dragSnapToOrigin
      dragTransition={{ bounceStiffness: 500, bounceDamping: 24 }}
      whileTap={{ scale: 0.94 }}
      onTap={() => onNavigate(category.slug)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate(category.slug)}
      aria-label={`Explorer ${category.label}`}
    >
      <span
        className={`${styles.circle} ${blobClass}`}
        style={{ animationDelay: `${-(index * 1.3)}s`, animationDuration: `${7 + (index % 4)}s` }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={flower?.name ?? category.label}
            className={styles.circleImg}
            loading={index < 6 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ) : (
          <span className={styles.circlePlaceholder} aria-hidden>{category.icon}</span>
        )}
      </span>

      <span className={styles.bubbleLabel}>{category.label}</span>
      <span className={styles.bubblePrice}>
        {flower ? `dès ${formatPrice(flower.price, flower.currency)}` : 'Bientôt'}
      </span>
    </motion.div>
  )
}