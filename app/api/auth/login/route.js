import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(request) {
  try {
    const { emailOrUsername, password } = await request.json()

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/Username and password are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Find user by email or name
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { name: emailOrUsername },
      ],
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
    }

    const token = signToken(userPayload)

    const response = NextResponse.json({
      message: "Login successful",
      user: userPayload,
      token,
    })

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to log in" },
      { status: 500 }
    )
  }
}
