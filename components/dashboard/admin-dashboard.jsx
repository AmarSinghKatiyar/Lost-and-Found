"use client"

import { useState, useEffect } from "react"
import { Trash2, Archive, CheckCircle } from "lucide-react"

export function AdminDashboard({ isDark }) {
  const [resolvedItems, setResolvedItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchResolvedItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/items?status=resolved")
      if (res.ok) {
        const data = await res.json()
        setResolvedItems(data.items || [])
      }
    } catch (err) {
      console.warn("Failed to fetch resolved items from API:", err)
      const stored = localStorage.getItem("resolvedItems")
      if (stored) {
        setResolvedItems(JSON.parse(stored))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResolvedItems()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Delete this resolved record permanently?")) return
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" })
      fetchResolvedItems()
    } catch (err) {
      const updated = resolvedItems.filter((item) => item.id !== id)
      setResolvedItems(updated)
      localStorage.setItem("resolvedItems", JSON.stringify(updated))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
          Admin Resolution Logs
        </h2>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Overview of all reunited items and resolved community cases
        </p>
      </div>

      <div
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md overflow-hidden border`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"} border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <tr>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Item Title
                </th>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Category
                </th>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Reported By
                </th>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Type
                </th>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Resolved Date
                </th>
                <th className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"} text-sm`}>
              {resolvedItems.length > 0 ? (
                resolvedItems.map((item) => (
                  <tr key={item.id} className={isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"}>
                    <td className={`px-6 py-4 font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {item.userName} ({item.userEmail})
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                          item.type === "lost"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : "Resolved"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    No resolved records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
