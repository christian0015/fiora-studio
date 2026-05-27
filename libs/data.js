// libs/data.js
// Remplacement des fonctions data.js pour appeler l'API MongoDB

import { siteConfig, occasions, categories, allEmotions } from "./data1" // Import static data from original

// Ré-export des données statiques (inchangées)
export { siteConfig, occasions, categories, allEmotions }

// ============================================================
// API URL helper (Sécurisé pour le SSR et le Client)
// ============================================================
const API_BASE = "/api"

async function fetchAPI(endpoint, options = {}) {
  let url = `${API_BASE}${endpoint}`

  // Si exécution côté serveur (Next.js SSR), fetch requiert une URL absolue
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    url = `${baseUrl}${url}`
  }

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "API request failed")
  }

  return res.json()
}

// ============================================================
// Categories (statiques depuis data.js)
// ============================================================
export function getCategories() {
  return categories
}

export function getCategoryBySlug(categorySlug) {
  return categories.find(c => c.slug === categorySlug) ?? null
}

export function getSubcategories(categorySlug) {
  const cat = getCategoryBySlug(categorySlug)
  return cat?.subcategories ?? []
}

export function hasSubcategories(categorySlug) {
  return getSubcategories(categorySlug).length > 0
}

// ============================================================
// Occasions (statiques depuis data.js)
// ============================================================
export function getOccasionBySlug(slug) {
  return occasions.find(o => o.slug === slug) ?? null
}

// ============================================================
// Flowers (via API)
// ============================================================

/** Toutes les fleurs (sans pagination) */
export async function getFlowers() {
  const result = await fetchAPI("/flowers?perPage=0")
  if (result && !Array.isArray(result) && Array.isArray(result.data)) {
    return result.data
  }
  return Array.isArray(result) ? result : []
}

/** Fleurs paginées */
export async function getFlowersPaginated({ page = 1, perPage = 12 } = {}) {
  return fetchAPI(`/flowers?page=${page}&perPage=${perPage}`)
}

/** Une fleur par slug */
export async function getFlowerBySlug(slug) {
  return fetchAPI(`/flowers/${slug}`)
}

/** Fleurs vedettes */
export async function getFeaturedFlowers(limit = 6) {
  const result = await fetchAPI(`/flowers?featured=true&perPage=${limit}`)
  return result.data || result
}

/** Fleurs populaires */
export async function getPopularFlowers(limit = 8) {
  const result = await fetchAPI(`/flowers?popular=true&perPage=${limit}`)
  return result.data || result
}

/** Fleurs premium */
export async function getPremiumFlowers(limit = 4) {
  const result = await fetchAPI(`/flowers?premiumOnly=true&perPage=${limit}`)
  return result.data || result
}

/** Fleurs par occasion */
export async function getOccasionFlowers(occasionSlug, limit = 12) {
  const result = await fetchAPI(`/flowers?occasion=${occasionSlug}&perPage=${limit}`)
  return result.data || result
}

/** Fleurs par catégorie */
export async function getFlowersByCategory(categorySlug) {
  const result = await fetchAPI(`/flowers?category=${categorySlug}&perPage=0`)
  if (result && !Array.isArray(result) && Array.isArray(result.data)) {
    return result.data
  }
  return Array.isArray(result) ? result : []
}

/** Fleurs par catégorie ET sous-catégorie */
export async function getFlowersByCategoryAndSub(categorySlug, subcategorySlug) {
  const result = await fetchAPI(`/flowers?category=${categorySlug}&subcategory=${subcategorySlug}&perPage=0`)
  if (result && !Array.isArray(result) && Array.isArray(result.data)) {
    return result.data
  }
  return Array.isArray(result) ? result : []
}

/** Meilleure fleur pour une catégorie */
export async function getBestFlowerForCategory(categorySlug) {
  const flowers = await getFlowersByCategory(categorySlug)
  if (!flowers || !flowers.length) return null
  return [...flowers].sort((a, b) => {
    const scoreA = (a.rating ?? 0) * 10 + (a.popular ? 5 : 0) + (a.featured ? 3 : 0)
    const scoreB = (b.rating ?? 0) * 10 + (b.popular ? 5 : 0) + (b.featured ? 3 : 0)
    return scoreB - scoreA
  })[0]
}

