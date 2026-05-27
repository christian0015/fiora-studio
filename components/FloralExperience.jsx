'use client'
/**
 * FloralExperience — VERSION 1 (Ma version)
 * ─────────────────────────────────────────
 * Approche : Pure CSS + GSAP ScrollTrigger. Zéro WebGL.
 * Concept   : SVG botanique auto-dessiné au scroll + headline
 *             à masque clip-path, fond sombre pinné.
 * Perf      : Aucune dépendance 3D. Tourne partout, même sur
 *             des appareils Android bas de gamme.
 *
 * ── AJOUT v1.1 : Racines descendantes (scroll-hint) ───────────
 * Nouveau ScrollTrigger indépendant sur [data-root].
 * Les racines partent du bord supérieur et convergent vers
 * le centre pour signaler visuellement qu'il y a du contenu
 * en-dessous. Tout le reste est intact.
 */
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './FloralExperience.module.css'

/* ── Données ──────────────────────────────────────────────── */
const PILLARS = [
  {
    num: '01',
    label: 'Sélection rigoureuse',
    desc: 'Chaque tige choisie pour sa fraîcheur et sa beauté intrinsèque.',
  },
  {
    num: '02',
    label: 'Préparation artisanale',
    desc: 'Assemblés à la main le jour même, jamais en avance.',
  },
  {
    num: '03',
    label: 'Livraison Casablanca',
    desc: 'Dans les mains du destinataire en quelques heures.',
  },
]

