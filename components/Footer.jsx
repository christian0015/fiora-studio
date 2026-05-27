import Link from 'next/link'
import styles from './Footer.module.css'

const LINKS_SHOP = [
  { href: '/boutique',           label: 'Tous les bouquets' },
  { href: '/occasion/romantique', label: 'Occasions romantiques' },
  { href: '/occasion/anniversaire', label: 'Anniversaires' },
  { href: '/occasion/mariage',   label: 'Mariage' },
]

const LINKS_INFO = [
  { href: '/a-propos',           label: 'Notre histoire' },
  { href: '/a-propos#livraison', label: 'Livraison' },
  { href: '/a-propos#faq',       label: 'FAQ' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      {/* ── Top separator line ──────────────────────── */}
      <div className={styles.rule} aria-hidden />

      <div className={styles.inner}>
        {/* ── Brand col ─────────────────────────────── */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Flora Studio</span>
            <span className={styles.logoDot} aria-hidden />
          </Link>
          <p className={styles.tagline}>
            L'art des fleurs,<br />livré avec soin à Casablanca.
          </p>
          <a
            href="https://wa.me/212634699940"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waLink}
          >
            <WhatsAppIcon />
            Commander via WhatsApp
          </a>
        </div>

        {/* ── Nav cols ──────────────────────────────── */}
        <nav className={styles.navCols} aria-label="Liens du footer">
          <div className={styles.col}>
            <p className={styles.colTitle}>Boutique</p>
            <ul>
              {LINKS_SHOP.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={styles.colLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.colTitle}>Informations</p>
            <ul>
              {LINKS_INFO.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={styles.colLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* ── Bottom bar ──────────────────────────────── */}
      <div className={styles.bottom}>
        <p className={styles.copy}>
          © {year} Flora Studio — Casablanca. Tous droits réservés.
        </p>
        <div className={styles.socials}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
             className={styles.social} aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
             className={styles.social} aria-label="TikTok">
            <TikTokIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

/* ── Icons ──────────────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  )
}
