"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LostItemsSection } from "./lost-items-section"
import { FoundItemsSection } from "./found-items-section"
import { LandingPage } from "../landing-page"
import { SuperAdminPanel } from "./super-admin-panel"
import { AdminDashboard } from "./admin-dashboard"
import { LogOut, Heart, Moon, Sun, MapPin, ShieldCheck, ClipboardList } from "lucide-react"

export function Dashboard() {
  const { user, logout, deleteAccount } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem("theme", newDarkMode ? "dark" : "light")
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const isSuperAdminUser =
    user?.isSuperAdmin ||
    user?.role === "superadmin" ||
    user?.email === "amarsinghkatiyar13@gmail.com"

  const isAdminUser = isSuperAdminUser || user?.isAdmin || user?.role === "admin"

  return (
    <div className={`min-h-screen ${isDark ? "dark bg-gray-950 text-gray-100" : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"}`}>
      <header
        className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} shadow-sm border-b sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2.5 hover:opacity-85 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Heart className="w-5 h-5 fill-red-500" />
              </div>
              <span className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Lost & Found
              </span>
            </button>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveTab("home")}
                className={`text-sm font-medium transition ${
                  activeTab === "home"
                    ? "text-blue-600 font-semibold"
                    : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("lost")}
                className={`text-sm font-medium transition ${
                  activeTab === "lost"
                    ? "text-blue-600 font-semibold"
                    : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Browse Lost
              </button>
              <button
                onClick={() => setActiveTab("found")}
                className={`text-sm font-medium transition ${
                  activeTab === "found"
                    ? "text-blue-600 font-semibold"
                    : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Browse Found
              </button>

              {isAdminUser && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`text-sm font-medium flex items-center gap-1 transition ${
                    activeTab === "admin"
                      ? "text-blue-600 font-semibold"
                      : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Resolutions
                </button>
              )}

              {isSuperAdminUser && (
                <button
                  onClick={() => setActiveTab("superadmin")}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 transition ${
                    activeTab === "superadmin"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Super Admin
                </button>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-gray-300 dark:border-gray-700">
                <span className={`text-xs font-medium hidden sm:inline ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {user?.name}
                </span>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                      deleteAccount()
                    }
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1 rounded transition hidden sm:inline"
                >
                  Delete Account
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main>
        {activeTab === "home" && (
          <LandingPage
            onBrowseLost={() => setActiveTab("lost")}
            onBrowseFound={() => setActiveTab("found")}
            onPostItem={() => setActiveTab("lost")}
          />
        )}

        {activeTab === "lost" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LostItemsSection isDark={isDark} />
          </div>
        )}

        {activeTab === "found" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <FoundItemsSection isDark={isDark} />
          </div>
        )}

        {activeTab === "admin" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard isDark={isDark} />
          </div>
        )}

        {activeTab === "superadmin" && isSuperAdminUser && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SuperAdminPanel isDark={isDark} />
          </div>
        )}
      </main>
    </div>
  )
}
