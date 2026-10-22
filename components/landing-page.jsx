"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export function LandingPage({ onBrowseLost, onBrowseFound, onPostItem }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/placeholder.svg?height=400&width=1200&query=lost+found+hands+textiles)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">Lost Something? Found Something?</h2>
          <p className="text-xl text-gray-100 mb-8">Help reunite items with their owners in your community</p>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for lost or found items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onBrowseLost}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
            >
              Report Lost Item
            </button>
            <button
              onClick={onBrowseFound}
              className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
            >
              Report Found Item
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Reunite Lost Treasures</h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            Our campus and community lost & found portal helps people report missing items, match with found valuables, and claim them securely.
          </p>
        </div>
      </section>
    </div>
  )
}
