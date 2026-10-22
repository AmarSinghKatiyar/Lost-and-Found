import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "lost_and_found_secret_key_default"

/**
 * Sign JWT token for user
 * @param {object} payload
 * @returns {string} token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object|null} decoded payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

/**
 * Extract authenticated user info from Next.js request headers or cookies
 * @param {Request} request
 * @returns {object|null}
 */
export function getUserFromRequest(request) {
  // Check Authorization header: Bearer <token>
  const authHeader = request.headers.get("authorization")
  let token = null

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  } else {
    // Check cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.match(/token=([^;]+)/)
    if (match) {
      token = match[1]
    }
  }

  if (!token) return null
  return verifyToken(token)
}
