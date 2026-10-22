import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Check super admin or admin roles
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "amarsinghkatiyar13@gmail.com").toLowerCase()
    const isSuperAdmin = email.toLowerCase() === superAdminEmail
    const isAdmin = isSuperAdmin || email.toLowerCase().includes("admin")

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin,
      isSuperAdmin,
      role: isSuperAdmin ? "superadmin" : isAdmin ? "admin" : "user",
      verified: true, // Auto-verify or leave for email OTP
    })

    const userPayload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      isSuperAdmin: newUser.isSuperAdmin,
      role: newUser.role,
      verified: newUser.verified,
      createdAt: newUser.createdAt,
    }

    const token = signToken(userPayload)

    const response = NextResponse.json({
      message: "User registered successfully",
      user: userPayload,
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Register Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    )
  }
}
