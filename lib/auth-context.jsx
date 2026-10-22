"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verify session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn("Backend auth check error, falling back to cached user:", err)
      }

      // Fallback to local storage if API is not yet reachable or DB is empty
      const stored = localStorage.getItem("user")
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse user")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const signup = async (email, name, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      if (data.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      }
      return data
    } catch (err) {
      // Local fallback for offline/preview
      if (err.message.includes("MongoDB URI is missing")) {
        const mockUser = {
          id: Date.now().toString(),
          email,
          name,
          isAdmin: email.includes("admin"),
          isSuperAdmin: email === "amarsinghkatiyar13@gmail.com",
          verified: true,
          createdAt: new Date().toISOString(),
        }
        setUser(mockUser)
        localStorage.setItem("user", JSON.stringify(mockUser))
        return { user: mockUser }
      }
      throw err
    }
  }

  const login = async (emailOrUsername, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in")
      }

      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      return data
    } catch (err) {
      if (err.message.includes("MongoDB URI is missing")) {
        const mockUser = {
          id: "dev-user-1",
          email: emailOrUsername,
          name: emailOrUsername.split("@")[0] || "User",
          isAdmin: emailOrUsername.includes("admin"),
          isSuperAdmin: emailOrUsername === "amarsinghkatiyar13@gmail.com",
          verified: true,
          createdAt: new Date().toISOString(),
        }
        setUser(mockUser)
        localStorage.setItem("user", JSON.stringify(mockUser))
        return { user: mockUser }
      }
      throw err
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (e) {
      // silent catch
    }
    setUser(null)
    localStorage.removeItem("user")
  }

  const deleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
    } catch (err) {
      console.error("Failed to delete user on server:", err)
    }
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updated = users.filter((u) => u.id !== userId)
    localStorage.setItem("users", JSON.stringify(updated))
  }

  const deleteAccount = async () => {
    if (!user) return
    await deleteUser(user.id)
    await logout()
  }

  const getAllUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        return data.users || []
      }
    } catch (err) {
      console.warn("Failed to fetch users from server:", err)
    }
    return JSON.parse(localStorage.getItem("users") || "[]")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        deleteUser,
        deleteAccount,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
