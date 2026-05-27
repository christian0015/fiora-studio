import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    "Please define MONGODB_URI environment variable inside .env.local"
  )
}

/**
 * En Next.js (surtout en développement), le rechargement à chaud (HMR) 
 * recrée les modules isolés. On utilise l'objet `global` de Node.js 
 * pour conserver la promesse de connexion entre les requêtes et les builds.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  // 1. Si une connexion active existe déjà, on la réutilise immédiatement
  if (cached.conn) {
    return cached.conn
  }

  // 2. Si aucune promesse de connexion n'est en cours, on la crée une seule fois
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Reste à false pour interdire les requêtes tant que MongoDB n'est pas prêt
      maxPoolSize: 10,       // Taille du pool pour gérer les requêtes simultanées
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    console.log("⚡ Initiating MongoDB connection promise...")
    
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✓ MongoDB connected successfully")
        return mongooseInstance
      })
      .catch((error) => {
        console.error("✗ MongoDB connection error:", error)
        cached.promise = null // Réinitialisation en cas d'échec pour permettre de réessayer
        throw error
      })
  }

  // 3. Toutes les requêtes parallèles attendent la résolution de cette même promesse
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}