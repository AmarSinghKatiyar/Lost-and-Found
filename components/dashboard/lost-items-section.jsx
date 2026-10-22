"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Search, Plus, Trash2, CheckCircle2, Upload, X, Archive, Sparkles } from "lucide-react"

export function LostItemsSection({ isDark }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [resolvedItems, setResolvedItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [previewImage, setPreviewImage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    location: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
  })

  // Load items from API with graceful fallback
  const fetchItems = async () => {
    try {
      const [activeRes, resolvedRes] = await Promise.all([
        fetch("/api/items?type=lost&status=active"),
        fetch("/api/items?type=lost&status=resolved"),
      ])

      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setItems(activeData.items || [])
      }

      if (resolvedRes.ok) {
        const resolvedData = await resolvedRes.json()
        setResolvedItems(resolvedData.items || [])
      }
    } catch (err) {
      console.warn("API unavailable, loading local fallback data:", err)
      const stored = localStorage.getItem("lostItems")
      if (stored) {
        setItems(JSON.parse(stored))
      }
      const resolvedStored = localStorage.getItem("resolvedLostItems")
      if (resolvedStored) {
        setResolvedItems(JSON.parse(resolvedStored))
      }
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Image upload handling with ImageKit API
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result
      setPreviewImage(base64String)

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64String,
            fileName: `lost-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`,
          }),
        })

        const data = await res.json()
        if (data.url) {
          setFormData((prev) => ({ ...prev, image: data.url }))
        } else {
          setFormData((prev) => ({ ...prev, image: base64String }))
        }
      } catch (err) {
        console.warn("ImageKit upload error, using raw image:", err)
        setFormData((prev) => ({ ...prev, image: base64String }))
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" })
    setPreviewImage("")
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "lost",
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        }),
      })

      if (res.ok) {
        await fetchItems()
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to post item")
      }
    } catch (err) {
      console.warn("Falling back to local state:", err.message)
      const newItem = {
        id: Date.now().toString(),
        ...formData,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        isResolved: false,
      }
      const updated = [newItem, ...items]
      setItems(updated)
      localStorage.setItem("lostItems", JSON.stringify(updated))
    } finally {
      setIsSubmitting(false)
      setFormData({
        title: "",
        description: "",
        category: "Electronics",
        location: "",
        date: new Date().toISOString().split("T")[0],
        image: "",
      })
      setPreviewImage("")
      setShowForm(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this lost item post?")) return

    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchItems()
        return
      }
    } catch (err) {
      console.warn("Delete API error:", err)
    }

    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    localStorage.setItem("lostItems", JSON.stringify(updated))
  }

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      })

      if (res.ok) {
        fetchItems()
        return
      }
    } catch (err) {
      console.warn("Resolve API error:", err)
    }

    const resolvedItem = items.find((i) => i.id === id)
    if (resolvedItem) {
      const newResolved = [{ ...resolvedItem, resolvedAt: new Date().toISOString() }, ...resolvedItems]
      setResolvedItems(newResolved)
      localStorage.setItem("resolvedLostItems", JSON.stringify(newResolved))

      const updated = items.filter((item) => item.id !== id)
      setItems(updated)
      localStorage.setItem("lostItems", JSON.stringify(updated))
    }
  }

  const handleDeleteResolved = async (id) => {
    if (!confirm("Delete this resolved record permanently?")) return
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" })
      fetchItems()
    } catch (err) {
      const updated = resolvedItems.filter((item) => item.id !== id)
      setResolvedItems(updated)
      localStorage.setItem("resolvedLostItems", JSON.stringify(updated))
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredResolved = resolvedItems.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Lost Items</h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Browse reported missing items or post something you've lost
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow transition"
        >
          <Plus className="w-4 h-4" />
          Report Lost Item
        </button>
      </div>

      {showForm && (
        <div
          className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg p-6 border bg-gradient-to-br ${isDark ? "from-gray-800 to-gray-900" : "from-blue-50/50 to-white"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Report a Lost Item
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className={`p-1 rounded-md ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  placeholder="e.g., iPhone 14 Pro Max"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                >
                  <option>Electronics</option>
                  <option>Jewelry</option>
                  <option>Documents</option>
                  <option>Clothing</option>
                  <option>Bag</option>
                  <option>Keys</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                rows={3}
                placeholder="Distinctive marks, color, case details, lockscreen, etc..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Location Lost *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                  placeholder="e.g., Central Library, Floor 2"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Date Lost
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Upload Photo (Saved to ImageKit / Cloud Storage)
              </label>
              {previewImage ? (
                <div className="relative inline-block w-full">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className={`w-full h-44 object-cover rounded-lg border ${isDark ? "border-gray-600" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition ${isDark ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700/50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50"}`}
                >
                  <div className="text-center">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {isUploading ? "Uploading to Cloud..." : "Click to upload photo"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>PNG, JPG, WebP</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition shadow"
              >
                {isSubmitting ? "Saving to Database..." : "Publish Lost Report"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setPreviewImage("")
                }}
                className={`px-6 py-2.5 rounded-lg font-medium transition ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex gap-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-2 font-medium border-b-2 transition ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600"
              : `border-transparent ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          Active Lost Items ({filteredItems.length})
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`pb-3 px-2 font-medium border-b-2 transition ${
            activeTab === "resolved"
              ? "border-blue-600 text-blue-600"
              : `border-transparent ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-900"}`
          }`}
        >
          Resolved Cases ({filteredResolved.length})
        </button>
      </div>

      {/* Search */}
      <div
        className={`rounded-lg shadow-sm p-3 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="flex items-center gap-3">
          <Search className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Search by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full outline-none bg-transparent text-sm ${isDark ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-400"}`}
          />
        </div>
      </div>

      {/* Active Items */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border flex flex-col justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <div>
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.title}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <p className={`text-sm mb-4 line-clamp-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {item.description}
                    </p>

                    <div className={`space-y-1.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      <p><strong>Location:</strong> {item.location}</p>
                      <p><strong>Date Lost:</strong> {item.date ? new Date(item.date).toLocaleDateString() : "Recent"}</p>
                      <p><strong>Posted by:</strong> {item.userName}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 border-t ${isDark ? "border-gray-700 bg-gray-850" : "border-gray-100 bg-gray-50/50"}`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Found
                    </button>
                    {(item.userId === user?.id || user?.isAdmin || user?.isSuperAdmin) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Sparkles className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>No active lost items found.</p>
            </div>
          )}
        </div>
      )}

      {/* Resolved Items */}
      {activeTab === "resolved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResolved.length > 0 ? (
            filteredResolved.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl shadow-sm border overflow-hidden opacity-85 ${isDark ? "bg-gray-800 border-green-800" : "bg-white border-green-200"}`}
              >
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      Resolved
                    </span>
                  </div>

                  <p className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{item.description}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Resolved on {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : "Recently"}
                  </p>

                  {(item.userId === user?.id || user?.isAdmin || user?.isSuperAdmin) && (
                    <button
                      onClick={() => handleDeleteResolved(item.id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Record
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>No resolved cases yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
