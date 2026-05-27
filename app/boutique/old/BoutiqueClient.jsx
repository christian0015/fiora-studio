'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  getFlowers,
  occasions,
  allEmotions,
  filterFlowers,
  formatPrice,
  getTopEmotions,
} from '@/libs/data'
import SearchBar   from '@/components/SearchBar'
import FilterTabs  from '@/components/FilterTabs'
import FlowerCard  from '@/components/FlowerCard'
import styles      from './BoutiqueClient.module.css'

/* ─── Catégories disponibles (déduit du catalogue) ─── */
const CATEGORIES = [
  { slug: '',            label: 'Tout' },
  { slug: 'rose',        label: 'Roses' },
  { slug: 'pivoine',     label: 'Pivoines' },
  { slug: 'tulipe',      label: 'Tulipes' },
  { slug: 'orchidee',    label: 'Orchidées' },
  { slug: 'composition', label: 'Compositions' },
]

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Populaires' },
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating',     label: 'Mieux notés' },
]

const PRICE_MAX = 2500

/* ═══════════════════════════════════════════════════════════ */
export default function BoutiqueClient() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const ctxRef       = useRef(null)
  const heroRef      = useRef(null)
  const gridRef      = useRef(null)
  const [mounted, setMounted] = useState(false)

  /* ── State ────────────────────────────────────────── */
  const [query,       setQuery]       = useState(searchParams.get('q')        ?? '')
  const [occasion,    setOccasion]    = useState(searchParams.get('occasion') ?? '')
  const [category,    setCategory]    = useState(searchParams.get('cat')      ?? '')
  const [sortBy,      setSortBy]      = useState('popular')
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [priceRange,  setPriceRange]  = useState([0, PRICE_MAX])
  const [emotions,    setEmotions]    = useState(() => {
    const raw = searchParams.get('emotions')
    return raw ? raw.split(',').filter(Boolean) : []
  })
  const [emotionPct,  setEmotionPct]  = useState(50) // seuil minimum %
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  /* ── Résultats filtrés ────────────────────────────── */
  const results = useMemo(() => {
    let list = filterFlowers({
      query,
      occasion,
      category,
      minPrice:    priceRange[0],
      maxPrice:    priceRange[1],
      premiumOnly,
      sortBy,
    })

    // Filtre par émotions multiples avec seuil %
    if (emotions.length > 0) {
      list = list.filter(f =>
        emotions.every(emo =>
          f.emotions.some(e => e.name === emo && e.percentage >= emotionPct)
        )
      )
    }

    return list
  }, [query, occasion, category, premiumOnly, priceRange, sortBy, emotions, emotionPct])

  /* ── Sync URL ─────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams()
    if (query)              params.set('q',        query)
    if (occasion)           params.set('occasion', occasion)
    if (category)           params.set('cat',      category)
    if (emotions.length)    params.set('emotions', emotions.join(','))
    const qs = params.toString()
    router.replace(qs ? `/boutique?${qs}` : '/boutique', { scroll: false })
  }, [query, occasion, category, emotions, router])

  /* ── Entrance animation ───────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      if (!heroRef.current) return

      ctxRef.current = gsap.context(() => {
        // Animate from their current visible state (not from hidden)
        gsap.fromTo('[data-b="hero"] > *', 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
        )
      }, heroRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  /* ── Animate results change ───────────────────────── */
  const animateGrid = useCallback(async () => {
    const { default: gsap } = await import('gsap')
    const cards = gridRef.current?.querySelectorAll('[data-b="card"]')
    if (!cards?.length) return
    gsap.fromTo(cards,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: { amount: 0.35, from: 'start' }, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
    )
  }, [])

  useEffect(() => {
    if (mounted) animateGrid()
  }, [results, animateGrid, mounted])

  /* ── Helpers ──────────────────────────────────────── */
  const resetAll = () => {
    setQuery(''); setOccasion(''); setCategory('')
    setPremiumOnly(false); setPriceRange([0, PRICE_MAX])
    setSortBy('popular'); setEmotions([]); setEmotionPct(50)
  }

  const toggleEmotion = (name) =>
    setEmotions(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : prev.length < 5 ? [...prev, name] : prev
    )

  const hasFilters =
    query || occasion || category || premiumOnly ||
    priceRange[0] > 0 || priceRange[1] < PRICE_MAX || emotions.length

  /* ─────────────────────────────────────────────────── */
  return (
    <div className={styles.root}>

      {/* ══ HERO BANDEAU ══════════════════════════════ */}
      <header ref={heroRef} className={styles.hero} data-b="hero">
        <div className={styles.heroBg} aria-hidden>
          <span className={styles.heroLine1} />
          <span className={styles.heroLine2} />
          <span className={styles.heroCircle} />
        </div>

        <div className={styles.heroContent}>
          <p className={`${styles.eyebrow} caption`}>
            {results.length} bouquet{results.length !== 1 ? 's' : ''} disponibles
          </p>
          <h1 className={styles.heroTitle}>
            Notre <em>collection</em>
          </h1>
          <p className={styles.heroSub}>
            Compositions d'exception, préparées à la main.<br />
            Livrées le jour même à Casablanca.
          </p>
        </div>

        {/* Barre de recherche principale */}
        <div className={styles.heroSearch}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Chercher une fleur, une émotion, une couleur…"
          />
        </div>
      </header>

      {/* ══ BODY : SIDEBAR + GRILLE ═══════════════════ */}
      <div className={styles.body}>

        {/* ─── Sidebar filtres ────────────────────── */}
        <aside
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
          aria-label="Filtres"
        >
          {/* Overlay mobile */}
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />

          <div className={styles.sidebarInner}>
            {/* En-tête sidebar */}
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>Filtres</span>
              {hasFilters && (
                <button className={styles.resetBtn} onClick={resetAll}>
                  Tout effacer
                </button>
              )}
              <button
                className={styles.closeBtn}
                onClick={() => setSidebarOpen(false)}
                aria-label="Fermer les filtres"
              >
                ✕
              </button>
            </div>

            {/* ── Occasion ──────────────────────── */}
            <FilterBlock label="Occasion">
              <div className={styles.pillGroup}>
                {[{ slug: '', label: 'Toutes' }, ...occasions].map(o => (
                  <button
                    key={o.slug}
                    className={`${styles.pill} ${occasion === o.slug ? styles.pillActive : ''}`}
                    onClick={() => setOccasion(o.slug)}
                    aria-pressed={occasion === o.slug}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </FilterBlock>

            {/* ── Catégorie ─────────────────────── */}
            <FilterBlock label="Catégorie">
              <div className={styles.pillGroup}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.slug}
                    className={`${styles.pill} ${category === c.slug ? styles.pillActive : ''}`}
                    onClick={() => setCategory(c.slug)}
                    aria-pressed={category === c.slug}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </FilterBlock>

            {/* ── Émotions ──────────────────────── */}
            <FilterBlock label="Émotions transmises">
              <p className={styles.filterHint}>
                Sélectionnez jusqu'à 5 émotions
              </p>
              <div className={styles.emotionGrid}>
                {allEmotions.map(({ name, label, icon }) => {
                  const active = emotions.includes(name)
                  return (
                    <button
                      key={name}
                      className={`${styles.ePill} ${active ? styles.ePillActive : ''}`}
                      onClick={() => toggleEmotion(name)}
                      aria-pressed={active}
                    >
                      <span className={styles.ePillIcon} aria-hidden>{icon}</span>
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Seuil % — visible si au moins une émotion sélectionnée */}
              {emotions.length > 0 && (
                <div className={styles.thresholdWrap}>
                  <div className={styles.thresholdHeader}>
                    <span className={styles.thresholdLabel}>
                      Intensité minimale
                    </span>
                    <span className={styles.thresholdValue}>
                      {emotionPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={90}
                    step={5}
                    value={emotionPct}
                    onChange={e => setEmotionPct(Number(e.target.value))}
                    className={styles.rangeInput}
                    aria-label={`Intensité minimale : ${emotionPct}%`}
                  />
                  <div className={styles.thresholdHints}>
                    <span>Subtil</span>
                    <span>Intense</span>
                  </div>
                </div>
              )}
            </FilterBlock>

            {/* ── Budget ────────────────────────── */}
            <FilterBlock label="Budget (MAD)">
              <div className={styles.priceDisplay}>
                <span>{priceRange[0]} MAD</span>
                <span>—</span>
                <span>{priceRange[1] >= PRICE_MAX ? '2500+ MAD' : `${priceRange[1]} MAD`}</span>
              </div>
              <div className={styles.dualRange}>
                <input
                  type="range"
                  min={0}
                  max={PRICE_MAX}
                  step={50}
                  value={priceRange[0]}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v < priceRange[1]) setPriceRange([v, priceRange[1]])
                  }}
                  className={styles.rangeInput}
                  aria-label="Prix minimum"
                />
                <input
                  type="range"
                  min={0}
                  max={PRICE_MAX}
                  step={50}
                  value={priceRange[1]}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v > priceRange[0]) setPriceRange([priceRange[0], v])
                  }}
                  className={styles.rangeInput}
                  aria-label="Prix maximum"
                />
              </div>
            </FilterBlock>

            {/* ── Premium ───────────────────────── */}
            <FilterBlock label="Qualité">
              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Premium uniquement</span>
                <button
                  role="switch"
                  aria-checked={premiumOnly}
                  className={`${styles.toggle} ${premiumOnly ? styles.toggleOn : ''}`}
                  onClick={() => setPremiumOnly(p => !p)}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </label>
            </FilterBlock>
          </div>
        </aside>

        {/* ─── Zone principale ────────────────────── */}
        <main className={styles.main}>

          {/* ── Toolbar ──────────────────────────── */}
          <div className={styles.toolbar}>
            {/* Filtre mobile trigger */}
            <button
              className={styles.filterTrigger}
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-label="Ouvrir les filtres"
            >
              <FilterIcon />
              Filtres
              {hasFilters && <span className={styles.filterBadge} />}
            </button>

            {/* Tabs catégorie (desktop) */}
            <div className={styles.catTabs}>
              <FilterTabs
                tabs={CATEGORIES}
                active={category}
                onChange={setCategory}
              />
            </div>

            {/* Tri */}
            <div className={styles.sortWrap}>
              <label className={styles.sortLabel} htmlFor="sort-select">
                Trier par
              </label>
              <select
                id="sort-select"
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Active filters résumé ─────────────── */}
          {hasFilters && (
            <div className={styles.activeFilters} aria-live="polite">
              {query && (
                <ActiveChip label={`"${query}"`} onRemove={() => setQuery('')} />
              )}
              {occasion && (
                <ActiveChip
                  label={occasions.find(o => o.slug === occasion)?.label}
                  onRemove={() => setOccasion('')}
                />
              )}
              {category && (
                <ActiveChip
                  label={CATEGORIES.find(c => c.slug === category)?.label}
                  onRemove={() => setCategory('')}
                />
              )}
              {premiumOnly && (
                <ActiveChip label="Premium" onRemove={() => setPremiumOnly(false)} />
              )}
              {emotions.map(emo => {
                const em = allEmotions.find(e => e.name === emo)
                return (
                  <ActiveChip
                    key={emo}
                    label={`${em?.icon} ${em?.label}`}
                    onRemove={() => toggleEmotion(emo)}
                  />
                )
              })}
              <button className={styles.clearAll} onClick={resetAll}>
                Effacer tout
              </button>
            </div>
          )}

          {/* ── Grille produits ──────────────────── */}
          {results.length > 0 ? (
            <div ref={gridRef} className={styles.grid}>
              {results.map((flower, i) => (
                <div key={flower.id} data-b="card">
                  <FlowerCard flower={flower} priority={i < 4} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState onReset={resetAll} />
          )}
        </main>
      </div>
    </div>
  )
}

/* ══ Sous-composants locaux ════════════════════════════════ */

function FilterBlock({ label, children }) {
  return (
    <div className={styles.filterBlock}>
      <p className={styles.filterBlockLabel}>{label}</p>
      {children}
    </div>
  )
}

function ActiveChip({ label, onRemove }) {
  return (
    <span className={styles.activeChip}>
      {label}
      <button
        onClick={onRemove}
        className={styles.chipRemove}
        aria-label={`Retirer le filtre ${label}`}
      >
        ×
      </button>
    </span>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden>◎</span>
      <h3 className={styles.emptyTitle}>Aucun bouquet trouvé</h3>
      <p className={styles.emptySub}>
        Ajustez vos filtres ou explorez toute notre collection.
      </p>
      <button className={styles.emptyBtn} onClick={onReset}>
        Voir tous les bouquets
      </button>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  )
}