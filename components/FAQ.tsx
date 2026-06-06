'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './FAQ.module.css'

/* ─── Types ──────────────────────────────────────────────── */
interface FAQItem {
  id:       string
  question: string
  answer:   string
  category: 'livraison' | 'commande' | 'qualite' | 'paiement'
}

/* ─── Données ────────────────────────────────────────────── */
const FAQ_ITEMS: FAQItem[] = [
  {
    id:       'livraison-delai',
    category: 'livraison',
    question: 'Quel est le délai de livraison à Casablanca ?',
    answer:   'Nous livrons dans un délai de 2 à 4 heures après validation de votre commande. Commandez avant 15h pour une livraison le jour même. Au-delà, la livraison est programmée le lendemain matin.',
  },
  {
    id:       'livraison-zones',
    category: 'livraison',
    question: 'Quelles zones de Casablanca livrez-vous ?',
    answer:   'Nous couvrons l\'ensemble de Casablanca : Maarif, Anfa, CIL, Hay Riad, Ain Diab, Bourgogne, Gauthier, Palmier, Racine, et la plupart des quartiers résidentiels. Contactez-nous via WhatsApp pour confirmer votre adresse.',
  },
  {
    id:       'commande-whatsapp',
    category: 'commande',
    question: 'Puis-je commander directement via WhatsApp ?',
    answer:   'Absolument. WhatsApp est notre canal privilégié. Envoyez-nous le bouquet souhaité, votre adresse et l\'heure de livraison désirée. Nous confirmons en moins de 10 minutes et préparons votre commande immédiatement.',
  },
  {
    id:       'commande-personnalisation',
    category: 'commande',
    question: 'Est-il possible de personnaliser un bouquet ?',
    answer:   'Oui. Chaque bouquet peut être adapté : choix des couleurs, ajout d\'une carte manuscrite, modification de la taille ou de la composition. Précisez vos souhaits dans le formulaire ou via WhatsApp, nous faisons le reste.',
  },
  {
    id:       'paiement-modes',
    category: 'paiement',
    question: 'Quels sont les modes de paiement acceptés ?',
    answer:   'Nous acceptons le règlement en espèces à la livraison. Le virement bancaire et le paiement par chèque sont également disponibles sur demande. Aucune avance n\'est requise — vous payez uniquement à la réception.',
  },
  {
    id:       'qualite-fraicheur',
    category: 'qualite',
    question: 'Comment garantissez-vous la fraîcheur des fleurs ?',
    answer:   'Chaque bouquet est composé le matin du jour de livraison, jamais en avance. Nous sélectionnons nos fleurs auprès de fournisseurs locaux et importés chaque semaine. Si vous n\'êtes pas pleinement satisfait à la réception, nous remplaçons sans condition.',
  },
  {
    id:       'qualite-duree',
    category: 'qualite',
    question: 'Combien de temps durent les bouquets Fiora Studio ?',
    answer:   'Nos compositions fraîches durent en moyenne 5 à 10 jours avec les bons soins : eau propre renouvelée tous les deux jours, loin des sources de chaleur, tiges recoupées en biais. Nous glissons une fiche de conseils dans chaque livraison.',
  },
  {
    id:       'commande-annulation',
    category: 'commande',
    question: 'Puis-je annuler ou modifier une commande ?',
    answer:   'Une annulation ou modification est possible jusqu\'à 1 heure avant la préparation. Passé ce délai, le bouquet étant déjà composé, nous ne pouvons malheureusement plus intervenir. Contactez-nous dès que possible via WhatsApp.',
  },
]

