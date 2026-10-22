import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Item from "@/models/Item"
import Claim from "@/models/Claim"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request) {
  try {
    const user = getUserFromRequest(request)

    if (user && !user.isSuperAdmin) {
      return NextResponse.json(
        { error: "Access Denied: Super Admin privileges required" },
        { status: 403 }
      )
    }

    await connectToDatabase()

    // Delete items, claims, and non-superadmin users
    await Item.deleteMany({})
    await Claim.deleteMany({})

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "amarsinghkatiyar13@gmail.com").toLowerCase()
    await User.deleteMany({ email: { $ne: superAdminEmail } })

    return NextResponse.json({
      message: "Database successfully cleared (retained Super Admin account)",
    })
  } catch (error) {
    console.error("Clear DB Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to clear database" },
      { status: 500 }
    )
  }
}
