/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Fiora — data.js  (source de vérité centrale)               ║
 * ║  Transition future : remplacer getXxx() par fetch('/api/xx') ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/* ─────────────────────────────────────────────────────────────
   SITE CONFIG
   ───────────────────────────────────────────────────────────── */
export const siteConfig = {
  name:        'Fiora Studio',
  tagline:     "L'art de l'émotion florale",
  city:        'Casablanca',
  currency:    'MAD',
  whatsapp:    '212634699940',
  deliveryFee: 0,          // gratuit dès maintenant
  deliveryNote:'Livraison gratuite à Casablanca · Même jour avant 17h',
  instagram:   'https://instagram.com/fiorastudio.casablanca',
  tiktok:      'https://tiktok.com/@fiorastudio.casablanca',
}

/* ─────────────────────────────────────────────────────────────
   OCCASIONS  (navigation + OccasionGrid)
   ───────────────────────────────────────────────────────────── */
export const occasions = [
  {
    slug:        'romantique',
    label:       'Romantique',
    description: 'Pour dire je t\'aime sans mots.',
    longDesc:    "Des compositions pensées pour les moments intimes. Chaque fleur choisie pour ce qu'elle exprime, pas pour ce qu'elle coûte.",
    accent:      '#c4857a',
    bgGradient:  'linear-gradient(135deg, #2a1515 0%, #3d1e1c 50%, #1e1210 100%)',
    count:       8,
    emotions:    ['amour', 'désir', 'tendresse', 'passion'],
  },
  {
    slug:        'anniversaire',
    label:       'Anniversaire',
    description: 'Célébrer avec grâce et générosité.',
    longDesc:    'Ni trop sobre, ni trop criard. Des bouquets qui marquent la date sans l\'oublier.',
    accent:      '#c9a96e',
    bgGradient:  'linear-gradient(135deg, #1e1a0e 0%, #2e2610 50%, #1a1508 100%)',
    count:       12,
    emotions:    ['joie', 'reconnaissance', 'célébration', 'élégance'],
  },
  {
    slug:        'mariage',
    label:       'Mariage',
    description: "L'élégance d'un seul et unique jour.",
    longDesc:    'Blancs, ivoires, dorés. Compositions intemporelles pour des moments qui ne le sont pas moins.',
    accent:      '#d8cfc2',
    bgGradient:  'linear-gradient(135deg, #1a1a16 0%, #28261e 50%, #141412 100%)',
    count:       6,
    emotions:    ['amour', 'élégance', 'pureté', 'solennité'],
  },
  {
    slug:        'excuses',
    label:       'Excuses',
    description: 'Les mots que les fleurs disent mieux.',
    longDesc:    'Sincères. Ni dramatiques, ni trop discrets. Un geste qui parle à la place.',
    accent:      '#8ba882',
    bgGradient:  'linear-gradient(135deg, #101810 0%, #18241a 50%, #0c1410 100%)',
    count:       5,
    emotions:    ['sincérité', 'tendresse', 'calme', 'espoir'],
  },
  {
    slug:        'elegance',
    label:       'Élégance',
    description: 'Offrir pour le plaisir de la beauté.',
    longDesc:    "Pas d'occasion particulière. Juste le goût du beau, et l'envie d'en faire cadeau.",
    accent:      '#b8a898',
    bgGradient:  'linear-gradient(135deg, #161412 0%, #221e1a 50%, #101010 100%)',
    count:       9,
    emotions:    ['élégance', 'raffinement', 'admiration', 'calme'],
  },
  {
    slug:        'entreprise',
    label:       'Entreprise',
    description: "L'art d'impressionner avec subtilité.",
    longDesc:    'Compositions sobres et structurées. Pour les inaugurations, réceptions et attentions professionnelles.',
    accent:      '#7a8c7a',
    bgGradient:  'linear-gradient(135deg, #101410 0%, #1a1e18 50%, #0e1210 100%)',
    count:       7,
    emotions:    ['prestige', 'élégance', 'sobriété', 'raffinement'],
  },
]

