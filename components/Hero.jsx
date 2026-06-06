'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Hero.module.css'

export default function Hero() {
  const heroRef  = useRef(null)
  const textRef  = useRef(null)
  const imageRef = useRef(null)

  /* ── Entrance animation (CSS-driven, no GSAP dependency) ── */
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    // Trigger after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add(styles.revealed))
    })
  }, [])

  /* ── Subtle parallax on mouse move ─────────────────────── */
  useEffect(() => {
    const img = imageRef.current
    if (!img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e) => {
      const { clientX, clientY } = e
      const { innerWidth: W, innerHeight: H } = window
      const dx = (clientX / W - 0.5) * -14
      const dy = (clientY / H - 0.5) * -10
      img.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className={styles.hero} ref={heroRef} aria-label="Section hero">
      {/* ── Background botanical geometry ─────────────── */}
      <div className={styles.bg} aria-hidden>
        {/* Large faded serif letter */}
        <span className={styles.bgLetter}>F S</span>
        {/* Thin geometric lines */}
        <span className={styles.lineV1} />
        <span className={styles.lineV2} />
        <span className={styles.lineH}  />
        {/* Circle accent */}
        <span className={styles.circle} />
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className={styles.content} ref={textRef}>
        {/* Eyebrow */}
        <p className={`${styles.eyebrow} caption`}>
          Casablanca · Livraison jour même
        </p>

        {/* Headline */}
        <h1 className={styles.headline}>
          <span className={styles.headlineTop}>L'art d'</span>
          <span className={styles.headlineMid}>
            <em>offrir</em>
          </span>
          <span className={styles.headlineBot}>des fleurs.</span>
        </h1>

        {/* Sub */}
        <p className={styles.sub}>
          Bouquets d'exception préparés à la main,<br />
          livrés avec soin à Casablanca.
        </p>

        {/* CTAs */}
        <div className={styles.ctas}>
          <Link href="/boutique" className={styles.ctaPrimary}>
            Explorer les bouquets
          </Link>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            <WhatsAppIcon />
            Commander via WhatsApp
          </a>
        </div>

        {/* Trust micro-badges */}
        <div className={styles.trust}>
          {['Livraison rapide', 'Paiement à la livraison', 'Qualité premium'].map(t => (
            <span key={t} className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Flower image ─────────────────────────────── */}
      <div className={styles.imageWrap} ref={imageRef}>
        {/* Decorative ring behind image */}
        <span className={styles.imageRing} aria-hidden />

        <Image
          // src="/images/hero-flower.jpg"
          src="/images/hero-flower1.png"
          // src="/images/hero-flower2.png"
          alt="Bouquet de roses premium Fiora Studio"
          width={560}
          height={700}
          priority
          quality={90}
          className={styles.image}
          sizes="(max-width: 768px) 90vw, 45vw"
        />

        {/* Price tag floating */}
        <div className={styles.floatCard} aria-hidden>
          <span className={styles.floatLabel}>Le bouquet signature</span>
          <span className={styles.floatPrice}>À partir de 290 MAD</span>
        </div>
      </div>

      {/* ── Scroll indicator ────────────────────────── */}
      <div className={styles.scrollIndicator} aria-hidden>
        <span className={styles.scrollLine} />
      </div>
    </section>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}
