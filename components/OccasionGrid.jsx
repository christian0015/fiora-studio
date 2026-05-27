'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { occasions, allEmotions, getOccasionFlowers } from '@/libs/data'
import styles from './OccasionGrid.module.css'

/* ─── Compter les fleurs par occasion (statique) ──────── */
const enriched = occasions.map(occ => ({
  ...occ,
  count: getOccasionFlowers(occ.slug).length,
}))

/* ═══════════════════════════════════════════════════════════
   OCCASION GRID
   ═══════════════════════════════════════════════════════════ */
export default function OccasionGrid() {
  const sectionRef   = useRef(null)
  const ctxRef       = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [mounted, setMounted] = useState(false)

  /* ── Entrance GSAP ──────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap }    = await import('gsap')
      const { ScrollTrigger }    = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      if (!section) return

      ctxRef.current = gsap.context(() => {
        // Eyebrow + headline
        gsap.fromTo('[data-og="header"] > *', 
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '[data-og="header"]', start: 'top 85%' } }
        )

        // Cards staggered
        gsap.fromTo('[data-og="card"]', 
          { y: 44, opacity: 0 },
          { y: 0, opacity: 1, stagger: { amount: 0.55, from: 'start' }, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: '[data-og="grid"]', start: 'top 80%' } }
        )

        // Emotion strip
        gsap.fromTo('[data-og="strip"]', 
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '[data-og="strip"]', start: 'top 88%' } }
        )
      }, section)
    }

    init()
    return () => ctxRef.current?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Explorer par occasion"
    >
      {/* ── Header ────────────────────────────────────── */}
      <div data-og="header" className={styles.header}>
        <p className={`${styles.eyebrow} caption`}>
          Explorer par émotion
        </p>
        <h2 className={styles.headline}>
          <span>Quelle intention</span>
          <em> voulez-vous offrir ?</em>
        </h2>
      </div>

      {/* ── Grid de cartes ────────────────────────────── */}
      <div
        data-og="grid"
        className={styles.grid}
        role="list"
        aria-label="Occasions florales"
      >
        {enriched.map((occ, i) => (
          <OccasionCard
            key={occ.slug}
            occasion={occ}
            index={i}
            isHovered={hovered === occ.slug}
            onHover={setHovered}
          />
        ))}
      </div>

      {/* ── Séparateur géométrique ────────────────────── */}
      <div className={styles.divider} aria-hidden>
        <span className={styles.dividerLine} />
        <span className={styles.dividerDot}  />
        <span className={styles.dividerLine} />
      </div>

      {/* ── Emotion personalizer ──────────────────────── */}
      <EmotionPersonalizer />
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   CARTE OCCASION
   ═══════════════════════════════════════════════════════════ */
function OccasionCard({ occasion, index, isHovered, onHover }) {
  const { slug, label, description, longDesc, accent, emotions, count } = occasion

  /* Position dans la grille — card 0 (romantique) est grande */
  const isHero = index === 0

  return (
    <Link
      data-og="card"
      href={`/occasion/${slug}`}
      className={`${styles.card} ${isHero ? styles.cardHero : ''}`}
      role="listitem"
      aria-label={`Occasion ${label} — ${count} bouquet${count > 1 ? 's' : ''}`}
      onMouseEnter={() => onHover(slug)}
      onMouseLeave={() => onHover(null)}
      style={{ '--accent': accent }}
    >
      {/* Fond coloré subtil */}
      <div
        className={`${styles.cardBg} ${isHovered ? styles.cardBgActive : ''}`}
        aria-hidden
      />

      {/* Ligne accentuée gauche */}
      <span className={styles.cardAccentBar} aria-hidden />

      {/* Numéro */}
      <span className={styles.cardNum} aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Contenu principal */}
      <div className={styles.cardBody}>
        {/* Badge count */}
        <span className={styles.countBadge} aria-label={`${count} bouquets`}>
          {count} bouquet{count > 1 ? 's' : ''}
        </span>

        {/* Label */}
        <h3 className={styles.cardLabel}>{label}</h3>

        {/* Description courte toujours visible */}
        <p className={styles.cardDesc}>{description}</p>

        {/* Description longue — reveal au hover */}
        {longDesc && (
          <p
            className={styles.cardLongDesc}
            aria-hidden={!isHovered}
          >
            {longDesc}
          </p>
        )}

        {/* Émotions associées */}
        <div className={styles.cardEmotions} aria-label="Émotions transmises">
          {emotions.slice(0, isHero ? 4 : 3).map(em => (
            <span key={em} className={styles.emotionPill}>
              {em}
            </span>
          ))}
        </div>
      </div>

      {/* Flèche CTA */}
      <span
        className={`${styles.cardArrow} ${isHovered ? styles.cardArrowActive : ''}`}
        aria-hidden
      >
        →
      </span>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════
   EMOTION PERSONALIZER
   ═══════════════════════════════════════════════════════════ */
function EmotionPersonalizer() {
  const router = useRouter()
  const [selected, setSelected] = useState([])

  const toggle = (name) => {
    setSelected(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : prev.length < 4                    // max 4 émotions
          ? [...prev, name]
          : prev
    )
  }

  const handleFind = () => {
    if (!selected.length) return
    const params = new URLSearchParams({ emotions: selected.join(',') })
    router.push(`/boutique?${params.toString()}`)
  }

  const isEmpty = selected.length === 0

  return (
    <div data-og="strip" className={styles.strip}>
      {/* Texte gauche */}
      <div className={styles.stripLeft}>
        <p className={styles.stripEyebrow}>Personnalisez</p>
        <h3 className={styles.stripHeadline}>
          Quelle émotion<br />
          <em>voulez-vous créer ?</em>
        </h3>
        <p className={styles.stripSub}>
          Sélectionnez jusqu'à 4 émotions — nous trouverons le bouquet qui les incarne.
        </p>
      </div>

      {/* Sélecteur d'émotions */}
      <div className={styles.stripRight}>
        {/* Pills scroll */}
        <div
          className={styles.emotionGrid}
          role="group"
          aria-label="Sélecteur d'émotions"
        >
          {allEmotions.map(({ name, label, icon }) => {
            const active = selected.includes(name)
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                className={`${styles.ePill} ${active ? styles.ePillActive : ''}`}
                aria-pressed={active}
                aria-label={`${active ? 'Désélectionner' : 'Sélectionner'} l'émotion ${label}`}
              >
                <span className={styles.ePillIcon} aria-hidden>{icon}</span>
                {label}
              </button>
            )
          })}
        </div>

        {/* Footer sélecteur */}
        <div className={styles.stripFooter}>
          {/* Émotions sélectionnées résumé */}
          <div className={styles.selectedSummary} aria-live="polite">
            {isEmpty
              ? <span className={styles.summaryEmpty}>Aucune émotion sélectionnée</span>
              : selected.map(n => {
                  const em = allEmotions.find(e => e.name === n)
                  return (
                    <span key={n} className={styles.summaryTag}>
                      {em?.icon} {em?.label}
                      <button
                        className={styles.summaryRemove}
                        onClick={() => toggle(n)}
                        aria-label={`Retirer ${em?.label}`}
                      >
                        ×
                      </button>
                    </span>
                  )
                })
            }
          </div>

          {/* CTA */}
          <button
            className={`${styles.findBtn} ${isEmpty ? styles.findBtnDisabled : ''}`}
            onClick={handleFind}
            disabled={isEmpty}
            aria-disabled={isEmpty}
          >
            {isEmpty ? 'Sélectionnez une émotion' : `Trouver mon bouquet →`}
          </button>
        </div>
      </div>
    </div>
  )
}