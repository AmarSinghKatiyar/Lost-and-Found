import { NextResponse } from "next/server"
import { connectToDatabase, isDbConfigured } from "@/lib/db"
import User from "@/models/User"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request) {
  try {
    const user = getUserFromRequest(request)

    // Verify admin / super admin
    if (user && !user.isAdmin && !user.isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (isDbConfigured) {
      await connectToDatabase()

      const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .lean()

      const formattedUsers = users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        isAdmin: u.isAdmin,
        isSuperAdmin: u.isSuperAdmin,
        role: u.role,
        verified: u.verified,
        createdAt: u.createdAt,
      }))

      return NextResponse.json({ users: formattedUsers })
    }

    // Demo fallback user
    return NextResponse.json({
      users: [
        {
          id: "superadmin-1",
          name: "Amar Singh Katiyar",
          email: "amarsinghkatiyar13@gmail.com",
          isAdmin: true,
          isSuperAdmin: true,
          role: "superadmin",
          verified: true,
          createdAt: new Date().toISOString(),
        },
      ],
      notice: "Demo users list. Add MONGODB_URI in .env.local for live user persistence.",
    })
  } catch (error) {
    console.error("Admin Users Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch users", users: [] },
      { status: 200 }
    )
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (user && !user.isAdmin && !user.isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (isDbConfigured) {
      await connectToDatabase()
      await User.findByIdAndDelete(userId)
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete User Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    )
  }
}