/* ─────────────────────────────────────────────────────────────
   PALETTE D'ÉMOTIONS  (toutes les émotions possibles du catalogue)
   Utilisée dans la section "personnaliser votre émotion"
   ───────────────────────────────────────────────────────────── */
export const allEmotions = [
  { name: 'amour',          label: 'Amour',          icon: '♡' },
  { name: 'élégance',       label: 'Élégance',        icon: '◇' },
  { name: 'tendresse',      label: 'Tendresse',       icon: '◎' },
  { name: 'calme',          label: 'Calme',           icon: '∼' },
  { name: 'joie',           label: 'Joie',            icon: '✦' },
  { name: 'passion',        label: 'Passion',         icon: '◈' },
  { name: 'désir',          label: 'Désir',           icon: '◉' },
  { name: 'sincérité',      label: 'Sincérité',       icon: '△' },
  { name: 'reconnaissance', label: 'Reconnaissance',  icon: '◑' },
  { name: 'prestige',       label: 'Prestige',        icon: '◆' },
  { name: 'pureté',         label: 'Pureté',          icon: '○' },
  { name: 'espoir',         label: 'Espoir',          icon: '∗' },
  { name: 'raffinement',    label: 'Raffinement',     icon: '◻' },
  { name: 'célébration',    label: 'Célébration',     icon: '✧' },
  { name: 'solennité',      label: 'Solennité',       icon: '▷' },
  { name: 'admiration',     label: 'Admiration',      icon: '◐' },
  { name: 'sobriété',       label: 'Sobriété',        icon: '—' },
]

/* ─────────────────────────────────────────────────────────────
   CATALOGUE FLEURS
   ───────────────────────────────────────────────────────────── */
