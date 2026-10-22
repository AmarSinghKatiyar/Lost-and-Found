import ImageKit from "imagekit"

/**
 * ImageKit.io API Configuration
 * API keys can be obtained from: https://imagekit.io/dashboard/developer/api-keys
 * Configure them in your .env.local file
 */

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || ""
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || ""
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || ""

export const isImageKitConfigured = Boolean(publicKey && privateKey && urlEndpoint)

export const imagekit = isImageKitConfigured
  ? new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    })
  : null

/**
 * Helper to upload image buffer or base64 to ImageKit
 * @param {string} file - Base64 string or file URL
 * @param {string} fileName - File name to save as
 * @returns {Promise<string>} Uploaded image URL
 */
export async function uploadImageToImageKit(file, fileName = `item-${Date.now()}`) {
  if (!isImageKitConfigured || !imagekit) {
    throw new Error(
      "ImageKit API is not configured! Please provide IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env.local"
    )
  }

  const response = await imagekit.upload({
    file,
    fileName,
    folder: "/lost-and-found",
  })

  return response.url
}
