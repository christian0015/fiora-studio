// app/api/flowers/[slug]/route.js
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/libs/mongoose"
import Flower from "@/models/Flower"

/**
 * GET /api/flowers/[slug]
 * Récupère une fleur par son slug
 */
export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    const { slug } = await params
    console.log("slug: ", slug)

    const flower = await Flower.findOne({ slug }).lean()

    if (!flower) {
      return NextResponse.json(
        { error: "Flower not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(flower)
  } catch (error) {
    console.error("GET /api/flowers/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch flower", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/flowers/[slug]
 * Met à jour une fleur existante
 */
export async function PUT(request, { params }) {
  try {
    await connectToDatabase()

    const { slug } = await params
    const body = await request.json()

    // Vérification existence
    const existing = await Flower.findOne({ slug })
    if (!existing) {
      return NextResponse.json(
        { error: "Flower not found" },
        { status: 404 }
      )
    }

    // Si le nom change, mettre à jour le slug
    if (body.name && body.name !== existing.name) {
      const newSlug = slugify(body.name)
      const slugExists = await Flower.findOne({ slug: newSlug, _id: { $ne: existing._id } })
      if (slugExists) {
        return NextResponse.json(
          { error: "A flower with this name already exists" },
          { status: 409 }
        )
      }
      body.slug = newSlug
    }

    const updated = await Flower.findOneAndUpdate(
      { slug },
      { ...body },
      { new: true, runValidators: true }
    ).lean()

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT /api/flowers/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to update flower", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/flowers/[slug]
 * Supprime une fleur
 */
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()

    const { slug } = await params

    const deleted = await Flower.findOneAndDelete({ slug })

    if (!deleted) {
      return NextResponse.json(
        { error: "Flower not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Flower deleted successfully", slug })
  } catch (error) {
    console.error("DELETE /api/flowers/[slug] error:", error)
    return NextResponse.json(
      { error: "Failed to delete flower", details: error.message },
      { status: 500 }
    )
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}