export const flowers = [

  /* ── 1 ──────────────────────────────────────────────────── */
  {
    id:               1,
    slug:             'rose-eternelle-blanche',
    name:             'Rose Éternelle Blanche',
    shortDescription: 'Une composition florale élégante et apaisante pensée pour les moments sincères.',
    description:      "La Rose Éternelle Blanche incarne la pureté, le raffinement et les émotions délicates. Parfaite pour exprimer un geste élégant lors d'un anniversaire, d'un remerciement ou d'une attention romantique. Chaque bouquet est composé à la main le matin du jour de livraison.",
    price:            699,
    oldPrice:         799,
    currency:         'MAD',
    stock:            12,
    featured:         true,
    popular:          true,
    premium:          true,
    rating:           4.9,
    reviews:          48,
    category:         'rose',
    tags:             ['rose blanche', 'élégance', 'romantique', 'premium', 'casablanca', 'cadeau'],
    occasions:        ['romantique', 'anniversaire', 'mariage', 'remerciement'],
    emotions: [
      { name: 'amour',          percentage: 82 },
      { name: 'élégance',       percentage: 95 },
      { name: 'tendresse',      percentage: 70 },
      { name: 'pureté',         percentage: 90 },
      { name: 'calme',          percentage: 60 },
    ],
    sizes: [
      { label: 'Petit',  price: 699,  height: '25–30 cm', diameter: '15 cm' },
      { label: 'Moyen',  price: 999,  height: '38–45 cm', diameter: '22 cm' },
      { label: 'Grand',  price: 1499, height: '55–65 cm', diameter: '32 cm' },
    ],
    colors:  ['blanc', 'vert doux'],
    images: [
      '/images/flowers/rose-blanche-1.png',
      'https://i.etsystatic.com/24828604/r/il/7f058e/2486482234/il_fullxfull.2486482234_6ttn.jpg',
      'https://factorydirectcraft.com/mpix/osc_products/20210203105211-729219.jpg',
    ],
    seo: {
      title:       'Rose Éternelle Blanche | Livraison fleurs Casablanca',
      description: 'Bouquet premium de roses blanches disponible avec livraison rapide à Casablanca. Élégance florale moderne.',
      keywords:    ['fleur casablanca', 'rose blanche', 'livraison fleurs casablanca', 'bouquet romantique maroc'],
    },
  },

  /* ── 2 ──────────────────────────────────────────────────── */
  {
    id:               2,
    slug:             'pivoine-rose-signature',
    name:             'Pivoine Rose Signature',
    shortDescription: "L'opulence douce d'une fleur au parfum envoûtant.",
    description:      "La pivoine est la fleur de ceux qui n'ont pas besoin de crier pour être vus. Sa rondeur, son parfum délicat et ses pétales en couches créent une composition à la fois généreuse et raffinée. Incontournable pour un geste romantique ou un anniversaire marquant.",
    price:            850,
    currency:         'MAD',
    stock:            8,
    featured:         true,
    popular:          true,
    premium:          true,
    rating:           4.8,
    reviews:          34,
    category:         'pivoine',
    tags:             ['pivoine', 'rose pâle', 'romantique', 'parfum', 'luxe'],
    occasions:        ['romantique', 'anniversaire', 'mariage'],
    emotions: [
      { name: 'amour',          percentage: 95 },
      { name: 'désir',          percentage: 78 },
      { name: 'tendresse',      percentage: 88 },
      { name: 'élégance',       percentage: 80 },
      { name: 'raffinement',    percentage: 75 },
    ],
    sizes: [
      { label: 'Petit',  price: 850,  height: '28–34 cm', diameter: '18 cm' },
      { label: 'Moyen',  price: 1199, height: '40–48 cm', diameter: '25 cm' },
      { label: 'Grand',  price: 1799, height: '58–68 cm', diameter: '35 cm' },
    ],
    colors:  ['rose poudré', 'blanc crème', 'feuillage vert'],
    images: [
      'https://le-dahlia-noir.com/wp-content/uploads/2025/01/Bouquet-de-pivoines-stabilisees-rose-et-eucalyptus-Sophia-2-scaled.jpg',
      'https://leselixirsflorauxdeflora.com/wp-content/uploads/2019/05/pivoine-rose-1024x977.jpg',
    ],
    seo: {
      title:       'Pivoine Rose Signature | Bouquet premium Casablanca',
      description: 'Bouquet de pivoines roses livré le jour même à Casablanca. Opulence douce et parfum envoûtant.',
      keywords:    ['pivoine casablanca', 'bouquet pivoine maroc', 'fleurs romantiques casablanca'],
    },
  },

  /* ── 3 ──────────────────────────────────────────────────── */
  {
    id:               3,
    slug:             'tulipe-ivoire-collection',
    name:             'Tulipe Ivoire Collection',
    shortDescription: 'Pureté géométrique. Une fleur, une déclaration.',
    description:      "La tulipe ivoire est la fleur du minimalisme luxueux. Droite, claire, sans fioriture. Elle dit beaucoup avec très peu. Idéale pour les personnes dont le goût est sûr et qui apprécient l'essentiel.",
    price:            550,
    currency:         'MAD',
    stock:            18,
    featured:         false,
    popular:          true,
    premium:          false,
    rating:           4.7,
    reviews:          22,
    category:         'tulipe',
    tags:             ['tulipe', 'ivoire', 'minimaliste', 'élégant', 'moderne'],
    occasions:        ['elegance', 'anniversaire', 'entreprise', 'remerciement'],
    emotions: [
      { name: 'élégance',       percentage: 92 },
      { name: 'calme',          percentage: 85 },
      { name: 'raffinement',    percentage: 88 },
      { name: 'pureté',         percentage: 78 },
      { name: 'sobriété',       percentage: 80 },
    ],
    sizes: [
      { label: 'Petit',  price: 550,  height: '30–36 cm', diameter: '12 cm' },
      { label: 'Moyen',  price: 799,  height: '42–50 cm', diameter: '18 cm' },
      { label: 'Grand',  price: 1250, height: '58–70 cm', diameter: '26 cm' },
    ],
    colors:  ['ivoire', 'blanc cassé'],
    images: [
      'https://s3.amazonaws.com/cdn.tulips.com/images/large/White-Dream.jpg',
      'https://tse4.mm.bing.net/th/id/OIP.1AT16HMcMpM6i84rxQBTiwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    ],
    seo: {
      title:       'Tulipe Ivoire Collection | Fleurs Casablanca',
      description: 'Bouquet de tulipes ivoire, minimaliste et raffiné. Livraison Casablanca même jour.',
      keywords:    ['tulipe casablanca', 'bouquet minimaliste maroc', 'fleurs élégantes casablanca'],
    },
  },

  /* ── 4 ──────────────────────────────────────────────────── */
  {
    id:               4,
    slug:             'rose-rouge-velours',
    name:             'Rose Rouge Velours',
    shortDescription: "L'intensité à l'état pur. Pour les déclarations sans équivoque.",
    description:      "Certains moments n'ont pas besoin d'être subtils. La Rose Rouge Velours est directe, profonde, sensuelle. Une rose rouge parfaitement choisie dit plus qu'un long discours. Bouquet signature pour les déclarations romantiques ou les gestes passionnés.",
    price:            799,
    oldPrice:         899,
    currency:         'MAD',
    stock:            15,
    featured:         true,
    popular:          true,
    premium:          true,
    rating:           5.0,
    reviews:          61,
    category:         'rose',
    tags:             ['rose rouge', 'romantique', 'passion', 'saint valentin', 'casablanca'],
    occasions:        ['romantique', 'excuses'],
    emotions: [
      { name: 'amour',     percentage: 98 },
      { name: 'passion',   percentage: 96 },
      { name: 'désir',     percentage: 92 },
      { name: 'sincérité', percentage: 70 },
      { name: 'tendresse', percentage: 55 },
    ],
    sizes: [
      { label: 'Petit',   price: 799,  height: '30–38 cm', diameter: '16 cm' },
      { label: 'Moyen',   price: 1099, height: '42–50 cm', diameter: '24 cm' },
      { label: 'Grand',   price: 1699, height: '58–68 cm', diameter: '34 cm' },
      { label: 'Xxl',     price: 2490, height: '70–85 cm', diameter: '45 cm' },
    ],
    colors:  ['rouge profond', 'vert sombre'],
    images: [
      'https://i.pinimg.com/originals/43/eb/7c/43eb7c7ebe7485df0f4b3f44234f8bc5.jpg',
      'https://www.famousroses.es/cdn/shop/products/jubile-papa-meilland-4.jpg?v=1678122579&width=1445',
      'https://i.pinimg.com/736x/a2/1d/09/a21d09c5534f768e17c76db876a02100.jpg',
    ],
    seo: {
      title:       'Rose Rouge Velours | Bouquet romantique Casablanca',
      description: "Roses rouges premium livrées le jour même à Casablanca. Pour les déclarations d'amour inoubliables.",
      keywords:    ['rose rouge casablanca', 'bouquet romantique maroc', 'saint valentin casablanca'],
    },
  },

  /* ── 5 ──────────────────────────────────────────────────── */
  {
    id:               5,
    slug:             'eucalyptus-gypsophile-nuage',
    name:             "Nuage d'Eucalyptus",
    shortDescription: 'Un bouquet aérien au parfum boisé et apaisant.',
    description:      "Un bouquet poétique dominé par le feuillage d'eucalyptus et de nuages de gypsophile. Frais, naturel, presque sauvage — mais parfaitement composé. Pour les personnes qui préfèrent la sincérité à l'ostentation.",
    price:            490,
    currency:         'MAD',
    stock:            20,
    featured:         false,
    popular:          true,
    premium:          false,
    rating:           4.6,
    reviews:          18,
    category:         'composition',
    tags:             ['eucalyptus', 'gypsophile', 'naturel', 'frais', 'apaisant'],
    occasions:        ['excuses', 'remerciement', 'elegance'],
    emotions: [
      { name: 'calme',          percentage: 96 },
      { name: 'sincérité',      percentage: 88 },
      { name: 'espoir',         percentage: 82 },
      { name: 'tendresse',      percentage: 72 },
      { name: 'élégance',       percentage: 60 },
    ],
    sizes: [
      { label: 'Petit',  price: 490,  height: '26–32 cm', diameter: '14 cm' },
      { label: 'Moyen',  price: 720,  height: '38–46 cm', diameter: '20 cm' },
      { label: 'Grand',  price: 1090, height: '55–65 cm', diameter: '30 cm' },
    ],
    colors:  ['vert eucalyptus', 'blanc gypsophile', 'argent'],
    images: [
      'https://m.media-amazon.com/images/I/71fpxULF4xL._AC_SL1500_.jpg',
      'https://www.blumigo.de/wp-content/uploads/2018/05/1999-gemischter-eukalyptus-im-bund-1152x1536.jpg',
    ],
    seo: {
      title:       "Nuage d'Eucalyptus | Bouquet naturel Casablanca",
      description: "Composition aérienne d'eucalyptus et gypsophile. Frais, sincère, livré le jour même à Casablanca.",
      keywords:    ['bouquet naturel casablanca', 'eucalyptus fleurs maroc', 'gypsophile casablanca'],
    },
  },

  /* ── 6 ──────────────────────────────────────────────────── */
  {
    id:               6,
    slug:             'orchidee-noir-prestige',
    name:             'Orchidée Noire Prestige',
    shortDescription: 'Le bouquet des grandes occasions. Rare, structuré, inoubliable.',
    description:      "L'orchidée est la reine des fleurs d'exception. Ce bouquet prestige associe des orchidées foncées à un feuillage sombre et sculptural. Pour les inaugurations, les hommages professionnels ou les moments qui méritent le plus grand soin.",
    price:            1290,
    currency:         'MAD',
    stock:            5,
    featured:         true,
    popular:          false,
    premium:          true,
    rating:           4.9,
    reviews:          12,
    category:         'orchidee',
    tags:             ['orchidée', 'noir', 'prestige', 'entreprise', 'luxe absolu'],
    occasions:        ['entreprise', 'mariage', 'elegance'],
    emotions: [
      { name: 'prestige',       percentage: 98 },
      { name: 'élégance',       percentage: 96 },
      { name: 'raffinement',    percentage: 94 },
      { name: 'solennité',      percentage: 85 },
      { name: 'admiration',     percentage: 80 },
    ],
    sizes: [
      { label: 'Moyen', price: 1290, height: '45–55 cm', diameter: '22 cm' },
      { label: 'Grand', price: 1990, height: '62–75 cm', diameter: '32 cm' },
    ],
    colors:  ['bordeaux profond', 'noir végétal', 'or'],
    images: [
      'https://tse1.mm.bing.net/th/id/OIP.ZI0rCY9q5TTSYPqcdz8_JgHaFS?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      'https://th.bing.com/th/id/R.430e1b8d210f8c7123e6fffa8174470e?rik=nod8NFCIQ2a0Gg&riu=http%3a%2f%2flagrandebeaute.com%2fcdn%2fshop%2fproducts%2fblackrosesflowerboxdeliverylondon.jpg%3fv%3d1661342982&ehk=gnObjA4ur8rPClmMpGsmK1H50sDo%2bwskzwS4BQ70%2bxk%3d&risl=&pid=ImgRaw&r=0',
    ],
    seo: {
      title:       'Orchidée Noire Prestige | Fleurs luxe Casablanca',
      description: "Bouquet prestige d'orchidées noires pour occasions d'exception. Livraison Casablanca.",
      keywords:    ['orchidée casablanca', 'fleurs luxe maroc', 'bouquet prestige casablanca'],
    },
  },

  /* ── 7 ──────────────────────────────────────────────────── */
  {
    id:               7,
    slug:             'freesia-soleil-dore',
    name:             'Freesia Soleil Doré',
    shortDescription: 'Légèreté, chaleur et joie. Un bouquet qui fait sourire.',
    description:      'Le freesia est une fleur discrète avec un parfum puissant. Ce bouquet solaire mélange freesias dorés, mimosa et petites fleurs champêtres. Idéal pour célébrer une naissance, une réussite ou simplement donner de la joie.',
    price:            420,
    currency:         'MAD',
    stock:            22,
    featured:         false,
    popular:          true,
    premium:          false,
    rating:           4.5,
    reviews:          27,
    category:         'composition',
    tags:             ['freesia', 'doré', 'jaune', 'joyeux', 'naissance', 'célébration'],
    occasions:        ['anniversaire', 'remerciement'],
    emotions: [
      { name: 'joie',           percentage: 95 },
      { name: 'célébration',    percentage: 90 },
      { name: 'reconnaissance', percentage: 85 },
      { name: 'espoir',         percentage: 75 },
      { name: 'tendresse',      percentage: 65 },
    ],
    sizes: [
      { label: 'Petit',  price: 420,  height: '24–30 cm', diameter: '14 cm' },
      { label: 'Moyen',  price: 650,  height: '36–44 cm', diameter: '20 cm' },
      { label: 'Grand',  price: 990,  height: '52–62 cm', diameter: '28 cm' },
    ],
    colors:  ['doré', 'jaune soleil', 'blanc', 'vert tendre'],
    images: [
      'https://cdn.appleyardflowers.com/media/catalog/product/cache/5/thumbnail/800x800/9df78eab33525d08d6e5fb8d27136e95/5/0/50_yellow_roses_new-sala.webp',
      'https://springhillnursery.com/cdn/shop/files/79162_1.webp?v=1699440500&width=3840',
    ],
    seo: {
      title:       'Freesia Soleil Doré | Bouquet joyeux Casablanca',
      description: 'Bouquet de freesias dorés et mimosa. Livraison rapide à Casablanca pour toutes célébrations.',
      keywords:    ['freesia casablanca', 'bouquet joyeux maroc', 'fleurs naissance casablanca'],
    },
  },
]

/* ═══════════════════════════════════════════════════════════════
   FONCTIONS  ──  Aujourd'hui : données locales
                  Demain     : await fetch('/api/...')
   ═══════════════════════════════════════════════════════════════ */

/* ── Lecture de base ─────────────────────────────────────────── */

/** Toutes les fleurs */
export function getFlowers() {
  return flowers
}

/** Une fleur par slug */
export function getFlowerBySlug(slug) {
  return flowers.find(f => f.slug === slug) ?? null
}

/** Une occasion par slug */
export function getOccasionBySlug(slug) {
  return occasions.find(o => o.slug === slug) ?? null
}

/* ── Filtres produit ──────────────────────────────────────────── */

/** Fleurs vedettes (section Hero, FeaturedFlowers) */
export function getFeaturedFlowers(limit = 6) {
  return flowers.filter(f => f.featured).slice(0, limit)
}

/** Fleurs populaires */
export function getPopularFlowers(limit = 8) {
  return flowers.filter(f => f.popular).slice(0, limit)
}

/** Fleurs premium */
export function getPremiumFlowers(limit = 4) {
  return flowers.filter(f => f.premium).slice(0, limit)
}

/** Fleurs par occasion  ex: 'romantique' */
export function getOccasionFlowers(occasionSlug, limit = 12) {
  return flowers
    .filter(f => f.occasions.includes(occasionSlug))
    .slice(0, limit)
}

/** Fleurs par catégorie  ex: 'rose' */
export function getFlowersByCategory(category) {
  return flowers.filter(f => f.category === category)
}

/** Fleurs en stock */
export function getInStockFlowers() {
  return flowers.filter(f => f.stock > 0)
}

/* ── Recherche textuelle ─────────────────────────────────────── */

/**
 * Recherche sur name, shortDescription, tags, category, colors
 * Retourne les fleurs triées par score de pertinence
 */
export function searchFlowers(query) {
  const q = query.toLowerCase().trim()
  if (!q) return flowers

  return flowers
    .map(f => {
      let score = 0
      if (f.name.toLowerCase().includes(q))             score += 10
      if (f.category.toLowerCase().includes(q))         score += 8
      if (f.tags.some(t => t.toLowerCase().includes(q))) score += 5
      if (f.shortDescription.toLowerCase().includes(q)) score += 3
      if (f.colors.some(c => c.toLowerCase().includes(q))) score += 2
      return { ...f, _score: score }
    })
    .filter(f => f._score > 0)
    .sort((a, b) => b._score - a._score)
}

/* ── Recherche par émotion ──────────────────────────────────── */

/**
 * Retourne les fleurs qui transmettent une émotion donnée
 * triées par intensité (pourcentage décroissant)
 * @param {string}  emotionName    ex: 'calme'
 * @param {number}  minPercentage  seuil minimum (défaut 50)
 */
export function searchByEmotion(emotionName, minPercentage = 50) {
  return flowers
    .map(f => {
      const match = f.emotions.find(e => e.name === emotionName)
      return match ? { ...f, _emotionScore: match.percentage } : null
    })
    .filter(f => f !== null && f._emotionScore >= minPercentage)
    .sort((a, b) => b._emotionScore - a._emotionScore)
}

/**
 * Score d'émotion d'une fleur pour une émotion donnée
 * @returns {number} 0–100
 */
export function getEmotionScore(flower, emotionName) {
  return flower.emotions.find(e => e.name === emotionName)?.percentage ?? 0
}

/**
 * Top N émotions d'une fleur (pour affichage sur la card)
 */
export function getTopEmotions(flower, limit = 3) {
  return [...flower.emotions]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit)
}