const CATEGORIES = [
  { id: 'all',      label: 'Toutes' },
  { id: 'livraison', label: 'Livraison' },
  { id: 'commande',  label: 'Commande' },
  { id: 'paiement',  label: 'Paiement' },
  { id: 'qualite',   label: 'Qualité' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

/* ═══════════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════════ */
export default function FAQ() {
  const sectionRef            = useRef<HTMLElement>(null)
  const ctxRef                = useRef<any>(null)
  const [active, setActive]   = useState<string | null>(null)
  const [filter, setFilter]   = useState<CategoryId>('all')
  const [mounted, setMounted] = useState(false)

  const visible = FAQ_ITEMS.filter(
    item => filter === 'all' || item.category === filter
  )

  /* ── Entrance GSAP ──────────────────────────────────── */
  useEffect(() => {
    setMounted(true)
    async function init() {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      const el = sectionRef.current
      if (!el) return

      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-faq="header"] > *', 
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: '[data-faq="header"]', start: 'top 85%' } }
        )
        gsap.fromTo('[data-faq="filters"]', 
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', scrollTrigger: { trigger: '[data-faq="filters"]', start: 'top 88%' } }
        )
        gsap.fromTo('[data-faq="list"]', 
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '[data-faq="list"]', start: 'top 85%' } }
        )
      }, el)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  /* ── Toggle accordion ───────────────────────────────── */
  const toggle = (id: string) =>
    setActive(prev => (prev === id ? null : id))

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Questions fréquentes"
    >
      <div className={styles.inner}>

        {/* ── Header ───────────────────────────────────── */}
        <div data-faq="header" className={styles.header}>
          <p className={styles.eyebrow}>FAQ</p>
          <h2 className={styles.headline}>
            Questions <em>fréquentes</em>
          </h2>
          <p className={styles.sub}>
            Vous ne trouvez pas votre réponse ?{' '}
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.subLink}
            >
              Écrivez-nous sur WhatsApp →
            </a>
          </p>
        </div>

        {/* ── Filtres ──────────────────────────────────── */}
        <div
          data-faq="filters"
          className={styles.filters}
          role="tablist"
          aria-label="Filtrer par catégorie"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={filter === cat.id}
              className={`${styles.filterBtn} ${filter === cat.id ? styles.filterBtnActive : ''}`}
              onClick={() => {
                setFilter(cat.id as CategoryId)
                setActive(null)
              }}
            >
              {cat.label}
              {cat.id !== 'all' && (
                <span className={styles.filterCount} aria-hidden>
                  {FAQ_ITEMS.filter(f => f.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Accordion list ───────────────────────────── */}
        <ul
          data-faq="list"
          className={styles.list}
          role="list"
        >
          {visible.map((item, i) => (
            <FAQRow
              key={item.id}
              item={item}
              index={i}
              isOpen={active === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </ul>

        {/* ── CTA bas ──────────────────────────────────── */}
        <div className={styles.cta}>
          <span className={styles.ctaText}>
            Encore une question ?
          </span>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            <WhatsAppIcon />
            Contacter Fiora Studio
          </a>
        </div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FAQ ROW — accordion individuel
   ═══════════════════════════════════════════════════════════ */
interface FAQRowProps {
  item:     FAQItem
  index:    number
  isOpen:   boolean
  onToggle: () => void
}

function FAQRow({ item, index, isOpen, onToggle }: FAQRowProps) {
  const answerRef = useRef<HTMLDivElement>(null)

  /* Animate answer height avec CSS custom property ──────── */
  useEffect(() => {
    const el = answerRef.current
    if (!el) return
    if (isOpen) {
      el.style.setProperty('--answer-h', `${el.scrollHeight}px`)
    } else {
      el.style.setProperty('--answer-h', '0px')
    }
  }, [isOpen])

  const numStr = String(index + 1).padStart(2, '0')

  return (
    <li className={`${styles.row} ${isOpen ? styles.rowOpen : ''}`}>
      <button
        className={styles.rowBtn}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-q-${item.id}`}
      >
        {/* Numéro */}
        <span className={styles.rowNum} aria-hidden>{numStr}</span>

        {/* Question */}
        <span className={styles.rowQuestion}>{item.question}</span>

        {/* Icône +/− */}
        <span className={styles.rowIcon} aria-hidden>
          <span className={`${styles.iconBar} ${styles.iconH}`} />
          <span
            className={`${styles.iconBar} ${styles.iconV} ${isOpen ? styles.iconVOpen : ''}`}
          />
        </span>
      </button>

      {/* Réponse — height animée via CSS var */}
      <div
        ref={answerRef}
        id={`faq-answer-${item.id}`}
        role="region"
        aria-labelledby={`faq-q-${item.id}`}
        className={styles.rowAnswer}
        style={{ '--answer-h': '0px' } as React.CSSProperties}
      >
        <div className={styles.rowAnswerInner}>
          <p className={styles.rowAnswerText}>{item.answer}</p>
        </div>
      </div>
    </li>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}