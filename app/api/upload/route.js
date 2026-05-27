// app/api/upload/route.js
import { NextResponse } from "next/server"
import cloudinary, { uploadMultipleFlowerImages } from "@/libs/cloudinary"

/**
 * POST /api/upload
 * Upload d'images vers Cloudinary
 * Body: { images: string[] (base64 ou URLs), flowerName: string }
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { images, flowerName } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid images array" },
        { status: 400 }
      )
    }

    if (!flowerName) {
      return NextResponse.json(
        { error: "Missing flowerName" },
        { status: 400 }
      )
    }

    const uploadedImages = await uploadMultipleFlowerImages(images, flowerName)

    return NextResponse.json({
      success: true,
      images: uploadedImages,
    })
  } catch (error) {
    console.error("POST /api/upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload
 * Supprime une image de Cloudinary
 * Body: { publicId: string }
 */
export async function DELETE(request) {
  try {
    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json(
        { error: "Missing publicId" },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, publicId })
  } catch (error) {
    console.error("DELETE /api/upload error:", error)
    return NextResponse.json(
      { error: "Delete failed", details: error.message },
      { status: 500 }
    )
  }
}