/**
 * Pour une liste de fleurs, calcule quelles émotions sont disponibles
 * (utile pour les filtres dynamiques en boutique)
 */
export function getAvailableEmotions(flowerList = flowers) {
  const map = new Map()
  flowerList.forEach(f =>
    f.emotions.forEach(({ name, percentage }) => {
      if (!map.has(name) || map.get(name) < percentage) map.set(name, percentage)
    })
  )
  return allEmotions.filter(e => map.has(e.name))
}

/* ── Combiné : filtre multi-critères ─────────────────────────── */

/**
 * Filtre avancé (page boutique)
 * @param {Object} params
 * @param {string}   params.query        recherche texte libre
 * @param {string}   params.occasion     slug occasion
 * @param {string}   params.emotion      nom émotion
 * @param {string}   params.category     slug catégorie
 * @param {number}   params.minPrice
 * @param {number}   params.maxPrice
 * @param {boolean}  params.premiumOnly
 * @param {string}   params.sortBy       'popular'|'price_asc'|'price_desc'|'rating'
 */
export function filterFlowers({
  query       = '',
  occasion    = '',
  emotion     = '',
  category    = '',
  minPrice    = 0,
  maxPrice    = Infinity,
  premiumOnly = false,
  sortBy      = 'popular',
} = {}) {
  let result = [...flowers]

  if (query)       result = searchFlowers(query)
  if (occasion)    result = result.filter(f => f.occasions.includes(occasion))
  if (category)    result = result.filter(f => f.category === category)
  if (premiumOnly) result = result.filter(f => f.premium)

  result = result.filter(f => f.price >= minPrice && f.price <= maxPrice)

  if (emotion) {
    result = result
      .filter(f => f.emotions.some(e => e.name === emotion && e.percentage >= 40))
      .sort((a, b) => getEmotionScore(b, emotion) - getEmotionScore(a, emotion))
    return result
  }

  // Tri standard
  switch (sortBy) {
    case 'price_asc':  result.sort((a, b) => a.price - b.price);  break
    case 'price_desc': result.sort((a, b) => b.price - a.price);  break
    case 'rating':     result.sort((a, b) => b.rating - a.rating); break
    case 'popular':
    default:
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
  }

  return result
}

/* ── Helpers affichage ───────────────────────────────────────── */

/** Formatage prix  ex: "699 MAD" */
export function formatPrice(price, currency = 'MAD') {
  return `${price.toLocaleString('fr-MA')} ${currency}`
}

/** Fleurs similaires (même occasion OU même émotion dominante) */
export function getSimilarFlowers(flower, limit = 4) {
  const topEmotion = getTopEmotions(flower, 1)[0]?.name
  return flowers
    .filter(f => f.id !== flower.id)
    .map(f => {
      let score = 0
      if (flower.occasions.some(o => f.occasions.includes(o))) score += 3
      if (f.category === flower.category) score += 2
      if (topEmotion) score += getEmotionScore(f, topEmotion) / 33
      return { ...f, _sim: score }
    })
    .filter(f => f._sim > 0)
    .sort((a, b) => b._sim - a._sim)
    .slice(0, limit)
}