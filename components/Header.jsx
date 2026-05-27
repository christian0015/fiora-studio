'use client'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/libs/cart'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Header.module.css'

const NAV_LINKS = [
  { href: '/',            label: 'Acceuil'  },
  { href: '/boutique',            label: 'Boutique'  },
  { href: '/occasion/romantique', label: 'Occasions' },
  { href: '/a-propos',            label: 'À propos'  },
]

export default function Header() {
  const pathname = usePathname()

  /* Active le glass immédiatement sur /occasion/[type] */
  const isOccasionPage = pathname?.startsWith('/occasion/')

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  const cartCountRaw = useCartStore(state => state.totalQty())
  const cartCount    = mounted ? cartCountRaw : 0
  const headerRef    = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  /* glass = scroll OU page occasion */
  const glassActive = scrolled || isOccasionPage

  return (
    <>
      <header
        ref={headerRef}
        className={[
          styles.header,
          glassActive ? styles.glass    : '',
          menuOpen    ? styles.menuOpen : '',
        ].filter(Boolean).join(' ')}
        aria-label="Navigation principale"
      >
        <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoText}>Flora Studio</span>
          <span className={styles.logoDot} aria-hidden />
        </Link>

        <nav className={styles.nav} aria-label="Menu principal">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            href="https://wa.me/212634699940"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            aria-label="Commander via WhatsApp"
          >
            <WhatsAppIcon />
          </a>

          <Link href="/panier" className={styles.actionBtn}
                aria-label={`Panier (${cartCount} articles)`}>
            <BagIcon />
            {cartCount > 0 && (
              <span className={styles.badge} aria-live="polite">{cartCount}</span>
            )}
          </Link>

          <button
            className={styles.burger}
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerTop    : ''}`} />
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerBottom : ''}`} />
          </button>
        </div>
      </header>

      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      <nav
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-label="Menu mobile"
        aria-hidden={!menuOpen}
      >
        <div className={styles.drawerInner}>
          {NAV_LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              className={styles.drawerLink}
              style={{ '--i': i }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://wa.me/212634699940"
            className={styles.drawerWa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Commander via WhatsApp →
          </a>
        </div>
      </nav>
    </>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}