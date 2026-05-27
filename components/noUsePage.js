import Hero from './Hero'

export const metadata = {
  title: 'Flora — Fleurs de Prestige, Casablanca',
  description:
    'Bouquets d\'exception préparés à la main et livrés le jour même à Casablanca. Offrez une intention, une émotion élégante.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      {/*
        Prochaines sections à ajouter ici dans l'ordre :
        <OccasionGrid />        – Explorer par émotion
        <FloralExperience />    – Section 3D sombre (wow premium)
        <FeaturedFlowers />     – Fleurs populaires
        <TrustSection />        – Livraison, qualité, rapidité
      */}
    </>
  )
}
