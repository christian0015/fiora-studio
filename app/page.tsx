import Hero from '@/components/Hero'
import FloralExperience from '@/components/FloralExperience'
import FloralExperience3D from '@/components/FloralExperience3D'
import OccasionGrid from '@/components/OccasionGrid'
import FeaturedFlowers from '@/components/FeaturedFlowers'
import FeaturedFlowers02 from '@/components/FeaturedFlowers02'
import ExploreFlowers from '@/components/ExploreFlowers'
import TrustSection from '@/components/TrustSection'
import FAQ from '@/components/FAQ'

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
        url: '/flora-studio-og.png', // image principale OG
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
    images: ['/flora-studio-og.png'],
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
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },

  /* ─── Base URL SEO ─── */
  metadataBase: new URL('https://flora-studio-ma.vercel.app'), // à remplacer par ton vrai domaine

  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      
        {/* Prochaines sections à ajouter ici dans l'ordre : */}
         {/*– Section 3D sombre (wow premium) */}       
        <FloralExperience />

        {/*– Fleurs populaires */}
        <FeaturedFlowers />     
        
        <ExploreFlowers />
        

        {/*– Explorer par émotion */}
        <OccasionGrid />
        
        <FloralExperience3D />

        <FeaturedFlowers02 />     


        {/*– Livraison, qualité, rapidité */}
        <TrustSection />      
          {/*- Qestions  */}
        <FAQ/>  
     
    </>
  )
}
