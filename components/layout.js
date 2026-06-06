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
export const metadata = {
  title: {
    default: 'Fiora Studio — Fleurs de Prestige, Casablanca',
    template: '%s — Fiora Studio',
  },
  description:
    'Bouquets d\'exception préparés à la main et livrés le jour même à Casablanca. Offrez une intention, une émotion élégante.',
  keywords: ['fleurs Casablanca', 'bouquets premium', 'livraison fleurs', 'fleuriste Casablanca'],
  authors: [{ name: 'Fiora Studio' }],
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Fiora Studio',
    title: 'Fiora Studio — Fleurs de Prestige, Casablanca',
    description: 'Bouquets d\'exception livrés le jour même à Casablanca.',
  },
  robots: { index: true, follow: true },
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
