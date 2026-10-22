"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Trash2, Users, Database, ShieldAlert, Sparkles, RefreshCw } from "lucide-react"

export function SuperAdminPanel({ isDark }) {
  const { user, deleteUser } = useAuth()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, lostItems: 0, foundItems: 0, resolvedItems: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (err) {
      console.warn("Failed to fetch super admin data:", err)
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      setUsers(storedUsers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!user?.isSuperAdmin && user?.email !== "amarsinghkatiyar13@gmail.com") {
    return (
      <div className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} p-8 rounded-xl border border-red-500/20`}>
        <div className="flex items-center gap-3 text-red-500 font-semibold mb-2">
          <ShieldAlert className="w-6 h-6" />
          Access Denied
        </div>
        <p className="text-gray-500 text-sm">
          Super Admin privileges are required to view this panel.
        </p>
      </div>
    )
  }

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
      deleteUser(userId)
      await loadData()
      setShowDeleteConfirm(null)
    } catch (e) {
      alert("Failed to delete user: " + e.message)
    }
  }

  const handleClearAllDatabase = async () => {
    try {
      const res = await fetch("/api/admin/clear-db", { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to clear database")
      }
      localStorage.removeItem("lostItems")
      localStorage.removeItem("foundItems")
      localStorage.removeItem("resolvedItems")
      localStorage.removeItem("archivedItems")
      await loadData()
      setShowClearAllConfirm(false)
      alert("MongoDB collections and data have been reset!")
    } catch (e) {
      alert("Error clearing database: " + e.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-1`}>
            Super Admin Control Center
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
            Live MongoDB database records, user directory, and platform governance.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border font-medium transition ${isDark ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 font-medium">Registered Users</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalUsers || users.length}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 font-medium">Active Lost Items</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{stats.lostItems}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 font-medium">Active Found Items</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.foundItems}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 font-medium">Resolved Reunions</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">{stats.resolvedItems}</p>
        </div>
      </div>

      {/* User Management Section */}
      <div
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-md border overflow-hidden`}
      >
        <div
          className={`${isDark ? "bg-gray-750" : "bg-gray-50"} px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              User Directory ({users.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`${isDark ? "bg-gray-700/50 text-gray-300" : "bg-gray-50 text-gray-600"} border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Joined Date</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
              {users.map((u) => (
                <tr key={u.id} className={`${isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"} transition`}>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        u.isSuperAdmin
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                          : u.isAdmin
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {u.isSuperAdmin ? "Super Admin" : u.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.email !== "amarsinghkatiyar13@gmail.com" && (
                      showDeleteConfirm === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(u.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`p-6 rounded-xl border border-red-500/30 ${isDark ? "bg-red-950/20" : "bg-red-50/50"}`}>
        <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
          <Database className="w-5 h-5" />
          Super Admin Danger Zone
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Reset all platform records, purge test data, and start clean. This action clears MongoDB Item and Claim collections.
        </p>

        {showClearAllConfirm ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAllDatabase}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Yes, Purge Database Now
            </button>
            <button
              onClick={() => setShowClearAllConfirm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="border border-red-500 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Reset Database
          </button>
        )}
      </div>
    </div>
  )
}