/* ── Composant ────────────────────────────────────────────── */
export default function FloralExperience() {
  const sectionRef = useRef(null)
  const ctxRef     = useRef(null)

  useEffect(() => {
    // Chargement dynamique → pas d'erreur SSR Next.js
    async function init() {
      const { default: gsap }      = await import('gsap')
      const { ScrollTrigger }      = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const section = sectionRef.current
      if (!section) return

      /* ── Préparer les chemins SVG pour l'animation stroke ── */
      section.querySelectorAll('[data-stroke]').forEach(path => {
        const len = path.getTotalLength?.() ?? 500
        path.style.strokeDasharray  = len
        path.style.strokeDashoffset = len
      })

      /* ─────────────────────────────────────────────────────────
       * AJOUT v1.1 — Préparer les racines (stroke-dashoffset)
       * Même mécanique que les [data-stroke] existants, mais
       * dans un groupe isolé pour ne pas polluer la timeline
       * principale.
       * ───────────────────────────────────────────────────────── */
      section.querySelectorAll('[data-root]').forEach(path => {
        const len = path.getTotalLength?.() ?? 300
        path.style.strokeDasharray  = len
        path.style.strokeDashoffset = len
      })

      /* ── Contexte GSAP (nettoyage propre au unmount) ──────── */
      ctxRef.current = gsap.context(() => {

        /* Master timeline pinned sur 280vh */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger:           section,
            start:             'top 60%', // cetait top top mtnant top 50%
            end:               '+=100%', //280%
            // pin:               true, c'etait true
            scrub:             1.4,          // lag smooth, pas scrub:true
            anticipatePin:     1,            // évite le saut de layout
            invalidateOnRefresh: true,       // recalcul sur resize
            // markers: 1
          }
        })

        /* ── Phase 0 (0 → 0.20) : Fond sombre + cercles ────── */
        tl
          .to('[data-el="bg"]',       { opacity: 1, duration: 0.2 }, -0.15) // c'etais 0 mtnant -0.15
          .to('[data-el="ring1"]',    { scale: 1,  opacity: 0.18, duration: 0.35, ease: 'power2.out' }, 0.04)
          .to('[data-el="ring2"]',    { scale: 1,  opacity: 0.08, duration: 0.45, ease: 'power2.out' }, 0.07)
          .to('[data-el="eyebrow"]',  { opacity: 1, y: 0, duration: 0.25 }, 0.18)

        /* ── Phase 1 (0.10 → 0.50) : SVG se dessine ─────────── */
        section.querySelectorAll('[data-stroke]').forEach((path, i) => {
          tl.to(path, {
            strokeDashoffset: 0,
            duration:  0.5 + i * 0.08,
            ease:      'power2.inOut',
          }, 0.12 + i * 0.07)
        })

        /* ── Phase 2 (0.35 → 0.65) : Headline mot par mot ───── */
        tl.to('[data-word]', {
          y:        '0%',
          duration:  0.45,
          stagger:   0.18,
          ease:      'power3.out',
        }, 0.38)

        /* ── Phase 3 (0.58 → 0.80) : Piliers philosophiques ─── */
        tl.to('[data-pillar]', {
          opacity: 1,
          y:       0,
          duration: 0.3,
          stagger:  0.14,
        }, 0.60)

        /* ── Phase 4 (0.78 → 1.00) : Ligne + CTA ────────────── */
        tl
          .to('[data-el="rule"]', { scaleX: 1, duration: 0.4 }, 0.80)
          .to('[data-el="cta"]',  { opacity: 1, y: 0, duration: 0.3 }, 0.88)

        /* ═══════════════════════════════════════════════════════
         * AJOUT v1.1 — ScrollTrigger RACINES (scroll-hint)
         * Déclenché plus tôt que la timeline principale :
         * dès que la section entre dans le viewport (top 80%).
         * Les racines se tracent de haut en bas et convergent
         * vers le milieu horizontal, puis pulsent doucement
         * pour inviter l'œil vers le bas.
         * ═══════════════════════════════════════════════════════ */
        const rootPaths = section.querySelectorAll('[data-root]')

        const rootTl = gsap.timeline({
          scrollTrigger: {
            trigger:           section,
            start:             'top 100%',  // dès que la section touche le bas du viewport
            end:               '+=55%',     // finit quand le scroll est bien engagé
            scrub:             1.6,         // lag organique mais pas trop lent
            invalidateOnRefresh: true,
            // markers: { label: 'RACINES' }, // décommenter pour debug
          }
        })

        /* Tracé des racines en cascade (stagger léger) */
        rootTl.to(rootPaths, {
          strokeDashoffset: 0,
          duration:  0.9,
          stagger:   0.12,
          ease:      'power1.inOut',
        }, 0)

        /* Montée d'opacité franche — racines bien visibles */
        rootTl.to('[data-el="rootsContainer"]', {
          opacity: 0.88,
          duration: 0.6,
          ease: 'power2.out',
        }, 0)

      }, section)

      /* Refresh après fonts/images chargées */
      window.addEventListener('load', ScrollTrigger.refresh, { once: true })
    }

    init()
    return () => ctxRef.current?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="L'expérience florale — Notre philosophie"
    >
      {/* ── Fond sombre overlay ─────────────────────────────── */}
      <div data-el="bg" className={styles.bg} aria-hidden />

      {/* ── Cercles géométriques (fond) ─────────────────────── */}
      <span data-el="ring1" className={styles.ring1} aria-hidden />
      <span data-el="ring2" className={styles.ring2} aria-hidden />

      {/* ═══════════════════════════════════════════════════════
        * AJOUT v1.1 — SVG Racines descendantes (scroll-hint)
        * Positionné en haut de la section, z-index bas pour
        * ne pas interférer avec le contenu.
        * viewBox 800×260 : large pour couvrir toute la largeur.
        * Les chemins partent des coins et bords supérieurs,
        * descendent en courbes organiques et convergent vers
        * le centre bas du SVG (point de confluence).
        * ═══════════════════════════════════════════════════════ */}
      <svg
        data-el="rootsContainer"
        className={styles.rootsSvg}
        viewBox="0 0 800 260"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
        aria-hidden
        role="img"
        style={{ opacity: 0 }}  /* départ invisible, GSAP prend le relais */
      >
        {/* ── Racine extrême gauche ──────────────────────────── */}
        <path
          data-root
          d="M 30 0 C 30 40 60 80 100 110 C 140 140 200 155 260 175 C 310 192 360 205 400 215"
          stroke="#C9A96E" strokeWidth="1.4" strokeLinecap="round"
        />

        {/* ── Racine gauche secondaire ───────────────────────── */}
        <path
          data-root
          d="M 150 0 C 148 35 160 70 185 100 C 210 130 260 152 310 172 C 350 188 380 200 400 215"
          stroke="#C9A96E" strokeWidth="1.1" strokeLinecap="round"
        />

        {/* ── Racine gauche tertiaire (petite, décalée) ─────── */}
        <path
          data-root
          d="M 260 0 C 260 28 268 55 285 82 C 305 112 345 140 375 170 C 390 185 396 200 400 215"
          stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round"
          strokeDasharray="3 7"
        />

        {/* ── Racine centrale gauche (quasi-verticale) ─────── */}
        <path
          data-root
          d="M 370 0 C 372 50 378 100 385 145 C 391 175 396 196 400 215"
          stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"
        />

        {/* ── Racine centrale droite (symétrique) ──────────── */}
        <path
          data-root
          d="M 430 0 C 428 50 422 100 415 145 C 409 175 404 196 400 215"
          stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"
        />

        {/* ── Racine droite tertiaire ────────────────────────── */}
        <path
          data-root
          d="M 540 0 C 540 28 532 55 515 82 C 495 112 455 140 425 170 C 410 185 404 200 400 215"
          stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round"
          strokeDasharray="3 7"
        />

        {/* ── Racine droite secondaire ───────────────────────── */}
        <path
          data-root
          d="M 650 0 C 652 35 640 70 615 100 C 590 130 540 152 490 172 C 450 188 420 200 400 215"
          stroke="#C9A96E" strokeWidth="1.1" strokeLinecap="round"
        />

        {/* ── Racine extrême droite ─────────────────────────── */}
        <path
          data-root
          d="M 770 0 C 770 40 740 80 700 110 C 660 140 600 155 540 175 C 490 192 440 205 400 215"
          stroke="#C9A96E" strokeWidth="1.4" strokeLinecap="round"
        />

        {/* ── Petites ramifications gauche (texture) ───────── */}
        <path
          data-root
          d="M 80 0 C 82 22 90 44 110 66 C 130 88 165 108 200 130"
          stroke="#C9A96E" strokeWidth="0.65" strokeLinecap="round"
          opacity="0.75"
        />
        <path
          data-root
          d="M 200 0 C 200 18 205 36 218 55 C 234 76 264 96 290 118"
          stroke="#C9A96E" strokeWidth="0.6" strokeLinecap="round"
          opacity="0.65"
        />

        {/* ── Petites ramifications droite (texture) ────────── */}
        <path
          data-root
          d="M 720 0 C 718 22 710 44 690 66 C 670 88 635 108 600 130"
          stroke="#C9A96E" strokeWidth="0.65" strokeLinecap="round"
          opacity="0.75"
        />
        <path
          data-root
          d="M 600 0 C 600 18 595 36 582 55 C 566 76 536 96 510 118"
          stroke="#C9A96E" strokeWidth="0.6" strokeLinecap="round"
          opacity="0.65"
        />

        {/* ── Point de confluence au centre ────────────────── */}
        <circle
          cx="400" cy="218" r="3.5"
          fill="#C9A96E" opacity="0.8"
        />
        {/* Halo autour du point */}
        <circle
          cx="400" cy="218" r="8"
          stroke="#C9A96E" strokeWidth="0.7" opacity="0.4"
        />
      </svg>

      {/* ── SVG Botanique qui se trace au scroll ────────────── */}
      <svg
        className={styles.botanicalSvg}
        viewBox="0 0 280 440"
        fill="none"
        aria-hidden
        role="img"
      >
        {/* Tige principale */}
        <path
          data-stroke
          d="M140 430 C138 385 134 340 138 295 C142 250 136 205 140 160"
          stroke="#C9A96E" strokeWidth="1" strokeLinecap="round"
        />
        {/* Feuille gauche basse */}
        <path
          data-stroke
          d="M140 330 C118 323 96 308 88 286 C108 290 128 306 140 330"
          stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round"
        />
        {/* Feuille droite */}
        <path
          data-stroke
          d="M140 278 C162 268 184 250 190 228 C170 234 153 248 140 278"
          stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round"
        />
        {/* Tige secondaire droite */}
        <path
          data-stroke
          d="M140 240 C160 230 176 210 182 192"
          stroke="#C9A96E" strokeWidth="0.5" strokeLinecap="round"
          strokeDasharray="3 6"
        />
        {/* Pétale gauche principal */}
        <path
          data-stroke
          d="M140 160 C120 140 104 116 108 88 C122 96 136 120 140 160"
          stroke="#C9A96E" strokeWidth="0.75" strokeLinecap="round"
        />
        {/* Pétale droit principal */}
        <path
          data-stroke
          d="M140 160 C160 138 178 114 174 86 C160 94 146 118 140 160"
          stroke="#C9A96E" strokeWidth="0.75" strokeLinecap="round"
        />
        {/* Pétale haut gauche */}
        <path
          data-stroke
          d="M140 160 C118 148 96 144 86 122 C102 118 124 130 140 160"
          stroke="#C9A96E" strokeWidth="0.65" strokeLinecap="round"
        />
        {/* Pétale haut droit */}
        <path
          data-stroke
          d="M140 160 C162 150 184 146 196 125 C180 120 160 132 140 160"
          stroke="#C9A96E" strokeWidth="0.65" strokeLinecap="round"
        />
        {/* Pétale intérieur 1 */}
        <path
          data-stroke
          d="M140 160 C132 148 130 136 134 124 C142 126 146 140 140 160"
          stroke="#C9A96E" strokeWidth="0.55" strokeLinecap="round"
        />
        {/* Pétale intérieur 2 */}
        <path
          data-stroke
          d="M140 160 C148 150 152 136 148 124 C140 124 136 140 140 160"
          stroke="#C9A96E" strokeWidth="0.55" strokeLinecap="round"
        />
        {/* Cercle décoratif autour de la rose */}
        <circle
          data-stroke
          cx="140" cy="148" r="38"
          stroke="#C9A96E" strokeWidth="0.35" opacity="0.45"
        />
        {/* Cercle extérieur discret */}
        <circle
          data-stroke
          cx="140" cy="148" r="56"
          stroke="#C9A96E" strokeWidth="0.25" opacity="0.2"
          strokeDasharray="4 8"
        />
        {/* Point cœur */}
        <circle cx="140" cy="144" r="4" fill="#C9A96E" opacity="0.6" />
      </svg>

      {/* ── Contenu principal ───────────────────────────────── */}
      <div className={styles.content}>

        {/* Eyebrow */}
        <p data-el="eyebrow" className={styles.eyebrow}>
          Le soin de l'essentiel
        </p>

        {/* Headline avec masque ascendant (overflow hidden + translateY) */}
        <h2
          className={styles.headline}
          aria-label="Chaque fleur raconte une histoire."
        >
          <span className={styles.maskOuter}>
            <span data-word className={styles.maskWord}>Chaque fleur</span>
          </span>
          <span className={`${styles.maskOuter} ${styles.maskOuterAccent}`}>
            <em data-word className={styles.maskItalic}>raconte</em>
          </span>
          <span className={styles.maskOuter}>
            <span data-word className={styles.maskWord}>une histoire.</span>
          </span>
        </h2>

        {/* Piliers */}
        <div className={styles.pillars}>
          {PILLARS.map(({ num, label, desc }) => (
            <article
              key={label}
              data-pillar
              className={styles.pillar}
            >
              <span className={styles.pillarNum}>{num}</span>
              <h3 className={styles.pillarLabel}>{label}</h3>
              <p  className={styles.pillarDesc}>{desc}</p>
            </article>
          ))}
        </div>

        {/* Ligne + CTA */}
        <div className={styles.bottom}>
          <div data-el="rule" className={styles.rule} aria-hidden />
          <Link
            href="/boutique"
            data-el="cta"
            className={styles.cta}
          >
            Découvrir les bouquets
            <span className={styles.ctaArrow} aria-hidden>→</span>
          </Link>
        </div>

      </div>
    </section>
  )
}