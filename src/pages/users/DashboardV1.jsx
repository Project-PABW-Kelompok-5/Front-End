"use client"

import { useState } from "react"
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaChevronDown, FaThLarge, FaList } from "react-icons/fa"

const EcommerceDashboard = () => {
  const [activeTab, setActiveTab] = useState("Products")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("Best Selling")
  const [productLineOpen, setProductLineOpen] = useState(false)
  const [setOpen, setSetOpen] = useState(false)
  const [productTypeOpen, setProductTypeOpen] = useState(false)

  // Sample product data
  const products = [
    {
      id: 1,
      name: "Code Card - Journey Together Booster Pack",
      subtitle: "SV09: Journey Together",
      type: "Code Card",
      image: "https://placeholder.com/300x400",
      listings: 2,
      price: "$0.19",
      marketPrice: "$0.06",
    },
    {
      id: 2,
      name: "Tempest Hawk",
      subtitle: "Tarkir: Dragonstorm",
      type: "Common, #31",
      image: "https://placeholder.com/300x400",
      listings: 14,
      price: "$0.95",
      marketPrice: "$0.61",
    },
    {
      id: 3,
      name: "Code Card - Prismatic Evolutions Booster Pack",
      subtitle: "SV: Prismatic Evolutions",
      type: "Code Card",
      image: "https://placeholder.com/300x400",
      listings: 3,
      price: "$0.09",
      marketPrice: "$0.12",
    },
    {
      id: 4,
      name: "Serena",
      subtitle: "SWSH02: Silver",
      type: "Trainer",
      image: "https://placeholder.com/300x400",
      listings: 5,
      price: "$1.25",
      marketPrice: "$0.95",
    },
    {
      id: 5,
      name: "Pokemon Code Card Bulk Lot",
      subtitle: "Various Sets",
      type: "Code Card",
      image: "https://placeholder.com/300x400",
      listings: 8,
      price: "$4.99",
      marketPrice: "$3.75",
    },
    {
      id: 6,
      name: "Night Stretcher",
      subtitle: "SV: Shrouded Fable",
      type: "Trainer",
      image: "https://placeholder.com/300x400",
      listings: 10,
      price: "$2.50",
      marketPrice: "$1.85",
    },
  ]

  const tabs = ["Products", "Articles", "Decks"]

  const sortOptions = ["Best Selling", "A-Z", "Price: High to Low", "Price: Low to High"]

  const productLineOptions = ["All Product Lines", "Trading Cards", "Accessories", "Sealed Products", "Singles"]

  const setOptions = ["All Sets", "Latest Release", "Standard Sets", "Promotional", "Special Edition"]

  const productTypeOptions = ["All Types", "Common", "Uncommon", "Rare", "Ultra Rare", "Secret Rare"]

  const toggleDropdown = (dropdown) => {
    if (dropdown === "productLine") {
      setProductLineOpen(!productLineOpen)
      setSetOpen(false)
      setProductTypeOpen(false)
    } else if (dropdown === "set") {
      setSetOpen(!setOpen)
      setProductLineOpen(false)
      setProductTypeOpen(false)
    } else if (dropdown === "productType") {
      setProductTypeOpen(!productTypeOpen)
      setProductLineOpen(false)
      setSetOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button className="mr-4 md:hidden">
            <FaBars className="text-gray-700 text-xl" />
          </button>
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 p-1 rounded-md mr-2">
              <div className="bg-white p-1 rounded-sm">
                <div className="bg-blue-500 text-white p-1 rounded-sm flex items-center justify-center">
                  <span className="text-lg font-bold">⚡</span>
                </div>
              </div>
            </div>
            <span className="text-xl font-bold">TCGPLAYER</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 mx-8 relative">
          <input
            type="text"
            placeholder="Try 'poncho pikachu'"
            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaSearch className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center">
          <button className="p-2">
            <FaUser className="text-gray-700 text-xl" />
          </button>
          <button className="p-2 ml-2">
            <FaShoppingCart className="text-gray-700 text-xl" />
          </button>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-4 relative">
        <input
          type="text"
          placeholder="Try 'poncho pikachu'"
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="absolute right-7 top-1/2 transform -translate-y-1/2">
          <FaSearch className="text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex px-4 md:px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-3 px-4 font-medium flex items-center ${
                activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="mr-2">
                {tab === "Products" && "🏷️"}
                {tab === "Articles" && "📄"}
                {tab === "Decks" && "🃏"}
              </span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 md:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-gray-100 rounded-md font-medium">All Filters</button>

          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-dashed border-blue-400 rounded-md font-medium flex items-center"
              onClick={() => toggleDropdown("productLine")}
            >
              Product Line <FaChevronDown className="ml-2 text-xs" />
            </button>
            {productLineOpen && (
              <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                {productLineOptions.map((option) => (
                  <button key={option} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium flex items-center"
              onClick={() => toggleDropdown("set")}
            >
              Set <FaChevronDown className="ml-2 text-xs" />
            </button>
            {setOpen && (
              <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                {setOptions.map((option) => (
                  <button key={option} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md font-medium flex items-center"
              onClick={() => toggleDropdown("productType")}
            >
              Product Type <FaChevronDown className="ml-2 text-xs" />
            </button>
            {productTypeOpen && (
              <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
                {productTypeOptions.map((option) => (
                  <button key={option} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaChevronDown className="text-xs" />
            </div>
          </div>

          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              className={`p-3 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setViewMode("grid")}
            >
              <FaThLarge />
            </button>
            <button
              className={`p-3 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setViewMode("list")}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 md:px-6 py-3 text-gray-700 border-b border-gray-200">
        <span className="font-bold">411,422</span> results in All Products
      </div>

      {/* Product Grid */}
      <div
        className={`p-4 md:p-6 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`border border-gray-200 rounded-md overflow-hidden ${viewMode === "list" ? "flex" : ""}`}
          >
            <div className={`${viewMode === "list" ? "w-1/4" : "w-full"}`}>
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
            <div className={`p-4 ${viewMode === "list" ? "w-3/4" : ""}`}>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.subtitle}</p>
              <p className="text-gray-500">{product.type}</p>
              <p className="mt-2">{product.listings} listings from</p>
              <p className="text-2xl font-bold">{product.price}</p>
              <p className="text-sm">
                Market Price: <span className="text-green-600 font-medium">{product.marketPrice}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EcommerceDashboard
