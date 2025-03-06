"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import StartupCard, { type StartupData } from "@/components/ui/startupcard"
import CategoryFilter, { type Category } from "@/components/ui/category-filter"

// Sample data with added fields for the project view
const data: StartupData[] = [
  {
    startup_name: "MediTrack",
    logo_url: "https://github.com/psycocodes.png",
    current_valuation: "$1.2M",
    funding_progress: 40,
    total_amount_being_raised: "$2M",
    minimum_investment: "$10K",
    available_equity_offered: "15%",
    industry: "HealthTech",
    university_affiliation: "Harvard",
    description: "A healthcare platform for tracking medical records and appointments.",
    days_left: 25,
  },
  {
    startup_name: "InnoFund",
    logo_url: "/placeholder.svg?height=100&width=100",
    current_valuation: "$250K",
    funding_progress: 65,
    total_amount_being_raised: "$500K",
    minimum_investment: "$5K",
    available_equity_offered: "10%",
    industry: "FinTech",
    university_affiliation: "MIT",
    description: "Democratizing access to startup funding for university entrepreneurs.",
    days_left: 15,
  },
  {
    startup_name: "Community Learning Platform",
    logo_url: "/placeholder.svg?height=100&width=100",
    current_valuation: "$800K",
    funding_progress: 75,
    total_amount_being_raised: "$10000K",
    minimum_investment: "$8K",
    available_equity_offered: "8%",
    industry: "Education",
    university_affiliation: "Stanford",
    description: "An online platform for sharing knowledge and skills within our community.",
    days_left: 15,
  },
  {
    startup_name: "Local Mentorship Program",
    logo_url: "/placeholder.svg?height=100&width=100",
    current_valuation: "$500K",
    funding_progress: 64,
    total_amount_being_raised: "$5000K",
    minimum_investment: "$5K",
    available_equity_offered: "12%",
    industry: "Community",
    university_affiliation: "Yale",
    description: "Connecting experienced professionals with aspiring individuals in our community.",
    days_left: 20,
  },
  {
    startup_name: "EcoSolutions",
    logo_url: "/placeholder.svg?height=100&width=100",
    current_valuation: "$1.5M",
    funding_progress: 30,
    total_amount_being_raised: "$3M",
    minimum_investment: "$15K",
    available_equity_offered: "7%",
    industry: "Environment",
    university_affiliation: "Berkeley",
    description: "Sustainable solutions for environmental challenges.",
    days_left: 30,
  },
  {
    startup_name: "ArtSpace",
    logo_url: "/placeholder.svg?height=100&width=100",
    current_valuation: "$400K",
    funding_progress: 50,
    total_amount_being_raised: "$800K",
    minimum_investment: "$4K",
    available_equity_offered: "20%",
    industry: "Arts & Culture",
    university_affiliation: "RISD",
    description: "A platform for artists to showcase and sell their work.",
    days_left: 18,
  },
]

// Map industry to category for filtering
const industryToCategoryMap: Record<string, Category> = {
  FinTech: "Technology",
  HealthTech: "Wellness",
  Education: "Education",
  Community: "Community",
  Environment: "Environment",
  "Arts & Culture": "Arts & Culture",
}

const Explore = () => {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")

  // Filter data based on search and category
  const filteredData = data.filter((startup) => {
    const matchesSearch = startup.startup_name.toLowerCase().includes(search.toLowerCase())

    if (selectedCategory === "All") {
      return matchesSearch
    }

    // Get the mapped category or use the industry directly
    const startupCategory = industryToCategoryMap[startup.industry] || startup.industry

    return matchesSearch && startupCategory === selectedCategory
  })

  return (
    <div className="flex flex-col items-center justify-center px-10 pt-8 pb-10 w-full bg-black text-white min-h-screen">
      <div className="w-full max-w-7xl">
        <Input
          className="mb-5 bg-gray-900 border-gray-800 text-white"
          type="search"
          placeholder="Search Startups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full">
          {filteredData.map((startup) => (
            <StartupCard key={startup.startup_name} startup={startup} variant="project" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Explore

