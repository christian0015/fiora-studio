'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { allEmotions, siteConfig, formatPrice } from '@/libs/data'
import FlowerCard from '@/components/FlowerCard'
import styles from './OccasionPage.module.css'

/* ═══════════════════════════════════════════════════════════════
   OCCASION PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function OccasionPage({ occasion, flowers = [], otherOccasions }) {
  const { slug, label, longDesc, accent, bgGradient, emotions } = occasion

  const heroRef  = useRef(null)
  const ctxRef   = useRef(null)
  const [sortBy, setSortBy] = useState('popular')
  const [mounted, setMounted] = useState(false)

  // Garantie absolue que "flowers" est traité comme un tableau pour éviter le crash runtime
  const safeFlowers = Array.isArray(flowers) ? flowers : []

  /* ── Tri local ───────────────────────────────────────── */
  const sorted = useMemo(() => {
    const list = [...safeFlowers]
    switch (sortBy) {
      case 'price_asc':  return list.sort((a, b) => a.price - b.price)
      case 'price_desc': return list.sort((a, b) => b.price - a.price)
      case 'rating':     return list.sort((a, b) => b.rating - a.rating)
      default:           return list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    }
  }, [safeFlowers, sortBy])

  /* ── Entrance GSAP ───────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!heroRef.current) return

      ctxRef.current = gsap.context(() => {
        /* Hero */
        gsap.fromTo('[data-op="eyebrow"]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 })
        gsap.fromTo('[data-op="title"]',   { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 })
        gsap.fromTo('[data-op="desc"]',    { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.35 })
        gsap.fromTo('[data-op="metas"]',   { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.48 })

        /* Emotion bars */
        gsap.fromTo('[data-op="ebar"]',
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, stagger: 0.08, duration: 0.8, ease: 'power2.out', delay: 0.55 }
        )

        /* Cards */
        gsap.fromTo('[data-op="card"]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '[data-op="grid"]', start: 'top 82%' } }
        )

        /* Other occasions */
        gsap.fromTo('[data-op="occ"]',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: '[data-op="others"]', start: 'top 88%' } }
        )
      }, heroRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [slug])

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.root} ref={heroRef}>

      {/* ══ HERO ÉMOTIONNEL ══════════════════════════════ */}
      <header className={styles.hero} style={{ '--occ-gradient': bgGradient, '--occ-accent': accent }}>

        {/* Géométrie de fond */}
        <HeroBg accent={accent} />

        <div className={styles.heroInner}>

          {/* Colonne gauche — texte */}
          <div className={styles.heroLeft}>
            <p data-op="eyebrow" className={styles.breadcrumb}>
              <Link href="/" className={styles.breadLink}>Fiora Studio</Link>
              <span className={styles.breadSep}>·</span>
              <Link href="/boutique" className={styles.breadLink}>Boutique</Link>
              <span className={styles.breadSep}>·</span>
              <span>{label}</span>
            </p>

            <h1 data-op="title" className={styles.heroTitle}>
              {label}
            </h1>

            <p data-op="desc" className={styles.heroDesc}>
              {longDesc}
            </p>

            {/* Meta */}
            <div data-op="metas" className={styles.heroMetas}>
              <span className={styles.metaChip}>
                <FlowerIcon />
                {safeFlowers.length} bouquet{safeFlowers.length !== 1 ? 's' : ''}
              </span>
              <span className={styles.metaChip}>
                <TruckIcon />
                Livraison jour même
              </span>
              <span className={styles.metaChip}>
                <StarIcon />
                Casablanca
              </span>
            </div>

            {/* CTA */}
            <div className={styles.heroCtas}>
              <a href="#collection" className={styles.ctaPrimary}>
                Voir la collection
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Bonjour, je cherche un bouquet pour l'occasion : ${label}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaWa}
              >
                <WaIcon /> Conseil personnalisé
              </a>
            </div>
          </div>

          {/* Colonne droite — émotions */}
          <div className={styles.heroRight}>
            <p className={styles.emotionsLabel}>Émotions transmises</p>
            <div className={styles.emotionsList}>
              {emotions && emotions.map(emo => {
                const found = allEmotions.find(e => e.name === emo)
                const pct = 95 - emotions.indexOf(emo) * 12
                return (
                  <div key={emo} className={styles.emotionRow}>
                    <span className={styles.emotionIcon} aria-hidden>
                      {found?.icon ?? '◎'}
                    </span>
                    <span className={styles.emotionName}>{found?.label ?? emo}</span>
                    <span className={styles.emotionTrack}>
                      <span
                        data-op="ebar"
                        className={styles.emotionFill}
                        style={{ width: `${pct}%`, background: accent }}
                      />
                    </span>
                    <span className={styles.emotionPct}>{pct}%</span>
                  </div>
                )
              })}
            </div>

            {/* Citation poétique */}
            <blockquote className={styles.quote}>
              <span className={styles.quoteIcon} style={{ color: accent }}>"</span>
              {getQuote(slug)}
            </blockquote>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden>
          <span className={styles.scrollLine} />
        </div>
      </header>

      {/* ══ COLLECTION ═══════════════════════════════════ */}
      <section id="collection" className={styles.collection}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <h2 className={styles.collectionTitle}>
            La collection <em>{label}</em>
            <span className={styles.collectionCount}>{safeFlowers.length}</span>
          </h2>

          <div className={styles.sortWrap}>
            <label className={styles.sortLabel} htmlFor="occ-sort">Trier</label>
            <select
              id="occ-sort"
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="popular">Populaires</option>
              <option value="price_asc">Prix ↑</option>
              <option value="price_desc">Prix ↓</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>

        {/* Grille */}
        {sorted.length > 0 ? (
          <div data-op="grid" className={styles.grid}>
            {sorted.map((flower, i) => (
              <div key={flower.id || flower.slug} data-op="card">
                <FlowerCard flower={flower} priority={i < 3} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>◎</span>
            <p>Aucun bouquet disponible pour cette occasion.</p>
            <Link href="/boutique" className={styles.emptyLink}>
              Voir toute la collection →
            </Link>
          </div>
        )}
      </section>

      {/* ══ AUTRES OCCASIONS ══════════════════════════════ */}
      {otherOccasions && otherOccasions.length > 0 && (
        <section data-op="others" className={styles.others}>
          <div className={styles.othersHeader}>
            <p className={styles.othersEyebrow}>Explorer</p>
            <h2 className={styles.othersTitle}>D'autres intentions</h2>
          </div>

          <div className={styles.othersGrid}>
            {otherOccasions.slice(0, 5).map(o => (
              <Link
                key={o.slug}
                href={`/occasion/${o.slug}`}
                data-op="occ"
                className={styles.occCard}
                style={{ '--o-accent': o.accent }}
              >
                <span className={styles.occAccentBar} aria-hidden />
                <span className={styles.occLabel}>{o.label}</span>
                <span className={styles.occDesc}>{o.description}</span>
                <span className={styles.occArrow} aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ BANDE CTA WHATSAPP ════════════════════════════ */}
      <section className={styles.waBand}>
        <div className={styles.waBandInner}>
          <div className={styles.waBandText}>
            <p className={styles.waBandEyebrow}>Besoin d'aide ?</p>
            <h3 className={styles.waBandTitle}>
              Nous composons votre bouquet<br />
              <em>sur mesure.</em>
            </h3>
          </div>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Bonjour Fiora, je cherche un bouquet ${label.toLowerCase()} à Casablanca.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBandBtn}
          >
            <WaIcon />
            Parler à un fleuriste
          </a>
        </div>
      </section>
    </div>
  )
}

/* ── Composant géométrie hero ────────────────────────────────── */
function HeroBg({ accent }) {
  return (
    <div className={styles.heroBg} aria-hidden>
      <span className={styles.bgCircle1} style={{ borderColor: `${accent}22` }} />
      <span className={styles.bgCircle2} style={{ borderColor: `${accent}15` }} />
      <span className={styles.bgLineV}   style={{ background: `linear-gradient(to bottom, transparent, ${accent}18, transparent)` }} />
      <span className={styles.bgDot}     style={{ background: accent }} />
      <span className={styles.bgLetter}>FS</span>
    </div>
  )
}

/* ── Citations par occasion ─────────────────────────────────── */
function getQuote(slug) {
  const quotes = {
    romantique:   'Les fleurs sont le langage de ceux qui savent aimer sans chercher leurs mots.',
    anniversaire: 'Chaque bouquet est une date que l\'on offre à la mémoire.',
    mariage:      'Ce que la parole ne peut promettre, la fleur le tient.',
    excuses:      'Le geste sincère précède toujours les mots justes.',
    elegance:     'La beauté n\'a pas besoin d\'occasion. Elle est l\'occasion.',
    entreprise:   'Un détail soigné dit plus long qu\'un grand discours.',
  }
  return quotes[slug] ?? 'Chaque fleur est une intention mise en forme.'
}

/* ── Icônes ──────────────────────────────────────────────────── */
function FlowerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z" opacity=".5"/>
      <path d="M12 14a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z" opacity=".5"/>
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" opacity=".7">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}