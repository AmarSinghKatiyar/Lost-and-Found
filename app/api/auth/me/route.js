import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function GET(request) {
  try {
    const tokenUser = getUserFromRequest(request)

    if (!tokenUser) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    await connectToDatabase()
    const user = await User.findById(tokenUser.id).select("-password")

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Auth Me Error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
