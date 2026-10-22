import { NextResponse } from "next/server"
import { connectToDatabase, isDbConfigured } from "@/lib/db"
import User from "@/models/User"
import Item from "@/models/Item"

export async function GET() {
  try {
    if (isDbConfigured) {
      await connectToDatabase()

      const [totalUsers, lostItems, foundItems, resolvedItems] = await Promise.all([
        User.countDocuments(),
        Item.countDocuments({ type: "lost", isResolved: false }),
        Item.countDocuments({ type: "found", isResolved: false }),
        Item.countDocuments({ isResolved: true }),
      ])

      return NextResponse.json({
        totalUsers,
        lostItems,
        foundItems,
        resolvedItems,
      })
    }

    // Demo fallback counts
    const inMemoryItems = global.inMemoryItems || []
    return NextResponse.json({
      totalUsers: 1,
      lostItems: inMemoryItems.filter((i) => i.type === "lost" && !i.isResolved).length,
      foundItems: inMemoryItems.filter((i) => i.type === "found" && !i.isResolved).length,
      resolvedItems: inMemoryItems.filter((i) => i.isResolved).length,
    })
  } catch (error) {
    console.error("Stats Error:", error)
    return NextResponse.json(
      { totalUsers: 0, lostItems: 0, foundItems: 0, resolvedItems: 0 },
      { status: 200 }
    )
  }
}
