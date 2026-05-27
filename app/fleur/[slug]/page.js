import { getFlowers, getFlowerBySlug, getSimilarFlowers } from '@/libs/data'
import { notFound } from 'next/navigation'
import FleurPage from './FleurPage'

// Revalidation toutes les 10 minutes (ISR) pour refléter les changements de la DB en production
export const revalidate = 600

/* ── SSG — Adapté pour MongoDB ──────────────── */
export async function generateStaticParams() {
  // Récupération asynchrone de l'ensemble du catalogue pour générer les routes statiques
  const flowersList = await getFlowers()
  if (!Array.isArray(flowersList)) return []
  
  return flowersList.map(f => ({ slug: f.slug }))
}

/* ── Metadata dynamique ───────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params

  const flower = await getFlowerBySlug(slug)
  if (!flower) return {}

  return {
    title: flower.seo?.title || flower.name,
    description: flower.seo?.description || flower.shortDescription,
    keywords: flower.seo?.keywords || '',
    openGraph: {
      title: flower.seo?.title || flower.name,
      description: flower.seo?.description || flower.shortDescription,
      images: flower.images?.[0] ? [{ url: flower.images[0] }] : [],
    },
  }
}

/* ── Page ─────────────────────────────────────── */
export default async function Page({ params }) {
  const { slug } = await params

  // Récupération sécurisée du bouquet
  const flower = await getFlowerBySlug(slug)
  if (!flower) notFound()

  // Récupération sécurisée des bouquets similaires
  const similar = await getSimilarFlowers(flower, 4)

  return <FleurPage flower={flower} similar={similar} />
}