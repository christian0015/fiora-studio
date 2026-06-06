'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  formatPrice,
  getTopEmotions,
  occasions,
  siteConfig,
} from '@/libs/data'
import { createOrder, OWNER_WHATSAPP } from '@/libs/checkout'
import { useCartStore } from '@/libs/cart'
import FlowerCard from '@/components/FlowerCard'
import styles from './FleurPage.module.css'

/* ═══════════════════════════════════════════════════════════════
   FLEUR PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function FleurPage({ flower, similar }) {
  const ctxRef      = useRef(null)
  const rootRef     = useRef(null)
  const [mounted, setMounted] = useState(false)

  /* ── State ─────────────────────────────────────────── */
  const [activeImg,    setActiveImg]    = useState(0)
  const [selectedSize, setSelectedSize] = useState(flower?.sizes?.[0] || { label: 'Standard', price: flower?.price || 0 });
  const [qty,          setQty]          = useState(1)
  const [addedAnim,    setAddedAnim]    = useState(false)
  const [imgZoomed,    setImgZoomed]    = useState(false)
  const [waLoading,    setWaLoading]    = useState(false)

  const addToCart = useCartStore(s => s.addItem)

  // Utilisation sécurisée des données transmises par le Server Component
  const topEmotions   = getTopEmotions(flower, flower?.emotions?.length || 0)
  const flowerOccasions = occasions.filter(o => flower?.occasions?.includes(o.slug))
  const isOutOfStock  = flower.stock === 0

  /* ── Entrance GSAP ─────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!rootRef.current) return

      ctxRef.current = gsap.context(() => {
        /* Galerie */
        gsap.fromTo('[data-fp="gallery"]', 
          { x: -32, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: 0.1 }
        )

        /* Infos */
        gsap.fromTo('[data-fp="info"] > *', 
          { y: 28, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.09, duration: 0.7, ease: 'power3.out', delay: 0.2 }
        )

        /* Émotions */
        gsap.fromTo('[data-fp="ebar"]', 
          { scaleX: 0, transformOrigin: 'left' }, 
          { scaleX: 1, stagger: 0.07, duration: 0.8, ease: 'power2.out', delay: 0.55 }
        )

        /* Similaires */
        gsap.fromTo('[data-fp="sim"]', 
          { y: 36, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: '[data-fp="simgrid"]', start: 'top 84%' } }
        )
      }, rootRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [flower.slug])

  /* ── Keyboard nav galerie ──────────────────────────── */
  useEffect(() => {
    if (!flower?.images?.length) return
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActiveImg(i => (i + 1) % flower.images.length)
      if (e.key === 'ArrowLeft')  setActiveImg(i => (i - 1 + flower.images.length) % flower.images.length)
      if (e.key === 'Escape')     setImgZoomed(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flower?.images?.length])

  /* ── Handlers ──────────────────────────────────────── */
  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return
    for (let i = 0; i < qty; i++) {
      addToCart({ ...flower, selectedSize })
    }
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 1800)
  }, [flower, selectedSize, qty, isOutOfStock, addToCart])

  /* ── WhatsApp order — enregistre d'abord en DB, puis ouvre WA ── */
  const handleWaOrder = useCallback(async () => {
    setWaLoading(true)
    const price = selectedSize.price
    const waMessage = encodeURIComponent(
      `Bonjour Fiora 🌸\nJe souhaite commander :\n` +
      `• ${flower.name}\n` +
      `• Taille : ${selectedSize.label}\n` +
      `• Qté : ${qty}\n` +
      `• Prix : ${formatPrice(price * qty)}\n\n` +
      `Merci !`
    )
    try {
      await createOrder({
        customer: { locale: 'fr' },
        items: [{
          flowerId:   flower.id || flower._id || '',
          slug:       flower.slug || '',
          name:       flower.name,
          image:      flower.images?.[0] || '',
          price,
          qty,
          size:       selectedSize.label  || null,
          sizeHeight: selectedSize.height || null,
        }],
        subtotal:       price * qty,
        deliveryFee:    0,
        total:          price * qty,
        shippingMethod: 'casa_near',
        paymentMethod:  'whatsapp',
        note:           `Commande directe depuis la page produit : ${flower.name}`,
      })
    } catch (_) {
      // Échec silencieux — on ouvre WA quand même pour ne pas bloquer l'user
    } finally {
      setWaLoading(false)
      window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${waMessage}`, '_blank')
    }
  }, [flower, selectedSize, qty])

  /* ─────────────────────────────────────────────────── */
  return (
    <div className={styles.root} ref={rootRef}>

      {/* ── Breadcrumb ─────────────────────────────── */}
      <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
        <Link href="/"         className={styles.breadLink}>Fiora</Link>
        <span className={styles.breadSep} aria-hidden>·</span>
        <Link href="/boutique" className={styles.breadLink}>Boutique</Link>
        <span className={styles.breadSep} aria-hidden>·</span>
        <span className={styles.breadCurrent}>{flower.name}</span>
      </nav>

      {/* ══ PRODUIT — layout 2 colonnes ═════════════ */}
      <div className={styles.product}>

        {/* ── GALERIE ──────────────────────────────── */}
        <div data-fp="gallery" className={styles.gallery}>
          {/* Image principale */}
          <div
            className={`${styles.mainImgWrap} ${imgZoomed ? styles.mainImgZoomed : ''}`}
            onClick={() => setImgZoomed(z => !z)}
            aria-label={imgZoomed ? 'Réduire l\'image' : 'Agrandir l\'image'}
            aria-pressed={imgZoomed}
          >
            {flower.images?.[activeImg] && (
              <Image
                src={flower.images[activeImg]}
                alt={`${flower.name} — photo ${activeImg + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 52vw"
                priority
                quality={92}
                className={styles.mainImg}
              />
            )}

            {/* Badges sur image */}
            <div className={styles.imgBadges} aria-hidden>
              {flower.premium && (
                <span className={styles.badge}>Premium</span>
              )}
              {flower.oldPrice && (
                <span className={`${styles.badge} ${styles.badgeSale}`}>
                  -{Math.round((1 - flower.price / flower.oldPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Hint zoom */}
            <span className={styles.zoomHint} aria-hidden>
              {imgZoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
            </span>

            {/* Nav flèches si plusieurs images */}
            {flower.images?.length > 1 && (
              <>
                <button
                  className={`${styles.imgNav} ${styles.imgNavPrev}`}
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + flower.images.length) % flower.images.length) }}
                  aria-label="Image précédente"
                >‹</button>
                <button
                  className={`${styles.imgNav} ${styles.imgNavNext}`}
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % flower.images.length) }}
                  aria-label="Image suivante"
                >›</button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {flower.images?.length > 1 && (
            <div className={styles.thumbs} role="list" aria-label="Photos du produit">
              {flower.images.map((src, i) => (
                <button
                  key={i}
                  role="listitem"
                  className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={activeImg === i}
                >
                  <Image
                    src={src}
                    alt={`${flower.name} vue ${i + 1}`}
                    fill
                    sizes="80px"
                    className={styles.thumbImg}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Info stock discret */}
          {!isOutOfStock && flower.stock <= 5 && (
            <p className={styles.stockWarn} aria-live="polite">
              <DotIcon /> Plus que {flower.stock} en stock
            </p>
          )}
        </div>

        {/* ── INFOS ────────────────────────────────── */}
        <div data-fp="info" className={styles.info}>

          {/* Rating */}
          {flower.rating && (
            <div className={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < Math.round(flower.rating)} />
              ))}
              <span className={styles.ratingVal}>{flower.rating}</span>
              <span className={styles.ratingCount}>({flower.reviews} avis)</span>
            </div>
          )}

          {/* Nom */}
          <h1 className={styles.name}>{flower.name}</h1>

          {/* Émotion courte */}
          <p className={styles.shortDesc}>{flower.shortDescription}</p>

          {/* Occasions */}
          {flowerOccasions.length > 0 && (
            <div className={styles.occasionTags} aria-label="Occasions">
              {flowerOccasions.map(o => (
                <Link
                  key={o.slug}
                  href={`/occasion/${o.slug}`}
                  className={styles.occTag}
                  style={{ '--tag-accent': o.accent }}
                >
                  {o.label}
                </Link>
              ))}
            </div>
          )}

          {/* Diviseur */}
          <div className={styles.divider} aria-hidden />

          {/* Prix */}
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(selectedSize.price)}</span>
            {flower.oldPrice && (
              <span className={styles.oldPrice}>{formatPrice(flower.oldPrice)}</span>
            )}
            {flower.oldPrice && (
              <span className={styles.saving}>
                Économisez {formatPrice(flower.oldPrice - selectedSize.price)}
              </span>
            )}
          </div>

          {/* ── Sélecteur de taille ─────────────────── */}
          {flower.sizes && flower.sizes.length > 0 && (
            <div className={styles.sizeSection}>
              <p className={styles.sizeLabel}>
                Taille
                <span className={styles.sizeCurrent}>{selectedSize.label}</span>
              </p>
              <div className={styles.sizes} role="radiogroup" aria-label="Choisir une taille">
                {flower.sizes.map(s => (
                  <button
                    key={s.label}
                    role="radio"
                    aria-checked={selectedSize.label === s.label}
                    className={`${styles.sizeBtn} ${selectedSize.label === s.label ? styles.sizeBtnActive : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    <span className={styles.sizeBtnLabel}>{s.label}</span>
                    <span className={styles.sizeBtnPrice}>{formatPrice(s.price)}</span>
                    <span className={styles.sizeBtnDim}>{s.height}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Quantité ────────────────────────────── */}
          <div className={styles.qtySection}>
            <p className={styles.sizeLabel}>Quantité</p>
            <div className={styles.qtyControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Diminuer"
                disabled={qty <= 1}
              >−</button>
              <span className={styles.qtyVal} aria-live="polite">{qty}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty(q => Math.min(flower.stock, q + 1))}
                aria-label="Augmenter"
                disabled={qty >= flower.stock}
              >+</button>
            </div>
          </div>

          {/* ── CTAs ────────────────────────────────── */}
          <div className={styles.ctas}>
            {/* Panier */}
            <button
              className={`${styles.btnCart} ${addedAnim ? styles.btnCartAdded : ''} ${isOutOfStock ? styles.btnCartDisabled : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-live="polite"
              aria-label={addedAnim ? 'Ajouté au panier' : 'Ajouter au panier'}
            >
              {addedAnim ? <CheckIcon /> : <BagIcon />}
              {isOutOfStock
                ? 'Rupture de stock'
                : addedAnim
                  ? 'Ajouté au panier !'
                  : `Ajouter — ${formatPrice(selectedSize.price * qty)}`
              }
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWaOrder}
              disabled={waLoading || isOutOfStock}
              className={styles.btnWa}
              aria-label="Commander via WhatsApp"
            >
              <WaIcon />
              {waLoading ? 'Enregistrement…' : 'Commander via WhatsApp'}
            </button>
          </div>

          {/* Livraison */}
          <p className={styles.delivery}>
            <TruckIcon />
            {siteConfig.deliveryNote}
          </p>

          {/* Diviseur */}
          <div className={styles.divider} aria-hidden />

          {/* ── Description longue ──────────────────── */}
          <div className={styles.descSection}>
            <h2 className={styles.descTitle}>À propos de ce bouquet</h2>
            <p className={styles.descText}>{flower.description}</p>
          </div>

          {/* ── Détails techniques ──────────────────── */}
          <details className={styles.detailsBlock}>
            <summary className={styles.detailsSummary}>
              Détails & couleurs
              <ChevronIcon />
            </summary>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Catégorie</span>
                <span className={styles.detailVal}>{flower.category}</span>
              </div>
              {flower.colors && (
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Couleurs</span>
                  <span className={styles.detailVal}>{flower.colors.join(', ')}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Taille sélectionnée</span>
                <span className={styles.detailVal}>
                  {selectedSize.height || 'N/A'} · Ø {selectedSize.diameter || 'N/A'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Préparation</span>
                <span className={styles.detailVal}>Le matin du jour de livraison</span>
              </div>
            </div>
          </details>

          {/* ── Émotions visuelles ───────────────────── */}
          {topEmotions && topEmotions.length > 0 && (
            <div className={styles.emotionsSection}>
              <h2 className={styles.emotionsTitle}>Émotions transmises</h2>
              <div className={styles.emotionsList}>
                {topEmotions.map(e => (
                  <div key={e.name} className={styles.emotionRow}>
                    <span className={styles.emotionName}>{e.name}</span>
                    <span className={styles.emotionTrack}>
                      <span
                        data-fp="ebar"
                        className={styles.emotionFill}
                        style={{ width: `${e.percentage}%` }}
                      />
                    </span>
                    <span className={styles.emotionPct}>{e.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ BOUQUETS SIMILAIRES ══════════════════════ */}
      {similar && similar.length > 0 && (
        <section className={styles.similar}>
          <div className={styles.similarHeader}>
            <p className={styles.similarEyebrow}>Vous aimerez aussi</p>
            <h2 className={styles.similarTitle}>
              Dans le même <em>esprit</em>
            </h2>
          </div>

          <div data-fp="simgrid" className={styles.simGrid}>
            {similar.map((f, i) => (
              <div key={f.id || f.slug} data-fp="sim">
                <FlowerCard flower={f} priority={i < 2} />
              </div>
            ))}
          </div>

          <div className={styles.similarCta}>
            <Link href="/boutique" className={styles.similarLink}>
              Voir toute la collection →
            </Link>
          </div>
        </section>
      )}

      {/* ══ BANDE TRUST ══════════════════════════════ */}
      <div className={styles.trust}>
        {TRUST_ITEMS.map(item => (
          <div key={item.label} className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden>{item.icon}</span>
            <div>
              <p className={styles.trustLabel}>{item.label}</p>
              <p className={styles.trustSub}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Trust items ─────────────────────────────────────────────── */
const TRUST_ITEMS = [
  { icon: '◈', label: 'Qualité premium',       sub: 'Fleurs fraîches sélectionnées chaque matin' },
  { icon: '◎', label: 'Livraison jour même',    sub: 'À Casablanca avant 17h' },
  { icon: '◇', label: 'Paiement à la livraison', sub: 'Pas de paiement en ligne requis' },
  { icon: '△', label: 'Composition à la main',  sub: 'Préparée le jour du départ' },
]

/* ── Icônes ──────────────────────────────────────────────────── */
function StarIcon({ filled }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={filled ? 0 : 1.5}
      className={filled ? styles.starFilled : styles.starEmpty}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}

function ZoomInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  )
}

function ZoomOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  )
}

function DotIcon() {
  return <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', marginRight: 6, flexShrink: 0 }} aria-hidden />
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}