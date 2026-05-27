'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice, siteConfig } from '@/libs/data'
import { useCartStore } from '@/libs/cart'
import styles from './panier.module.css'

/* ═══════════════════════════════════════════════════════════════
   PANIER PAGE
   Simple. Lisible. Trois modes de commande.
   ═══════════════════════════════════════════════════════════════ */
export default function PanierPage() {
  const rootRef = useRef(null)
  const ctxRef  = useRef(null)

  const items       = useCartStore(s => s.items)
  const removeItem  = useCartStore(s => s.removeItem)
  const updateQty   = useCartStore(s => s.updateQty)
  const clearCart   = useCartStore(s => s.clearCart)

  const [mode,    setMode]    = useState(null)     // 'livraison' | 'online' | 'whatsapp'
  const [phone,   setPhone]   = useState('')
  const [address, setAddress] = useState('')
  const [note,    setNote]    = useState('')
  const [ordered, setOrdered] = useState(false)

  const router   = useRouter()
  const isEmpty  = items.length === 0

  const total = items.reduce((acc, it) =>
    acc + (it.selectedSize?.price ?? it.price) * it.qty, 0)

  /* ── Entrance ─────────────────────────────────────────────── */
  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      if (!rootRef.current) return
      ctxRef.current = gsap.context(() => {
        gsap.from('[data-cart="row"]', {
          y: 28, opacity: 0,
          stagger: 0.08, duration: 0.65,
          ease: 'power3.out', delay: 0.1,
        })
        gsap.from('[data-cart="summary"]', {
          y: 32, opacity: 0, duration: 0.7,
          ease: 'power3.out', delay: 0.3,
        })
      }, rootRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  /* ── WhatsApp message ─────────────────────────────────────── */
  const buildWaText = useCallback(() => {
    const lines = items.map(it =>
      `• ${it.name} (${it.selectedSize?.label ?? ''}) × ${it.qty}  →  ${formatPrice((it.selectedSize?.price ?? it.price) * it.qty)}`
    ).join('\n')
    return encodeURIComponent(
      `Bonjour Flora 🌸\n\nJe souhaite passer commande :\n\n${lines}\n\nTotal : ${formatPrice(total)}\n\nAdresse : ${address || '(à préciser)'}\nTél : ${phone || '(à préciser)'}\n${note ? `\nNote : ${note}` : ''}\n\nMerci !`
    )
  }, [items, total, address, phone, note])

  /* ── Confirmation ─────────────────────────────────────────── */
  const handleConfirm = useCallback(() => {
    if (mode === 'whatsapp') {
      window.open(`https://wa.me/${siteConfig.whatsapp}?text=${buildWaText()}`, '_blank')
      return
    }
    // Livraison / online → mock confirmation
    setOrdered(true)
    clearCart()
  }, [mode, buildWaText, clearCart])

  /* ─── Écran confirmation ────────────────────────────────── */
  if (ordered) {
    return (
      <div className={styles.confirm}>
        <span className={styles.confirmIcon} aria-hidden>◈</span>
        <h1 className={styles.confirmTitle}>Commande reçue</h1>
        <p className={styles.confirmSub}>
          Nous vous contacterons très bientôt pour confirmer la livraison.
        </p>
        <Link href="/" className={styles.confirmLink}>
          Retour à l'accueil →
        </Link>
      </div>
    )
  }

  /* ─── Panier vide ───────────────────────────────────────── */
  if (isEmpty) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyGlyph} aria-hidden>◇</span>
        <h1 className={styles.emptyTitle}>Votre panier est vide</h1>
        <p className={styles.emptySub}>
          Découvrez nos bouquets et trouvez celui qui exprime ce que vous ressentez.
        </p>
        <Link href="/boutique" className={styles.emptyLink}>
          Explorer la boutique →
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.root} ref={rootRef}>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
        <Link href="/"         className={styles.breadLink}>Flora</Link>
        <span className={styles.breadSep} aria-hidden>·</span>
        <span className={styles.breadCurrent}>Panier</span>
      </nav>

      <h1 className={styles.title}>
        Votre <em>panier</em>
        <span className={styles.titleCount}>{items.length} article{items.length > 1 ? 's' : ''}</span>
      </h1>

      <div className={styles.layout}>

        {/* ══ LISTE ══════════════════════════════════════════ */}
        <div className={styles.itemsList}>
          {items.map(item => (
            <CartRow
              key={`${item.id}-${item.selectedSize?.label}`}
              item={item}
              onRemove={() => removeItem(item.id, item.selectedSize?.label)}
              onQty={(q) => updateQty(item.id, item.selectedSize?.label, q)}
            />
          ))}

          {/* Vider le panier */}
          <button
            className={styles.clearBtn}
            onClick={clearCart}
            aria-label="Vider le panier"
          >
            Vider le panier
          </button>
        </div>

        {/* ══ RÉCAPITULATIF + COMMANDE ═════════════════════ */}
        <aside data-cart="summary" className={styles.summary}>

          {/* Total */}
          <div className={styles.summaryBlock}>
            <div className={styles.summaryRow}>
              <span>Sous-total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Livraison</span>
              <span className={styles.summaryFree}>Gratuite</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className={styles.summaryNote}>{siteConfig.deliveryNote}</p>
          </div>

          {/* ── Sélecteur de mode ─────────────────────────── */}
          <div className={styles.modeBlock}>
            <p className={styles.modeTitle}>Comment souhaitez-vous commander ?</p>

            <div className={styles.modeOptions} role="radiogroup" aria-label="Mode de commande">
              {ORDER_MODES.map(m => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={mode === m.id}
                  className={`${styles.modeBtn} ${mode === m.id ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  <span className={styles.modeBtnIcon} aria-hidden>{m.icon}</span>
                  <div className={styles.modeBtnText}>
                    <span className={styles.modeBtnLabel}>{m.label}</span>
                    <span className={styles.modeBtnSub}>{m.sub}</span>
                  </div>
                  <span className={styles.modeBtnRadio} aria-hidden />
                </button>
              ))}
            </div>
          </div>

          {/* ── Champs commun (livraison + online) ─────────── */}
          {mode && mode !== 'whatsapp' && (
            <div className={styles.formBlock}>
              <label className={styles.fieldLabel}>
                Adresse de livraison
                <input
                  className={styles.field}
                  type="text"
                  placeholder="Adresse complète, Casablanca"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
              </label>
              <label className={styles.fieldLabel}>
                Téléphone
                <input
                  className={styles.field}
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className={styles.fieldLabel}>
                Note (optionnel)
                <textarea
                  className={`${styles.field} ${styles.fieldTextarea}`}
                  placeholder="Un message pour le destinataire, une heure préférée…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                />
              </label>
            </div>
          )}

          {/* ── WhatsApp : message pré-rempli ─────────────── */}
          {mode === 'whatsapp' && (
            <div className={styles.waHint}>
              <WaIcon />
              <p>
                Un message avec votre panier sera pré-rempli sur WhatsApp.
                Vous pourrez préciser votre adresse directement dans la conversation.
              </p>
            </div>
          )}

          {/* ── CTA ────────────────────────────────────────── */}
          <button
            className={`${styles.confirmBtn} ${!mode ? styles.confirmBtnDisabled : ''}`}
            onClick={handleConfirm}
            disabled={!mode}
            aria-disabled={!mode}
          >
            {!mode
              ? 'Choisissez un mode de commande'
              : mode === 'whatsapp'
                ? <><WaIcon /> Ouvrir WhatsApp</>
                : `Confirmer la commande — ${formatPrice(total)}`
            }
          </button>

          {/* Trust micro */}
          <div className={styles.trustMini}>
            {TRUST_MINI.map(t => (
              <span key={t.label} className={styles.trustMiniItem}>
                <span aria-hidden>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─── Cart Row ──────────────────────────────────────────────── */
function CartRow({ item, onRemove, onQty }) {
  const unitPrice = item.selectedSize?.price ?? item.price
  const lineTotal = unitPrice * item.qty

  return (
    <div data-cart="row" className={styles.row}>
      {/* Image */}
      <div className={styles.rowImg}>
        <Image
          src={item.images?.[0] ?? '/images/placeholder.jpg'}
          alt={item.name}
          fill
          sizes="88px"
          className={styles.rowImgEl}
        />
      </div>

      {/* Info */}
      <div className={styles.rowInfo}>
        <Link href={`/fleur/${item.slug}`} className={styles.rowName}>
          {item.name}
        </Link>
        {item.selectedSize && (
          <span className={styles.rowSize}>{item.selectedSize.label} · {item.selectedSize.height}</span>
        )}
        <span className={styles.rowUnitPrice}>{formatPrice(unitPrice)} / unité</span>
      </div>

      {/* Qty */}
      <div className={styles.rowQty}>
        <button
          className={styles.qtyBtn}
          onClick={() => onQty(Math.max(1, item.qty - 1))}
          aria-label="Diminuer"
          disabled={item.qty <= 1}
        >−</button>
        <span className={styles.qtyVal} aria-live="polite">{item.qty}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => onQty(item.qty + 1)}
          aria-label="Augmenter"
        >+</button>
      </div>

      {/* Prix ligne */}
      <span className={styles.rowTotal}>{formatPrice(lineTotal)}</span>

      {/* Supprimer */}
      <button
        className={styles.rowRemove}
        onClick={onRemove}
        aria-label={`Retirer ${item.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

/* ── Données statiques ───────────────────────────────────────── */
const ORDER_MODES = [
  {
    id:    'livraison',
    icon:  '◎',
    label: 'Paiement à la livraison',
    sub:   'Payez en cash à réception · Casablanca',
  },
  {
    id:    'online',
    icon:  '◇',
    label: 'Paiement en ligne',
    sub:   'Carte bancaire sécurisée',
  },
  {
    id:    'whatsapp',
    icon:  '◈',
    label: 'Commander via WhatsApp',
    sub:   'On s\'occupe de tout avec vous directement',
  },
]

const TRUST_MINI = [
  { icon: '◈', label: 'Qualité premium' },
  { icon: '◎', label: 'Livraison jour même' },
  { icon: '△', label: 'Bouquet à la main' },
]

/* ── Icônes ──────────────────────────────────────────────────── */
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  )
}
function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}
