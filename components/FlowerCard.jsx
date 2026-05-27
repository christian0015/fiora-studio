'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, getTopEmotions, siteConfig } from '@/libs/data'
import { useCartStore } from '@/libs/cart'
import styles from './FlowerCard.module.css'

/**
 * FlowerCard — carte produit réutilisable
 * Props :
 * flower   : objet fleur complet (depuis data.js)
 * priority : boolean (LCP hint pour Next/Image)
 * variant  : 'default' | 'compact' | 'featured'
 */
export default function FlowerCard({ flower, priority = false, variant = 'default' }) {
  const [imgLoaded,  setImgLoaded]  = useState(false)
  const [hovered,    setHovered]    = useState(false)
  const [addedAnim,  setAddedAnim]  = useState(false)

  const addToCart = useCartStore(s => s.addItem)

  const topEmotions  = getTopEmotions(flower, 2)
  const mainEmotion  = topEmotions[0]
  const isOutOfStock = flower.stock === 0

  // Sécurisation du prix à afficher dans le message WhatsApp
  const displayPrice = flower.sizes?.[0]?.price ?? flower.price ?? 0

  const handleAddToCart = useCallback((e) => {
    e.preventDefault()
    if (isOutOfStock) return
    // Ajoute la taille sélectionnée si elle existe, sinon crée un fallback
    const selectedSize = flower.sizes?.[0] ?? { label: 'Standard', price: flower.price }
    addToCart({ ...flower, selectedSize })
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 1600)
  }, [flower, isOutOfStock, addToCart])

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    `Bonjour, je souhaite commander : ${flower.name} (${formatPrice(displayPrice)})`
  )}`

  return (
    <article
      className={`${styles.card} ${styles[`variant-${variant}`] ?? ''} ${hovered ? styles.cardHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={flower.name}
    >
      {/* ── Image ──────────────────────────────────── */}
      <Link
        href={`/fleur/${flower.slug}`}
        className={styles.imageWrap}
        aria-label={`Voir ${flower.name}`}
        tabIndex={-1}
      >
        {/* Badges */}
        <div className={styles.badges} aria-label="Badges produit">
          {flower.premium && (
            <span className={styles.badgePremium}>Premium</span>
          )}
          {flower.oldPrice && (
            <span className={styles.badgeSale}>
              -{Math.round((1 - flower.price / flower.oldPrice) * 100)}%
            </span>
          )}
          {isOutOfStock && (
            <span className={styles.badgeOut}>Rupture</span>
          )}
        </div>

        {/* Image principale */}
        <div className={`${styles.imageContainer} ${imgLoaded ? styles.imageLoaded : ''}`}>
          {flower.images?.[0] && (
            <Image
              src={flower.images[0]}
              alt={flower.name}
              fill
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 40vw, 280px"
              className={styles.image}
              priority={priority}
              onLoad={() => setImgLoaded(true)}
            />
          )}
          {/* Hover : deuxième image si disponible */}
          {flower.images?.[1] && (
            <Image
              src={flower.images[1]}
              alt={`${flower.name} — vue 2`}
              fill
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 40vw, 280px"
              className={`${styles.image} ${styles.imageHover}`}
              aria-hidden
            />
          )}
        </div>

        {/* Émotion dominante */}
        {mainEmotion && (
          <div className={styles.emotionOverlay} aria-hidden>
            <span className={styles.emotionBar}>
              <span
                className={styles.emotionFill}
                style={{ width: `${mainEmotion.percentage}%` }}
              />
            </span>
            <span className={styles.emotionName}>{mainEmotion.name}</span>
          </div>
        )}
      </Link>

      {/* ── Corps ──────────────────────────────────── */}
      <div className={styles.body}>
        {/* Rating discret */}
        {flower.rating && (
          <div className={styles.ratingRow} aria-label={`Note : ${flower.rating}/5`}>
            <StarIcon />
            <span className={styles.ratingVal}>{flower.rating}</span>
            <span className={styles.ratingCount}>({flower.reviews})</span>
          </div>
        )}

        {/* Nom */}
        <Link href={`/fleur/${flower.slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{flower.name}</h3>
        </Link>

        {/* Description courte */}
        <p className={styles.desc}>{flower.shortDescription}</p>

        {/* Émotions pills */}
        <div className={styles.emotions} aria-label="Émotions transmises">
          {topEmotions?.map(e => (
            <span key={e.name} className={styles.emotionPill}>
              {e.name}
            </span>
          ))}
        </div>

        {/* Prix + actions */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(flower.price)}</span>
            {flower.oldPrice && (
              <span className={styles.oldPrice}>{formatPrice(flower.oldPrice)}</span>
            )}
          </div>

          <div className={styles.actions}>
            {/* Ajouter au panier */}
            <button
              className={`${styles.btnCart} ${addedAnim ? styles.btnCartAdded : ''} ${isOutOfStock ? styles.btnCartDisabled : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={addedAnim ? 'Ajouté !' : `Ajouter ${flower.name} au panier`}
              aria-live="polite"
            >
              {addedAnim ? <CheckIcon /> : <BagIcon />}
              <span className={styles.btnCartLabel}>
                {addedAnim ? 'Ajouté' : 'Ajouter'}
              </span>
            </button>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnWa}
              aria-label={`Commander ${flower.name} via WhatsApp`}
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Icônes ──────────────────────────────────────────────────── */
function BagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
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