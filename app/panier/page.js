'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/libs/data'
import {
  getI18n,
  getEnabledPaymentMethods,
  getEnabledShippingMethods,
  getShippingFee,
  isCODAvailable,
  OWNER_WHATSAPP,
  createOrder,
} from '@/libs/checkout'
import { useCartStore } from '@/libs/cart'
import styles from './panier.module.css'

const LOCALE_OPTIONS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English'  },
  { code: 'ar', label: 'العربية'  },
]
const PAYMENT_ICONS = {
  cash_on_delivery: '◎',
  bank_transfer:    '◇',
  western_union:    '◈',
  whatsapp:         '◉',
}
const TRUST_MINI = [
  { key: 'q', icon: '◈', label: 'Qualité premium'    },
  { key: 'd', icon: '◎', label: 'Livraison jour même' },
  { key: 'b', icon: '△', label: 'Bouquet à la main'  },
]

export default function PanierPage() {
  const rootRef = useRef(null)
  const ctxRef  = useRef(null)
  const [locale,     setLocale]     = useState('fr')
  const items      = useCartStore(s => s.items)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQty  = useCartStore(s => s.updateQty)
  const clearCart  = useCartStore(s => s.clearCart)
  const t = getI18n(locale)

  const [payMethod,  setPayMethod]  = useState(null)
  const [shipMethod, setShipMethod] = useState('casablanca_short')
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [address,    setAddress]    = useState('')
  const [note,       setNote]       = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [ordered,    setOrdered]    = useState(false)
  const [orderRef,   setOrderRef]   = useState('')
  const [orderedPayMethod, setOrderedPayMethod] = useState(null)
  const [error,      setError]      = useState('')

  const deliveryFee = getShippingFee(shipMethod)
  const subtotal = items.reduce((acc, it) =>
    acc + (it.selectedSize?.price ?? it.price) * it.qty, 0)
  const total = subtotal + deliveryFee
  const isEmpty = items.length === 0
  const enabledPayMethods  = getEnabledPaymentMethods()
  const enabledShipMethods = getEnabledShippingMethods()

  const isPayMethodAvailable = (methodId) => {
    if (methodId === 'cash_on_delivery') return isCODAvailable(total)
    return true
  }

  useEffect(() => {
    async function init() {
      const { default: gsap } = await import('gsap')
      if (!rootRef.current) return
      ctxRef.current = gsap.context(() => {
        gsap.fromTo('[data-cart="row"]',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.1 })
        gsap.fromTo('[data-cart="summary"]',
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.25 })
      }, rootRef.current)
    }
    init()
    return () => ctxRef.current?.revert()
  }, [])

  const buildOrderPayload = useCallback(() => ({
    customer: { firstName, lastName, email, phone, address, locale },
    items: items.map(it => ({
      flowerId:   it.id ?? it._id ?? '',
      slug:       it.slug ?? '',
      name:       it.name,
      image:      it.images?.[0] ?? '',
      price:      it.selectedSize?.price ?? it.price,
      qty:        it.qty,
      size:       it.selectedSize?.label  ?? null,
      sizeHeight: it.selectedSize?.height ?? null,
    })),
    subtotal,
    deliveryFee,
    total,
    shippingMethod: shipMethod,
    paymentMethod:  payMethod,
    paymentRef,
    note,
  }), [firstName, lastName, email, phone, address, locale,
       items, subtotal, deliveryFee, total, shipMethod, payMethod, paymentRef, note])

  const buildWaText = useCallback(() => {
    const lines = items.map(it =>
      `• ${it.name}${it.selectedSize ? ` (${it.selectedSize.label})` : ''} x${it.qty}  ->  ${formatPrice((it.selectedSize?.price ?? it.price) * it.qty)}`
    ).join('\n')
    const clientLine = (firstName || phone)
      ? `\nClient : ${[firstName, lastName].filter(Boolean).join(' ')}${phone ? ' | ' + phone : ''}`
      : ''
    return encodeURIComponent(
      `Bonjour Flora *\n\nCommande :\n\n${lines}\n\nSous-total : ${formatPrice(subtotal)}\nLivraison : ${formatPrice(deliveryFee)}\nTotal : ${formatPrice(total)}${clientLine}\nAdresse : ${address || 'a preciser'}\n${note ? '\nNote : ' + note : ''}\n\nMerci !`
    )
  }, [items, subtotal, deliveryFee, total, firstName, lastName, phone, address, note])

  const handleConfirm = useCallback(async () => {
    if (!payMethod) return
    setError('')
    setLoading(true)
    try {
      // Toujours enregistrer la commande, y compris WhatsApp
      const result = await createOrder(buildOrderPayload())
      setOrderRef(result.reference || '')
      setOrderedPayMethod(payMethod)

      if (payMethod === 'whatsapp') {
        window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${buildWaText()}`, '_blank')
      }

      clearCart()
      setOrdered(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Reessayez.')
    } finally {
      setLoading(false)
    }
  }, [payMethod, buildOrderPayload, buildWaText, clearCart])

  /* ── Confirmation ───────────────────────────────────────── */
  if (ordered) return (
    <div className={styles.confirm} dir={t.dir}>
      <span className={styles.confirmIcon} aria-hidden>◈</span>
      <h1 className={styles.confirmTitle}>{t.orderReceived}</h1>
      {orderRef && (
        <p className={styles.confirmRef}>
          {locale === 'ar' ? 'المرجع' : locale === 'en' ? 'Reference' : 'Ref.'} &nbsp;
          <strong>{orderRef}</strong>
        </p>
      )}
      <p className={styles.confirmSub}>{t.orderConfirmed}</p>
      {orderedPayMethod === 'whatsapp' && (
        <p className={styles.confirmWaNote}>
          {locale === 'ar'
            ? 'تم فتح واتساب. أرسل الرسالة لتأكيد الطلب.'
            : locale === 'en'
              ? 'WhatsApp was opened — send the message to finalize.'
              : 'WhatsApp a ete ouvert — envoyez le message pour finaliser.'}
        </p>
      )}
      <Link href="/" className={styles.confirmLink}>{t.backHome}</Link>
    </div>
  )

  /* ── Panier vide ─────────────────────────────────────────── */
  if (isEmpty) return (
    <div className={styles.empty} dir={t.dir}>
      <span className={styles.emptyGlyph} aria-hidden>◇</span>
      <h1 className={styles.emptyTitle}>{t.orderEmpty}</h1>
      <p className={styles.emptySub}>{t.orderEmptySub}</p>
      <Link href="/boutique" className={styles.emptyLink}>{t.explore}</Link>
    </div>
  )

  const instructionsText = (payMethod && payMethod !== 'whatsapp')
    ? t.paymentInstructions?.[payMethod]
    : null

  return (
    <div className={styles.root} ref={rootRef} dir={t.dir}>

      <div className={styles.topBar}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Flora</Link>
          <span className={styles.breadSep}>·</span>
          <span className={styles.breadCurrent}>{t.cart}</span>
        </nav>
        <div className={styles.localeSwitcher} role="group">
          {LOCALE_OPTIONS.map(l => (
            <button key={l.code}
              className={`${styles.localeBtn} ${locale === l.code ? styles.localeBtnActive : ''}`}
              onClick={() => setLocale(l.code)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <h1 className={styles.title}>
        <em>{t.cart}</em>
        <span className={styles.titleCount}>{t.articles(items.length)}</span>
      </h1>

      <div className={styles.layout}>

        {/* ══ LISTE ════════════════════════════════════════════ */}
        <div className={styles.itemsList}>
          {items.map(item => (
            <CartRow
              key={`${item.id}-${item.selectedSize?.label}`}
              item={item}
              onRemove={() => removeItem(item.id, item.selectedSize?.label)}
              onQty={(q) => updateQty(item.id, item.selectedSize?.label, q)}
            />
          ))}
          <button className={styles.clearBtn} onClick={clearCart}>{t.clearCart}</button>
        </div>

        {/* ══ SUMMARY ══════════════════════════════════════════ */}
        <aside data-cart="summary" className={styles.summary}>

          <div className={styles.summaryBlock}>
            <div className={styles.summaryRow}>
              <span>{t.subtotal}</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t.delivery}</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : '—'}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>{t.total}</span><span>{formatPrice(total)}</span>
            </div>
            <p className={styles.deliveryDeadline}>{t.deliveryDeadline}</p>
          </div>

          {/* ── Livraison ──────────────────────────────────── */}
          <div className={styles.modeBlock}>
            <p className={styles.modeTitle}>{t.shippingMethod}</p>
            <div className={styles.modeOptions} role="radiogroup">
              {enabledShipMethods.map(m => (
                <button key={m.id} role="radio" aria-checked={shipMethod === m.id}
                  className={`${styles.modeBtn} ${shipMethod === m.id ? styles.modeBtnActive : ''}`}
                  onClick={() => setShipMethod(m.id)}>
                  <span className={styles.modeBtnIcon}>◎</span>
                  <div className={styles.modeBtnText}>
                    <span className={styles.modeBtnLabel}>{m.label[locale] || m.label.fr}</span>
                    <span className={styles.modeBtnSub}>{m.note[locale] || m.note.fr}</span>
                  </div>
                  <span className={styles.modeBtnFee}>{formatPrice(m.fee)}</span>
                  <span className={styles.modeBtnRadio} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Paiement ──────────────────────────────────── */}
          <div className={styles.modeBlock}>
            <p className={styles.modeTitle}>{t.paymentMethod}</p>
            <div className={styles.modeOptions} role="radiogroup">
              {enabledPayMethods.map(m => {
                const available = isPayMethodAvailable(m.id)
                return (
                  <button key={m.id} role="radio" aria-checked={payMethod === m.id}
                    disabled={!available}
                    className={[
                      styles.modeBtn,
                      payMethod === m.id ? styles.modeBtnActive : '',
                      !available ? styles.modeBtnDisabledOption : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => available && setPayMethod(m.id)}>
                    <span className={styles.modeBtnIcon}>{PAYMENT_ICONS[m.id] ?? '◇'}</span>
                    <div className={styles.modeBtnText}>
                      <span className={styles.modeBtnLabel}>{t.paymentLabels?.[m.id] ?? m.id}</span>
                      <span className={styles.modeBtnSub}>{t.paymentSubs?.[m.id] ?? ''}</span>
                    </div>
                    <span className={styles.modeBtnRadio} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Instructions ──────────────────────────────── */}
          {instructionsText && (
            <div className={styles.payInstructions}>
              <pre>{instructionsText.trim()}</pre>
            </div>
          )}

          {/* ── Champ MTCN ────────────────────────────────── */}
          {payMethod === 'western_union' && (
            <div className={styles.formBlock}>
              <label className={styles.fieldLabel}>
                MTCN (tracking number)
                <input className={styles.field} type="text"
                  placeholder="Ex : 123-456-7890"
                  value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
              </label>
            </div>
          )}

          {/* ── Ref virement ──────────────────────────────── */}
          {payMethod === 'bank_transfer' && (
            <div className={styles.formBlock}>
              <label className={styles.fieldLabel}>
                {locale === 'ar' ? 'مرجع التحويل' : locale === 'en' ? 'Transfer reference' : 'Reference virement'}
                <input className={styles.field} type="text"
                  placeholder={locale === 'en' ? 'Confirmation number' : 'Numero de confirmation'}
                  value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
              </label>
            </div>
          )}

          {/* ── WhatsApp hint ─────────────────────────────── */}
          {payMethod === 'whatsapp' && (
            <div className={styles.waHint}>
              <WaIcon />
              <p>
                {locale === 'ar'
                  ? 'سيتم حفظ طلبك وفتح واتساب مع رسالة جاهزة لتأكيد التسليم.'
                  : locale === 'en'
                    ? 'Your order will be saved, then WhatsApp will open with a pre-filled message.'
                    : 'Votre commande sera enregistree, puis WhatsApp s\'ouvrira avec un message pre-rempli.'}
              </p>
            </div>
          )}

          {/* ── Formulaire client ─────────────────────────── */}
          {payMethod && (
            <div className={styles.formBlock}>
              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>
                  {t.firstName}
                  <input className={styles.field} type="text" value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Leila" autoComplete="given-name" />
                </label>
                <label className={styles.fieldLabel}>
                  {t.lastName}
                  <input className={styles.field} type="text" value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Benali" autoComplete="family-name" />
                </label>
              </div>
              <label className={styles.fieldLabel}>
                {t.email}
                <input className={styles.field} type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="leila@exemple.ma" autoComplete="email" />
              </label>
              <label className={styles.fieldLabel}>
                {t.phone}
                <input className={styles.field} type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 XX XX XX XX" autoComplete="tel" />
              </label>
              <label className={styles.fieldLabel}>
                {t.address}
                <input className={styles.field} type="text" value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Adresse complete, Casablanca"
                  autoComplete="street-address" />
              </label>
              <label className={styles.fieldLabel}>
                {t.note}
                <textarea className={`${styles.field} ${styles.fieldTextarea}`}
                  placeholder={t.notePlaceholder}
                  value={note} onChange={e => setNote(e.target.value)} rows={3} />
              </label>
            </div>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            className={`${styles.confirmBtn} ${(!payMethod || loading) ? styles.confirmBtnDisabled : ''}`}
            onClick={handleConfirm}
            disabled={!payMethod || loading}>
            {loading
              ? <><Spinner />{locale === 'ar' ? ' جارٍ…' : locale === 'en' ? ' Processing…' : ' Enregistrement…'}</>
              : !payMethod
                ? t.chooseMethod
                : payMethod === 'whatsapp'
                  ? <><WaIcon /> {t.confirmWa}</>
                  : t.confirm(formatPrice(total))}
          </button>

          <div className={styles.trustMini}>
            {TRUST_MINI.map(tr => (
              <span key={tr.key} className={styles.trustMiniItem}>
                <span aria-hidden>{tr.icon}</span>{tr.label}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function CartRow({ item, onRemove, onQty }) {
  const unitPrice = item.selectedSize?.price ?? item.price
  return (
    <div data-cart="row" className={styles.row}>
      <div className={styles.rowImg}>
        <Image src={item.images?.[0] ?? '/images/placeholder.jpg'} alt={item.name}
          fill sizes="88px" className={styles.rowImgEl} />
      </div>
      <div className={styles.rowInfo}>
        <Link href={`/fleur/${item.slug}`} className={styles.rowName}>{item.name}</Link>
        {item.selectedSize && (
          <span className={styles.rowSize}>{item.selectedSize.label} · {item.selectedSize.height}</span>
        )}
        <span className={styles.rowUnitPrice}>{formatPrice(unitPrice)} / unite</span>
      </div>
      <div className={styles.rowQty}>
        <button className={styles.qtyBtn} onClick={() => onQty(Math.max(1, item.qty - 1))}
          disabled={item.qty <= 1}>−</button>
        <span className={styles.qtyVal} aria-live="polite">{item.qty}</span>
        <button className={styles.qtyBtn} onClick={() => onQty(item.qty + 1)}>+</button>
      </div>
      <span className={styles.rowTotal}>{formatPrice(unitPrice * item.qty)}</span>
      <button className={styles.rowRemove} onClick={onRemove}><TrashIcon /></button>
    </div>
  )
}

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
function Spinner() {
  return (
    <svg className={styles.spinner} width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}