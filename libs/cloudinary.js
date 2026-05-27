// lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

/**
 * Upload une image vers Cloudinary avec organisation par dossier
 * @param {string|Buffer} image - Base64, URL ou buffer
 * @param {string} flowerName - Nom de la fleur (pour le slug du dossier)
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadFlowerImage(image, flowerName) {
  const slug = slugify(flowerName)
  const timestamp = Date.now()

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: `flora-studio/flowers/${slug}`,
      public_id: `img-${timestamp}`,
      allowed_formats: ["jpg", "png", "webp", "jpeg"],
      transformation: [{ quality: "auto:good", fetch_format: "auto" }],
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error(`Image upload failed: ${error.message}`)
  }
}

/**
 * Upload multiples images
 * @param {Array} images - Tableau d'images (base64/URL/buffer)
 * @param {string} flowerName - Nom de la fleur
 */
export async function uploadMultipleFlowerImages(images, flowerName) {
  const uploads = await Promise.all(
    images.map(img => uploadFlowerImage(img, flowerName))
  )
  return uploads
}

/**
 * Supprime une image de Cloudinary par son public_id
 * @param {string} publicId
 */
export async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return false
  }
}

/**
 * Slugify helper (identique à celui du frontend)
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}