/** Fleurs en stock */
export async function getInStockFlowers() {
  const result = await getFlowers()
  return Array.isArray(result) ? result.filter(f => f.stock > 0) : []
}

// ============================================================
// Recherche
// ============================================================

export async function searchFlowers(query) {
  const result = await fetchAPI(`/flowers?query=${encodeURIComponent(query)}&perPage=0`)
  if (result && !Array.isArray(result) && Array.isArray(result.data)) {
    return result.data
  }
  return Array.isArray(result) ? result : []
}

export async function searchByEmotion(emotionName, minPercentage = 50) {
  const result = await fetchAPI(`/flowers?emotion=${emotionName}&perPage=0`)
  const flowers = (result && !Array.isArray(result) && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : [])
  
  return flowers.map(f => ({
    ...f,
    _emotionScore: f.emotions?.find(e => e.name === emotionName)?.percentage || 0,
  })).filter(f => f._emotionScore >= minPercentage)
}

export function getEmotionScore(flower, emotionName) {
  return flower.emotions?.find(e => e.name === emotionName)?.percentage ?? 0
}

export function getTopEmotions(flower, limit = 3) {
  return [...(flower.emotions || [])]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit)
}

export async function getAvailableEmotions(flowerList = null) {
  if (flowerList) {
    const map = new Map()
    flowerList.forEach(f =>
      f.emotions?.forEach(({ name, percentage }) => {
        if (!map.has(name) || map.get(name) < percentage) map.set(name, percentage)
      })
    )
    return allEmotions.filter(e => map.has(e.name))
  }

  const flowers = await getFlowers()
  const map = new Map()
  flowers.forEach(f =>
    f.emotions?.forEach(({ name, percentage }) => {
      if (!map.has(name) || map.get(name) < percentage) map.set(name, percentage)
    })
  )
  return allEmotions.filter(e => map.has(e.name))
}

// ============================================================
// Filtre multi-critères
// ============================================================

export async function filterFlowers({
  query = "",
  occasion = "",
  category = "",
  subcategory = "",
  minPrice = 0,
  maxPrice = Infinity,
  premiumOnly = false,
  sortBy = "popular",
  emotion = "",
  page = 1,
  perPage = 0,
} = {}) {
  const params = new URLSearchParams()

  if (query) params.append("query", query)
  if (occasion) params.append("occasion", occasion)
  if (category) params.append("category", category)
  if (subcategory) params.append("subcategory", subcategory)
  if (minPrice > 0) params.append("minPrice", minPrice)
  if (maxPrice !== Infinity) params.append("maxPrice", maxPrice)
  if (premiumOnly) params.append("premiumOnly", "true")
  if (sortBy) params.append("sortBy", sortBy)
  if (emotion) params.append("emotion", emotion)
  if (page > 1) params.append("page", page)
  
  // On force le passage du paramètre pour surcharger le comportement de la route API
  params.append("perPage", perPage)

  const result = await fetchAPI(`/flowers?${params.toString()}`)

  // Normalisation stricte du retour en tableau de fleurs
  if (result && !Array.isArray(result) && Array.isArray(result.data)) {
    return result.data
  }

  return Array.isArray(result) ? result : []
}

// ============================================================
// Helpers
// ============================================================

export function formatPrice(price, currency = "MAD") {
  const safePrice = typeof price === "number" ? price : 0
  return `${safePrice.toLocaleString("fr-MA")} ${currency}`
}

export async function getSimilarFlowers(flower, limit = 4) {
  const topEmotion = getTopEmotions(flower, 1)[0]?.name
  const allFlowers = await getFlowers()

  return allFlowers
    .filter(f => f.slug !== flower.slug)
    .map(f => {
      let score = 0
      if (flower.occasions?.some(o => f.occasions?.includes(o))) score += 3
      if (f.category === flower.category) score += 2
      if (topEmotion) score += getEmotionScore(f, topEmotion) / 33
      return { ...f, _sim: score }
    })
    .filter(f => f._sim > 0)
    .sort((a, b) => b._sim - a._sim)
    .slice(0, limit)
}