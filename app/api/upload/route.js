import { NextResponse } from "next/server"
import { isImageKitConfigured, uploadImageToImageKit } from "@/lib/imagekit"

export async function POST(request) {
  try {
    const { image, fileName } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 })
    }

    // If ImageKit API keys are provided in .env.local, upload directly to ImageKit
    if (isImageKitConfigured) {
      const imageUrl = await uploadImageToImageKit(
        image,
        fileName || `lost-found-${Date.now()}`
      )
      return NextResponse.json({
        url: imageUrl,
        provider: "imagekit.io",
      })
    }

    // PLACEHOLDER BEHAVIOR:
    // If ImageKit API keys are left empty as requested, we return the base64 or fallback
    // while notifying the developer how to enable real ImageKit cloud storage.
    return NextResponse.json({
      url: image, // Keeps base64 for local dev preview
      provider: "placeholder",
      note: "ImageKit API keys are not configured in .env.local yet. Returning image for local preview.",
    })
  } catch (error) {
    console.error("Upload API Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    )
  }
}
