import mongoose from "mongoose"

/**
 * MongoDB Mongoose Connection Helper
 * Cached connection across hot reloads in development
 */

const MONGODB_URI = process.env.MONGODB_URI || ""

export const isDbConfigured = Boolean(MONGODB_URI && MONGODB_URI.trim().length > 0)

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (!isDbConfigured) {
    throw new Error(
      "MongoDB URI is missing! Please paste your MongoDB connection string in .env.local (MONGODB_URI=...)"
    )
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("Connected to MongoDB successfully.")
      return m
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
