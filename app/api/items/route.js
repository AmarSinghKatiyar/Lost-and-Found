import { NextResponse } from "next/server"
import { connectToDatabase, isDbConfigured } from "@/lib/db"
import Item from "@/models/Item"
import { getUserFromRequest } from "@/lib/auth"

// In-memory store fallback when MONGODB_URI is left empty during development
global.inMemoryItems = global.inMemoryItems || [
  {
    id: "sample-lost-1",
    title: "Apple AirPods Pro",
    description: "White AirPods Pro in a black case with serial number",
    category: "Electronics",
    type: "lost",
    location: "Central Library, Floor 2",
    date: "2026-10-18",
    image: "/white-airpods-pro-case.jpg",
    isResolved: false,
    userId: "sample1",
    userName: "Sarah Sharma",
    userEmail: "sarah@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-lost-2",
    title: "Brown Leather Wallet",
    description: "Brown leather wallet with student ID card and cards",
    category: "Bag",
    type: "lost",
    location: "Campus Cafeteria",
    date: "2026-10-19",
    image: "/brown-leather-wallet.png",
    isResolved: false,
    userId: "sample2",
    userName: "John Patel",
    userEmail: "john@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-found-1",
    title: "Black Leather Backpack",
    description: "Black leather backpack found with notebook and water bottle",
    category: "Bag",
    type: "found",
    location: "Auditorium Main Gate",
    date: "2026-10-20",
    image: "/black-leather-backpack.jpg",
    isResolved: false,
    userId: "sample3",
    userName: "Mike Rao",
    userEmail: "mike@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sample-found-2",
    title: "Gold Ring with Diamond",
    description: "Gold ring with small stone found near sports complex",
    category: "Jewelry",
    type: "found",
    location: "Sports Ground Bleachers",
    date: "2026-10-19",
    image: "/gold-ring-diamond.jpg",
    isResolved: false,
    userId: "sample4",
    userName: "Lisa Verma",
    userEmail: "lisa@example.com",
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "lost" or "found"
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const status = searchParams.get("status") || "active" // "active" or "resolved"

    // If MongoDB is configured, query the real database
    if (isDbConfigured) {
      await connectToDatabase()

      const query = { isArchived: false }
      if (type) query.type = type
      if (status === "resolved") query.isResolved = true
      else if (status === "active") query.isResolved = false
      if (category && category !== "All") query.category = category
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i")
        query.$or = [{ title: regex }, { description: regex }, { location: regex }]
      }

      const items = await Item.find(query).sort({ createdAt: -1 }).lean()

      const formattedItems = items.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        location: item.location,
        date: item.date ? item.date.toISOString().split("T")[0] : "",
        image: item.image || "",
        isResolved: item.isResolved,
        resolvedAt: item.resolvedAt,
        userId: item.userId?.toString() || "",
        userName: item.userName,
        userEmail: item.userEmail,
        createdAt: item.createdAt,
      }))

      return NextResponse.json({ items: formattedItems, source: "mongodb" })
    }

    // Fallback: If MONGODB_URI placeholder is empty, filter in-memory items
    let filtered = [...global.inMemoryItems]
    if (type) filtered = filtered.filter((i) => i.type === type)
    if (status === "resolved") filtered = filtered.filter((i) => i.isResolved)
    else if (status === "active") filtered = filtered.filter((i) => !i.isResolved)
    if (category && category !== "All") filtered = filtered.filter((i) => i.category === category)
    if (search && search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({
      items: filtered,
      source: "placeholder",
      notice: "Operating with demo items. Add MONGODB_URI in .env.local to persist directly to MongoDB Atlas.",
    })
  } catch (error) {
    console.error("Fetch Items Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch items", items: [] },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request)
    const body = await request.json()

    const { title, description, category, type, location, date, image } = body

    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { error: "Title, description, type, and location are required" },
        { status: 400 }
      )
    }

    const userId = user ? user.id : body.userId || `user-${Date.now()}`
    const userName = user ? user.name : body.userName || "Amar Singh"
    const userEmail = user ? user.email : body.userEmail || "amar@example.com"

    if (isDbConfigured) {
      await connectToDatabase()

      const newItem = await Item.create({
        title,
        description,
        category: category || "Other",
        type,
        location,
        date: date ? new Date(date) : new Date(),
        image: image || "",
        isResolved: false,
        userId,
        userName,
        userEmail,
      })

      return NextResponse.json({
        message: "Item created successfully in MongoDB",
        item: {
          id: newItem._id.toString(),
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          type: newItem.type,
          location: newItem.location,
          date: newItem.date ? newItem.date.toISOString().split("T")[0] : "",
          image: newItem.image || "",
          isResolved: newItem.isResolved,
          userId: newItem.userId.toString(),
          userName: newItem.userName,
          userEmail: newItem.userEmail,
          createdAt: newItem.createdAt,
        },
      })
    }

    // In-memory fallback
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      category: category || "Other",
      type,
      location,
      date: date || new Date().toISOString().split("T")[0],
      image: image || "",
      isResolved: false,
      userId,
      userName,
      userEmail,
      createdAt: new Date().toISOString(),
    }

    global.inMemoryItems.unshift(newItem)

    return NextResponse.json({
      message: "Item created (saved in demo memory). Connect MONGODB_URI in .env.local for database persistence.",
      item: newItem,
    })
  } catch (error) {
    console.error("Create Item Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create item" },
      { status: 500 }
    )
  }
}
