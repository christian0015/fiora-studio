import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

/* ─── Fonts ─────────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
})

/* ─── Metadata ───────────────────────────────────────── */
/* ─── Metadata ───────────────────────────────────────── */
export const metadata = {
  title: {
    default: 'Flora Studio — Fleurs de Prestige, Casablanca',
    template: '%s — Flora Studio',
  },

  description:
    "Bouquets d'exception préparés à la main et livrés le jour même à Casablanca. Offrez une intention, une émotion élégante.",

  keywords: [
    'fleurs Casablanca',
    'Flora Studio',
    'bouquets premium',
    'livraison fleurs Casablanca',
    'fleuriste Casablanca',
  ],

  authors: [{ name: 'Flora Studio' }],

  /* ─── Open Graph (Facebook, WhatsApp, LinkedIn) ─── */
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Flora Studio',
    title: 'Flora Studio — Fleurs de Prestige, Casablanca',
    description:
      "Bouquets d'exception livrés le jour même à Casablanca.",

    images: [
      {
        url: '/og/flora-studio-og.jpg', // image principale OG
        width: 1200,
        height: 630,
        alt: 'Flora Studio - Fleurs de prestige Casablanca',
      },
    ],
  },

  /* ─── Twitter / X Preview ─── */
  twitter: {
    card: 'summary_large_image',
    title: 'Flora Studio — Fleurs de Prestige, Casablanca',
    description:
      "Bouquets d'exception livrés le jour même à Casablanca.",
    images: ['/og/flora-studio-og.jpg'],
  },

  /* ─── Robots SEO ─── */
  robots: {
    index: true,
    follow: true,
  },

  /* ─── Icônes navigateur ─── */
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
  },

  /* ─── Base URL SEO ─── */
  metadataBase: new URL('https://flora-studio.com'), // à remplacer par ton vrai domaine

  alternates: {
    canonical: '/',
  },
}

/* ─── Layout ─────────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
