'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedFlowers, getTopEmotions, formatPrice } from '@/libs/data'
import styles from './FeaturedFlowers.module.css'

/* ═══════════════════════════════════════════════════════════
   FEATURED FLOWERS
   ═══════════════════════════════════════════════════════════ */
export default function FeaturedFlowers() {
  const sectionRef = useRef(null)
  const ctxRef     = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [featured, setFeatured] = useState([]) // État pour stocker les fleurs

  // ── Chargement des données asynchrones ───────────────────
  useEffect(() => {
    async function loadFlowers() {
      try {
        const data = await getFeaturedFlowers(4)
        setFeatured(data || [])
      } catch (err) {
        console.error("Erreur lors du chargement des fleurs en vedette:", err)
      }
    }
    loadFlowers()
  }, [])

  // ── Animations GSAP ──────────────────────────────────────
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = sectionRef.current
      if (!el) return

      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-ff="header"] > *', 
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: '[data-ff="header"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-ff="card"]', 
          { y: 48, opacity: 0 },
          { y: 0, opacity: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '[data-ff="grid"]', start: 'top 82%' } }
        )
        gsap.fromTo('[data-ff="footer"]', 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '[data-ff="footer"]', start: 'top 90%' } }
        )
      }, el)
    }
    
    // On lance l'animation seulement quand les données sont chargées
    if (featured.length > 0) {
      init()
    }
    return () => ctxRef.current?.revert()
  }, [featured])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Bouquets populaires"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div data-ff="header" className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={`${styles.eyebrow} caption`}>Sélection du moment</p>
          <h2 className={styles.headline}>
            Les bouquets
            <em> les plus offerts</em>
          </h2>
        </div>
        <p className={styles.headerSub}>
          Composés à la main chaque matin.<br />
          Livrés le jour même à Casablanca.
        </p>
      </div>

      {/* ── Grid ───────────────────────────────────────── */}
      <div
        data-ff="grid"
        className={styles.grid}
        role="list"
        aria-label="Bouquets en vedette"
      >
        {featured.map((flower, i) => (
          <FlowerCard key={flower.id || flower._id || i} flower={flower} index={i} />
        ))}
      </div>

      {/* ── Footer CTA ─────────────────────────────────── */}
      <div data-ff="footer" className={styles.footer}>
        <div className={styles.footerLine} aria-hidden />
        <Link href="/boutique" className={styles.footerCta}>
          Voir tous les bouquets
          <span className={styles.footerCtaArrow} aria-hidden>→</span>
        </Link>
        <div className={styles.footerLine} aria-hidden />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FLOWER CARD
   ═══════════════════════════════════════════════════════════ */
function FlowerCard({ flower, index }) {
  const {
    slug, name, shortDescription, price, oldPrice,
    currency, rating, reviews, premium, images,
  } = flower

  const topEmotions = getTopEmotions(flower, 2)
  const isTall = index % 2 === 0

  return (
    <Link
      data-ff="card"
      href={`/fleur/${slug}`}
      className={`${styles.card} ${isTall ? styles.cardTall : ''}`}
      role="listitem"
      aria-label={`${name} — ${formatPrice(price, currency)}`}
    >
      {/* ── Image ──────────────────────────────────────── */}
      <div className={styles.imageWrap}>
        {images?.[0] && (
          <Image
            src={images[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={styles.image}
          />
        )}

        {/* Badges */}
        <div className={styles.badges} aria-label="Caractéristiques">
          {premium && (
            <span className={styles.badgePremium}>Premium</span>
          )}
          {oldPrice && (
            <span className={styles.badgeSale} aria-label="En promotion">
              −{Math.round((1 - price / oldPrice) * 100)} %
            </span>
          )}
        </div>

        {/* Quick add */}
        <div className={styles.quickAdd} aria-hidden>
          <span>Voir le bouquet</span>
        </div>
      </div>

      {/* ── Infos ──────────────────────────────────────── */}
      <div className={styles.info}>
        {/* Émotions top */}
        <div className={styles.emotions} aria-label="Émotions transmises">
          {topEmotions?.map(({ name: eName }) => (
            <span key={eName} className={styles.emotionTag}>{eName}</span>
          ))}
        </div>

        {/* Nom */}
        <h3 className={styles.name}>{name}</h3>

        {/* Description */}
        <p className={styles.desc}>{shortDescription}</p>

        {/* Bas de card */}
        <div className={styles.bottom}>
          <div className={styles.pricing}>
            <span className={styles.price}>
              {formatPrice(price, currency)}
            </span>
            {oldPrice && (
              <span className={styles.oldPrice} aria-label={`Ancien prix ${formatPrice(oldPrice, currency)}`}>
                {formatPrice(oldPrice, currency)}
              </span>
            )}
          </div>

          <div className={styles.rating} aria-label={`${rating} sur 5, ${reviews} avis`}>
            <StarIcon />
            <span className={styles.ratingVal}>{rating}</span>
            <span className={styles.ratingCount}>({reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--champagne)" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}