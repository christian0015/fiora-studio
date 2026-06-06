import { occasions, getOccasionBySlug, getOccasionFlowers } from '@/libs/data'
import { notFound } from 'next/navigation'
import OccasionPage from './OccasionPage'

// ISR : Revalidation toutes les 10 minutes pour synchroniser les modifications MongoDB
export const revalidate = 600

/* ── SSG : pré-génère toutes les occasions ──────────────────── */
// export async function generateStaticParams() {
//   return occasions.map(o => ({ type: o.slug }))
// }

/* ── Metadata dynamique ─────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { type } = await params

  const occ = getOccasionBySlug(type)
  if (!occ) return {}

  return {
    title: `${occ.label} — Fiora Casablanca`,
    description: occ.longDesc,
    keywords: [
      `fleurs ${occ.label.toLowerCase()} casablanca`,
      'bouquet maroc',
      'livraison fleurs casablanca'
    ],
  }
}

/* ── Page ───────────────────────────────────────────────────── */
export default async function Page({ params }) {
  const { type } = await params

  const occ = getOccasionBySlug(type)
  if (!occ) notFound()

  // Ajout du await indispensable car la fonction interroge désormais l'API de manière asynchrone
  const result = await getOccasionFlowers(type)
  
  // Normalisation pour garantir qu'on passe un tableau exploitable
  const flowersData = Array.isArray(result) ? result : (result?.data || [])
  const rest = occasions.filter(o => o.slug !== type)

  return (
    <OccasionPage
      occasion={occ}
      flowers={flowersData}
      otherOccasions={rest}
    />
  )
}