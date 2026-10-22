import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Item from "@/models/Item"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    await connectToDatabase()

    const item = await Item.findById(id).lean()
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({
      item: {
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
        userId: item.userId.toString(),
        userName: item.userName,
        userEmail: item.userEmail,
        createdAt: item.createdAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const user = getUserFromRequest(request)
    const body = await request.json()

    await connectToDatabase()

    const item = await Item.findById(id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Check ownership if user token is present
    if (user && item.userId.toString() !== user.id && !user.isAdmin && !user.isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Toggle or set resolved
    if (body.isResolved !== undefined) {
      item.isResolved = body.isResolved
      item.resolvedAt = body.isResolved ? new Date() : null
    }

    if (body.title) item.title = body.title
    if (body.description) item.description = body.description
    if (body.category) item.category = body.category
    if (body.location) item.location = body.location
    if (body.image !== undefined) item.image = body.image
    if (body.isArchived !== undefined) item.isArchived = body.isArchived

    await item.save()

    return NextResponse.json({
      message: "Item updated successfully",
      item: {
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
        userId: item.userId.toString(),
        userName: item.userName,
        userEmail: item.userEmail,
        createdAt: item.createdAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const user = getUserFromRequest(request)

    await connectToDatabase()

    const item = await Item.findById(id)
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Allow owner or admin/superadmin to delete
    if (user && item.userId.toString() !== user.id && !user.isAdmin && !user.isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Item.findByIdAndDelete(id)

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    )
  }
}
