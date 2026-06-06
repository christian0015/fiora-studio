'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/libs/data'
import styles from './AProposPage.module.css'

/* ═══════════════════════════════════════════════════════════════
   À PROPOS  — Marque · Livraison · Confiance
   Ton éditorial, sobre, haut de gamme.
   ═══════════════════════════════════════════════════════════════ */
export default function AProposPage() {
  const rootRef = useRef(null)
  const ctxRef  = useRef(null)

  /* ── Entrance GSAP ─────────────────────────────────────────── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (!rootRef.current) return

      ctxRef.current = gsap.context(() => {
        /* Hero */
        gsap.from('[data-ap="hero"] > *', {
          y: 32, opacity: 0, stagger: 0.1,
          duration: 0.8, ease: 'power3.out', delay: 0.1,
        })

        /* Sections au scroll */
        gsap.utils.toArray('[data-ap="block"]').forEach(el => {
          gsap.from(el.querySelectorAll(':scope > *'), {
            y: 26, opacity: 0, stagger: 0.09,
            duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          })
        })

        /* Valeurs */
        gsap.from('[data-ap="val"]', {
          y: 20, opacity: 0,
          stagger: { amount: 0.4 }, duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ap="vals"]', start: 'top 82%' },
        })

        /* Livraison cards */
        gsap.from('[data-ap="lcard"]', {
          y: 24, opacity: 0,
          stagger: 0.1, duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ap="lcards"]', start: 'top 84%' },
        })

        /* FAQ */
        gsap.from('[data-ap="faq"]', {
          y: 18, opacity: 0,
          stagger: 0.08, duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-ap="faqlist"]', start: 'top 85%' },
        })
      }, rootRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  return (
    <div className={styles.root} ref={rootRef}>

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section data-ap="hero" className={styles.hero}>
        {/* Géométrie décorative */}
        <div className={styles.heroBg} aria-hidden>
          <span className={styles.bgLetter}>F</span>
          <span className={styles.bgCircle} />
          <span className={styles.bgLine}   />
        </div>

        <div className={styles.heroContent}>
          <p className={`${styles.eyebrow} caption`}>
            Notre histoire
          </p>
          <h1 className={styles.heroTitle}>
            Nous ne vendons pas<br />
            des fleurs.
            <em> Nous offrons<br />
            une intention.</em>
          </h1>
          <p className={styles.heroSub}>
            Fiora Studio est une maison florale casablancaise. Chaque bouquet est une décision
            réfléchie — une manière sérieuse et élégante d'exprimer ce que les mots
            ne disent pas toujours assez bien.
          </p>
        </div>
      </section>

      {/* ── Règle ────────────────────────────────────────── */}
      <div className={styles.rule} aria-hidden>
        <span className={styles.ruleLine}  />
        <span className={styles.ruleDot}   />
        <span className={styles.ruleLine}  />
      </div>

      {/* ══ VALEURS ══════════════════════════════════════════ */}
      <section className={styles.section} aria-label="Nos valeurs">
        <div data-ap="block" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Ce qui nous guide</p>
          <h2 className={styles.sectionTitle}>
            Trois engagements,<em> pas un de plus.</em>
          </h2>
        </div>

        <div data-ap="vals" className={styles.vals}>
          {VALUES.map(v => (
            <div data-ap="val" key={v.label} className={styles.val}>
              <span className={styles.valGlyph} aria-hidden>{v.glyph}</span>
              <h3 className={styles.valLabel}>{v.label}</h3>
              <p className={styles.valText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Règle ────────────────────────────────────────── */}
      <div className={styles.rule} aria-hidden>
        <span className={styles.ruleLine}  />
        <span className={styles.ruleDot}   />
        <span className={styles.ruleLine}  />
      </div>

      {/* ══ LIVRAISON ════════════════════════════════════════ */}
      <section className={styles.section} aria-label="Livraison et commande">
        <div data-ap="block" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Livraison & commande</p>
          <h2 className={styles.sectionTitle}>
            Simple, rapide,<em> fiable.</em>
          </h2>
          <p className={styles.sectionSub}>
            Commandez avant 12h pour une livraison le jour même à Casablanca.
            Nous vous contactons pour confirmer.
          </p>
        </div>

        <div data-ap="lcards" className={styles.lcards}>
          {DELIVERY.map(d => (
            <div data-ap="lcard" key={d.label} className={styles.lcard}>
              <span className={styles.lcardGlyph} aria-hidden>{d.glyph}</span>
              <div className={styles.lcardBody}>
                <h3 className={styles.lcardLabel}>{d.label}</h3>
                <p className={styles.lcardText}>{d.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Règle ────────────────────────────────────────── */}
      <div className={styles.rule} aria-hidden>
        <span className={styles.ruleLine}  />
        <span className={styles.ruleDot}   />
        <span className={styles.ruleLine}  />
      </div>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section className={styles.section} aria-label="Questions fréquentes">
        <div data-ap="block" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Questions</p>
          <h2 className={styles.sectionTitle}>
            Ce qu'on nous<em> demande souvent.</em>
          </h2>
        </div>

        <ul data-ap="faqlist" className={styles.faqList} role="list">
          {FAQ.map(q => (
            <FaqItem key={q.q} question={q.q} answer={q.a} />
          ))}
        </ul>
      </section>

      {/* ── Règle ────────────────────────────────────────── */}
      <div className={styles.rule} aria-hidden>
        <span className={styles.ruleLine}  />
        <span className={styles.ruleDot}   />
        <span className={styles.ruleLine}  />
      </div>

      {/* ══ CTA CONTACT ══════════════════════════════════════ */}
      <section
        data-ap="block"
        className={`${styles.section} ${styles.contactSection}`}
        aria-label="Contact"
      >
        <p className={styles.eyebrow}>Nous contacter</p>
        <h2 className={styles.contactTitle}>
          Une question ?<br />
          <em>On répond vite.</em>
        </h2>
        <p className={styles.contactSub}>
          Le moyen le plus rapide reste WhatsApp. Nous répondons généralement en moins de 15 minutes.
        </p>
        <div className={styles.contactCtas}>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaWa}
          >
            <WaIcon />
            Écrire sur WhatsApp
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaInsta}
          >
            Instagram
          </a>
        </div>
      </section>

    </div>
  )
}

/* ─── FAQ Item (details/summary natif) ─────────────────────── */
function FaqItem({ question, answer }) {
  return (
    <li data-ap="faq" role="listitem" className={styles.faqItem}>
      <details className={styles.faqDetails}>
        <summary className={styles.faqQ}>
          {question}
          <span className={styles.faqChevron} aria-hidden>+</span>
        </summary>
        <p className={styles.faqA}>{answer}</p>
      </details>
    </li>
  )
}

/* ── Données statiques ───────────────────────────────────────── */
const VALUES = [
  {
    glyph: '◈',
    label: 'Qualité florale',
    text:  'Nous sélectionnons les fleurs chaque matin. Si ce n\'est pas beau, ça ne part pas. Simple.',
  },
  {
    glyph: '◎',
    label: 'Livraison sérieuse',
    text:  'Jour même à Casablanca, avant 17h pour les commandes passées avant midi. Sans frais supplémentaires.',
  },
  {
    glyph: '◇',
    label: 'Composition à la main',
    text:  'Chaque bouquet est composé le matin du départ. Pas de stock préparé à l\'avance, pas de compromis.',
  },
]

const DELIVERY = [
  {
    glyph: '01',
    label: 'Commande avant 12h',
    text:  'Passez votre commande avant midi pour une livraison le jour même dans la journée.',
  },
  {
    glyph: '02',
    label: 'Confirmation par appel ou WhatsApp',
    text:  'Notre équipe vous contacte pour confirmer l\'adresse, l\'heure et la disponibilité.',
  },
  {
    glyph: '03',
    label: 'Livraison à domicile ou en entreprise',
    text:  'Nous livrons partout à Casablanca. Paiement à la réception ou en ligne.',
  },
  {
    glyph: '04',
    label: 'Paiement flexible',
    text:  'Cash à la livraison, carte bancaire, ou commande directe via WhatsApp. Vous choisissez.',
  },
]

const FAQ = [
  {
    q: 'Livrez-vous en dehors de Casablanca ?',
    a: 'Pour le moment, nous livrons uniquement à Casablanca et ses environs immédiats. Pour d\'autres villes, contactez-nous directement sur WhatsApp et nous ferons notre possible.',
  },
  {
    q: 'Puis-je choisir l\'heure de livraison ?',
    a: 'Nous proposons deux créneaux : matin (10h–13h) et après-midi (14h–18h). Précisez votre préférence lors de la commande et nous ferons au mieux.',
  },
  {
    q: 'Les bouquets sont-ils personnalisables ?',
    a: 'Oui. Couleurs, fleurs spécifiques, message, emballage — mentionnez-le dans la note de commande ou écrivez-nous sur WhatsApp avant de valider.',
  },
  {
    q: 'Comment sont conservés les bouquets jusqu\'à la livraison ?',
    a: 'Les bouquets sont préparés le matin du jour de livraison et gardés en chambre froide. Ils arrivent frais et durent généralement 5 à 7 jours avec les bons soins.',
  },
  {
    q: 'Puis-je retourner ou modifier ma commande ?',
    a: 'Les modifications sont possibles jusqu\'à 2h avant la livraison. Contactez-nous rapidement sur WhatsApp. Les retours ne sont pas possibles sur les produits frais, mais nous gérons tout incident avec bienveillance.',
  },
  {
    q: 'Proposez-vous des abonnements floraux ?',
    a: 'C\'est en préparation. Écrivez-nous sur WhatsApp pour être parmi les premiers informés et bénéficier d\'une offre de lancement.',
  },
]

function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}
