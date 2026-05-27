'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  occasions,
  allEmotions,
  filterFlowers,
  getCategories,
  getSubcategories,
} from '@/libs/data'
import SearchBar  from '@/components/SearchBar'
import FlowerCard from '@/components/FlowerCard'
import styles     from './BoutiqueClient.module.css'

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Populaires'      },
  { value: 'price_asc',  label: 'Prix croissant'  },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating',     label: 'Mieux notés'     },
]
const PRICE_MAX = 2500
const PER_PAGE  = 12

/* ═══════════════════════════════════════════════════════════ */
export default function BoutiqueClient() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const ctxRef       = useRef(null)
  const heroRef      = useRef(null)
  const gridRef      = useRef(null)
  const stickyRef    = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  /* ── State filtres ────────────────────────────────────── */
  const [query,       setQuery]       = useState(searchParams.get('q')        ?? '')
  const [occasion,    setOccasion]    = useState(searchParams.get('occasion') ?? '')
  const [category,    setCategory]    = useState(searchParams.get('cat')      ?? '')
  const [subcategory, setSubcategory] = useState(searchParams.get('sub')      ?? '')
  const [sortBy,      setSortBy]      = useState('popular')
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [priceRange,  setPriceRange]  = useState([0, PRICE_MAX])
  const [emotions,    setEmotions]    = useState(() => {
    const raw = searchParams.get('emotions')
    return raw ? raw.split(',').filter(Boolean) : []
  })
  const [emotionPct,  setEmotionPct]  = useState(50)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page,        setPage]        = useState(1)

  /* ── Données catalogue chargées depuis l'API ───────────── */
  const [apiFlowers, setApiFlowers] = useState([])

  const allCategories  = useMemo(() => getCategories(), [])
  const subcategories  = useMemo(
    () => (category ? getSubcategories(category) : []),
    [category]
  )

  /* ── Fetch des données asynchrones (API MongoDB) ───────── */
  useEffect(() => {
    let isSubscribed = true
    
    async function fetchData() {
      setLoading(true)
      try {
        const data = await filterFlowers({
          query,
          occasion,
          category,
          subcategory,
          minPrice:    priceRange[0],
          maxPrice:    priceRange[1],
          premiumOnly,
          sortBy,
        })
        
        if (isSubscribed) {
          setApiFlowers(data || [])
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des fleurs:", err)
      } finally {
        if (isSubscribed) setLoading(false)
      }
    }

    fetchData()
    
    return () => {
      isSubscribed = false
    }
  }, [query, occasion, category, subcategory, premiumOnly, priceRange, sortBy])

  /* ── Filtrage local additionnel (Émotions) ────────────── */
  const allResults = useMemo(() => {
    let list = [...apiFlowers]

    if (emotions.length > 0) {
      list = list.filter(f =>
        emotions.every(emo =>
          f.emotions?.some(e => e.name === emo && e.percentage >= emotionPct)
        )
      )
    }
    return list
  }, [apiFlowers, emotions, emotionPct])

  const totalPages = Math.ceil((allResults?.length ?? 0) / PER_PAGE)
  const results    = useMemo(
    () => (allResults || []).slice(0, page * PER_PAGE),
    [allResults, page]
  )

  /* ── Sync URL ─────────────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams()
    if (query)           params.set('q',        query)
    if (occasion)        params.set('occasion', occasion)
    if (category)        params.set('cat',      category)
    if (subcategory)     params.set('sub',      subcategory)
    if (emotions.length) params.set('emotions', emotions.join(','))
    const qs = params.toString()
    router.replace(qs ? `/boutique?${qs}` : '/boutique', { scroll: false })
  }, [query, occasion, category, subcategory, emotions, router])

  /* ── Reset page quand les filtres changent ─────────────── */
  useEffect(() => { setPage(1) }, [query, occasion, category, subcategory, premiumOnly, priceRange, sortBy, emotions, emotionPct])

  /* ── Quand on change catégorie, vider la sous-catégorie ── */
  const handleCategoryChange = useCallback((slug) => {
    setCategory(slug)
    setSubcategory('')
  }, [])

  /* ── GSAP entrance ────────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      if (!heroRef.current) return
      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-b="hero"] > *',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
        )
      }, heroRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  const animateGrid = useCallback(async () => {
    const { default: gsap } = await import('gsap')
    const cards = gridRef.current?.querySelectorAll('[data-b="card"]')
    if (!cards?.length) return
    gsap.fromTo(cards,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: { amount: 0.35 }, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
    )
  }, [])

  useEffect(() => {
    if (mounted && !loading) animateGrid()
  }, [results, animateGrid, mounted, loading])

  /* ── Sticky header mobile — IntersectionObserver ──────── */
  useEffect(() => {
    if (!stickyRef.current) return
    const sentinel = document.getElementById('boutique-sentinel')
    if (!sentinel) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        stickyRef.current?.classList.toggle(styles.stickyVisible, !entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [mounted])

  /* ── Helpers ──────────────────────────────────────────── */
  const resetAll = () => {
    setQuery(''); setOccasion(''); setCategory(''); setSubcategory('')
    setPremiumOnly(false); setPriceRange([0, PRICE_MAX])
    setSortBy('popular'); setEmotions([]); setEmotionPct(50)
  }

  const toggleEmotion = (name) =>
    setEmotions(prev =>
      prev.includes(name) ? prev.filter(n => n !== name)
        : prev.length < 5 ? [...prev, name] : prev
    )

  const hasFilters =
    query || occasion || category || subcategory || premiumOnly ||
    priceRange[0] > 0 || priceRange[1] < PRICE_MAX || emotions.length

  /* ── Label catégorie active (pour sticky) ─────────────── */
  const activeCatLabel = category
    ? allCategories.find(c => c.slug === category)?.label ?? ''
    : ''

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.root}>

      {/* ══ Sentinel (observer pour sticky) ══════════════ */}
      <div id="boutique-sentinel" style={{ height: 1 }} />

      {/* ══ STICKY MOBILE — catégorie + sous-catégorie ══ */}
      <div ref={stickyRef} className={styles.stickyBar} aria-hidden={!activeCatLabel}>
        <div className={styles.stickyInner}>
          <button
            className={styles.stickyFilter}
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir les filtres"
          >
            <FilterIcon />
            {hasFilters && <span className={styles.filterBadge} />}
          </button>

          <div className={styles.stickyCats} role="list">
            <button
              role="listitem"
              className={`${styles.stickyCat} ${!category ? styles.stickyCatActive : ''}`}
              onClick={() => handleCategoryChange('')}
            >
              Tout
            </button>
            {allCategories.map(c => (
              <button
                key={c.slug}
                role="listitem"
                className={`${styles.stickyCat} ${category === c.slug ? styles.stickyCatActive : ''}`}
                onClick={() => handleCategoryChange(c.slug)}
              >
                <span className={styles.stickyCatIcon} aria-hidden>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {subcategories.length > 0 && (
            <div className={styles.stickySubs} role="list">
              <button
                role="listitem"
                className={`${styles.stickySub} ${!subcategory ? styles.stickySubActive : ''}`}
                onClick={() => setSubcategory('')}
              >
                Tous
              </button>
              {subcategories.map(s => (
                <button
                  key={s.slug}
                  role="listitem"
                  className={`${styles.stickySub} ${subcategory === s.slug ? styles.stickySubActive : ''}`}
                  onClick={() => setSubcategory(s.slug)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ HERO ════════════════════════════════════════ */}
      <header ref={heroRef} className={styles.hero} data-b="hero">
        <div className={styles.heroBg} aria-hidden>
          <span className={styles.heroLine1} />
          <span className={styles.heroLine2} />
          <span className={styles.heroCircle} />
        </div>
        <div className={styles.heroContent}>
          <p className={`${styles.eyebrow} caption`}>
            {loading ? '...' : allResults.length} bouquet{allResults.length !== 1 ? 's' : ''} disponible{allResults.length !== 1 ? 's' : ''}
          </p>
          <h1 className={styles.heroTitle}>
            Notre <em>collection</em>
          </h1>
          <p className={styles.heroSub}>
            Compositions d'exception, préparées à la main.<br />
            Livrées le jour même à Casablanca.
          </p>
        </div>
        <div className={styles.heroSearch}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Chercher une fleur, une émotion, une couleur…"
          />
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════ */}
      <div className={styles.body}>

        {/* ─── Sidebar ─────────────────────────────── */}
        <aside
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
          aria-label="Filtres"
        >
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className={styles.sidebarInner}>

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
                aria-label="Fermer"
              >✕</button>
            </div>

            {/* ── Catégorie ─────────────────────────── */}
            <FilterBlock label="Catégorie">
              <div className={styles.pillGroup}>
                <button
                  className={`${styles.pill} ${!category ? styles.pillActive : ''}`}
                  onClick={() => handleCategoryChange('')}
                  aria-pressed={!category}
                >
                  Tout
                </button>
                {allCategories.map(c => (
                  <button
                    key={c.slug}
                    className={`${styles.pill} ${category === c.slug ? styles.pillActive : ''}`}
                    onClick={() => handleCategoryChange(c.slug)}
                    aria-pressed={category === c.slug}
                  >
                    <span className={styles.pillIcon} aria-hidden>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {subcategories.length > 0 && (
                <div className={styles.subBlock}>
                  <p className={styles.subBlockLabel}>Format</p>
                  <div className={styles.pillGroup}>
                    <button
                      className={`${styles.pillSub} ${!subcategory ? styles.pillSubActive : ''}`}
                      onClick={() => setSubcategory('')}
                      aria-pressed={!subcategory}
                    >
                      Tous
                    </button>
                    {subcategories.map(s => (
                      <button
                        key={s.slug}
                        className={`${styles.pillSub} ${subcategory === s.slug ? styles.pillSubActive : ''}`}
                        onClick={() => setSubcategory(s.slug)}
                        aria-pressed={subcategory === s.slug}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </FilterBlock>

            {/* ── Occasion ──────────────────────────── */}
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

            {/* ── Émotions ──────────────────────────── */}
            <FilterBlock label="Émotions transmises">
              <p className={styles.filterHint}>Sélectionnez jusqu'à 5 émotions</p>
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
              {emotions.length > 0 && (
                <div className={styles.thresholdWrap}>
                  <div className={styles.thresholdHeader}>
                    <span className={styles.thresholdLabel}>Intensité minimale</span>
                    <span className={styles.thresholdValue}>{emotionPct}%</span>
                  </div>
                  <input
                    type="range" min={20} max={90} step={5}
                    value={emotionPct}
                    onChange={e => setEmotionPct(Number(e.target.value))}
                    className={styles.rangeInput}
                    aria-label={`Intensité minimale : ${emotionPct}%`}
                  />
                  <div className={styles.thresholdHints}>
                    <span>Subtil</span><span>Intense</span>
                  </div>
                </div>
              )}
            </FilterBlock>

            {/* ── Budget ────────────────────────────── */}
            <FilterBlock label="Budget (MAD)">
              <div className={styles.priceDisplay}>
                <span>{priceRange[0]} MAD</span>
                <span>—</span>
                <span>{priceRange[1] >= PRICE_MAX ? '2500+ MAD' : `${priceRange[1]} MAD`}</span>
              </div>
              <div className={styles.dualRange}>
                <input
                  type="range" min={0} max={PRICE_MAX} step={50}
                  value={priceRange[0]}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v < priceRange[1]) setPriceRange([v, priceRange[1]])
                  }}
                  className={styles.rangeInput}
                  aria-label="Prix minimum"
                />
                <input
                  type="range" min={0} max={PRICE_MAX} step={50}
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

            {/* ── Premium ───────────────────────────── */}
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

        {/* ─── Zone principale ──────────────────────── */}
        <main className={styles.main}>

          {/* ── Toolbar desktop ───────────────────── */}
          <div className={styles.toolbar}>
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

            <div className={styles.sortWrap}>
              <label className={styles.sortLabel} htmlFor="sort-select">Trier par</label>
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

          {/* ── Catégorie desktop ─────── */}
          <div className={styles.catNav}>
            <div className={styles.catRow}>
              <button
                className={`${styles.catTab} ${!category ? styles.catTabActive : ''}`}
                onClick={() => handleCategoryChange('')}
              >Tout</button>
              {allCategories.map(c => (
                <button
                  key={c.slug}
                  className={`${styles.catTab} ${category === c.slug ? styles.catTabActive : ''}`}
                  onClick={() => handleCategoryChange(c.slug)}
                >
                  <span className={styles.catTabIcon} aria-hidden>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>

            {subcategories.length > 0 && (
              <div className={styles.subRow}>
                <button
                  className={`${styles.subTab} ${!subcategory ? styles.subTabActive : ''}`}
                  onClick={() => setSubcategory('')}
                >Tous</button>
                {subcategories.map(s => (
                  <button
                    key={s.slug}
                    className={`${styles.subTab} ${subcategory === s.slug ? styles.subTabActive : ''}`}
                    onClick={() => setSubcategory(s.slug)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Filtres actifs ────────────────────── */}
          {hasFilters && (
            <div className={styles.activeFilters} aria-live="polite">
              {query && <ActiveChip label={`"${query}"`} onRemove={() => setQuery('')} />}
              {occasion && (
                <ActiveChip
                  label={occasions.find(o => o.slug === occasion)?.label}
                  onRemove={() => setOccasion('')}
                />
              )}
              {category && (
                <ActiveChip
                  label={allCategories.find(c => c.slug === category)?.label}
                  onRemove={() => handleCategoryChange('')}
                />
              )}
              {subcategory && (
                <ActiveChip
                  label={subcategories.find(s => s.slug === subcategory)?.label}
                  onRemove={() => setSubcategory('')}
                />
              )}
              {premiumOnly && <ActiveChip label="Premium" onRemove={() => setPremiumOnly(false)} />}
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
              <button className={styles.clearAll} onClick={resetAll}>Effacer tout</button>
            </div>
          )}

          {/* ── Grille produits ou Skeleton Loading ───────────────────── */}
          {loading ? (
            <div className={styles.grid} style={{ opacity: 0.6 }}>
              {/* Optionnel : Place ici un squelette de chargement ou un simple indicateur */}
              <p>Chargement des bouquets...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div ref={gridRef} className={styles.grid}>
                {results.map((flower, i) => (
                  <div key={flower.id || flower._id || i} data-b="card">
                    <FlowerCard flower={flower} priority={i < 4} />
                  </div>
                ))}
              </div>

              {/* ── Load more ────────────────────── */}
              {page < totalPages && (
                <div className={styles.loadMore}>
                  <button
                    className={styles.loadMoreBtn}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Voir plus
                    <span className={styles.loadMoreCount}>
                      ({allResults.length - results.length} restants)
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState onReset={resetAll} />
          )}
        </main>
      </div>
    </div>
  )
}

/* ══ Sous-composants ═══════════════════════════════════════ */

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
      <button onClick={onRemove} className={styles.chipRemove} aria-label={`Retirer ${label}`}>×</button>
    </span>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden>◎</span>
      <h3 className={styles.emptyTitle}>Aucun bouquet trouvé</h3>
      <p className={styles.emptySub}>Ajustez vos filtres ou explorez toute notre collection.</p>
      <button className={styles.emptyBtn} onClick={onReset}>Voir tous les bouquets</button>
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