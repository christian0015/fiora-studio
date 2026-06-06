// 'use client'
import { Suspense } from 'react'
import BoutiqueClient from './BoutiqueClient'

export const metadata = {
  title: 'Boutique — Fiora Casablanca',
  description:
    'Explorez notre catalogue de bouquets premium. Roses, pivoines, orchidées — livrés le jour même à Casablanca.',
}

export default function BoutiquePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <BoutiqueClient />
    </Suspense>
  )
}
