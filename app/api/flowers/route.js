// app/api/flowers/route.js
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/libs/mongoose"
import Flower from "@/models/Flower"

// Slugify helper
function slugify(text) {
  if (!text) return ""
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/**
 * GET /api/flowers
 */
export async function GET(request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = parseInt(searchParams.get("perPage") || "12")
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || ""
    const subcategory = searchParams.get("subcategory") || ""
    const occasion = searchParams.get("occasion") || ""
    const minPrice = parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "Infinity")
    const premiumOnly = searchParams.get("premiumOnly") === "true"
    const featuredOnly = searchParams.get("featured") === "true"
    const popularOnly = searchParams.get("popular") === "true"
    const sortBy = searchParams.get("sortBy") || "popular"
    const emotion = searchParams.get("emotion") || ""

    // Construction du filtre
    const filter = {}

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { shortDescription: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ]
    }

    if (category) filter.category = category
    if (subcategory) filter.subcategory = subcategory
    if (occasion) filter.occasions = occasion
    if (featuredOnly) filter.featured = true
    if (popularOnly) filter.popular = true
    if (premiumOnly) filter.premium = true

    if (minPrice > 0 || maxPrice !== Infinity) {
      filter.price = {}
      if (minPrice > 0) filter.price.$gte = minPrice
      if (maxPrice !== Infinity) filter.price.$lte = maxPrice
    }

    if (emotion) {
      filter["emotions.name"] = emotion
      filter["emotions.percentage"] = { $gte: 40 }
    }

    // Construction du tri
    let sort = {}
    switch (sortBy) {
      case "price_asc": sort = { price: 1 }; break
      case "price_desc": sort = { price: -1 }; break
      case "rating": sort = { rating: -1 }; break
      default: sort = { popular: -1, featured: -1, createdAt: -1 }
    }

    // Si perPage === 0, retourner tout sans pagination
    if (perPage === 0) {
      const data = await Flower.find(filter).sort(sort).lean()
      return NextResponse.json(data)
    }

    // Pagination standard
    const total = await Flower.countDocuments(filter)
    const totalPages = Math.ceil(total / perPage)
    const safePage = Math.max(1, Math.min(page, totalPages || 1))
    const skip = (safePage - 1) * perPage

    const data = await Flower.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(perPage)
      .lean()

    return NextResponse.json({
      data,
      total,
      page: safePage,
      perPage,
      totalPages,
    })
  } catch (error) {
    console.error("GET /api/flowers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch flowers", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/flowers
 */
export async function POST(request) {
  try {
    await connectToDatabase()

    const body = await request.json()

    // Validation des champs obligatoires
    if (!body.name || !body.shortDescription || !body.description || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: name, shortDescription, description, category" },
        { status: 400 }
      )
    }

    // Génération du slug unique
    let baseSlug = slugify(body.name)
    let slug = baseSlug
    let counter = 1

    // Vérifier l'unicité du slug
    while (await Flower.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Nettoyer les données avant insertion
    const flowerData = {
      slug,
      name: body.name,
      shortDescription: body.shortDescription,
      description: body.description,
      price: parseFloat(body.price) || 0,
      oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
      currency: body.currency || "MAD",
      stock: parseInt(body.stock) || 0,
      featured: body.featured || false,
      popular: body.popular || false,
      premium: body.premium || false,
      rating: body.rating || 0,
      reviews: body.reviews || 0,
      category: body.category,
      subcategory: body.subcategory || null,
      flowerType: body.flowerType || "composition",
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map(t => t.trim()) : []),
      occasions: Array.isArray(body.occasions) ? body.occasions : [],
      emotions: Array.isArray(body.emotions) ? body.emotions : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      colors: Array.isArray(body.colors) ? body.colors : (body.colors ? body.colors.split(",").map(c => c.trim()) : []),
      images: Array.isArray(body.images) ? body.images : [],
      imagePublicIds: Array.isArray(body.imagePublicIds) ? body.imagePublicIds : [],
      seo: body.seo || { title: "", description: "", keywords: [] },
    }

    const flower = await Flower.create(flowerData)

    return NextResponse.json(flower, { status: 201 })
  } catch (error) {
    console.error("POST /api/flowers error:", error)
    return NextResponse.json(
      { error: "Failed to create flower", details: error.message },
      { status: 500 }
    )
  }
}