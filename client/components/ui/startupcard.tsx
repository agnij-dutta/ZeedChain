"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { BookOpen, Users, Cpu, Leaf, PaintbrushIcon as PaintBrush, Heart, Briefcase } from "lucide-react"

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  Education: <BookOpen className="h-5 w-5" />,
  Community: <Users className="h-5 w-5" />,
  Technology: <Cpu className="h-5 w-5" />,
  Environment: <Leaf className="h-5 w-5" />,
  "Arts & Culture": <PaintBrush className="h-5 w-5" />,
  Wellness: <Heart className="h-5 w-5" />,
  FinTech: <Briefcase className="h-5 w-5" />,
  HealthTech: <Heart className="h-5 w-5" />,
}

// Map industry to category for filtering
const industryToCategoryMap: Record<string, string> = {
  FinTech: "Technology",
  HealthTech: "Wellness",
  // Add more mappings as needed
}

export type StartupData = {
  startup_name: string
  logo_url: string
  current_valuation: string
  funding_progress: number
  total_amount_being_raised: string
  minimum_investment: string
  available_equity_offered: string
  industry: string
  university_affiliation: string
  description?: string
  days_left?: number
}

interface StartupCardProps {
  startup: StartupData
  variant?: "default" | "project"
}

const StartupCard = ({ startup, variant = "default" }: StartupCardProps) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/explore/${startup.startup_name}`)
  }

  // Get the category based on industry or use industry directly
  const category = industryToCategoryMap[startup.industry] || startup.industry

  // Get the appropriate icon or default to Briefcase
  const CategoryIcon = categoryIcons[category] || <Briefcase className="h-5 w-5" />

  if (variant === "project") {
    // Project card variant (like in the image)
    return (
      <Card className="w-full bg-black text-white border-gray-800 hover:border-gray-700 transition-all duration-200">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold">{startup.startup_name}</CardTitle>
            <div className="text-yellow-500 mt-1">{startup.industry}</div>
          </div>
          <div className="text-primary">{CategoryIcon}</div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            {startup.description ||
              `An innovative ${startup.industry} startup affiliated with ${startup.university_affiliation}.`}
          </p>

          <Progress value={startup.funding_progress} className="h-2 mb-2" />

          <div className="flex justify-between text-sm mb-4">
            <div>
              $
              {((startup.funding_progress / 100) *
                Number.parseInt(startup.total_amount_being_raised.replace(/\D/g, ""))) /
                1000}
              K raised
            </div>
            <div>{startup.total_amount_being_raised} goal</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-gray-400">{startup.days_left || 15} days left</div>
            <button
              className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
              onClick={handleClick}
            >
              Support This Project
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default startup card variant (original design with improvements)
  return (
    <Card
      className="w-full bg-black text-white border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <img
          src={startup.logo_url || "/placeholder.svg"}
          alt={`${startup.startup_name} logo`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <CardTitle className="text-xl font-bold">{startup.startup_name}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary" className="bg-opacity-20">
              {startup.industry}
            </Badge>
            <Badge variant="outline">{startup.university_affiliation}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Current Valuation</p>
            <p className="font-semibold">{startup.current_valuation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Raising</p>
            <p className="font-semibold">{startup.total_amount_being_raised}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Funding Progress</p>
          <Progress value={startup.funding_progress} className="h-2" />
          <p className="text-sm text-gray-400 mt-1 text-right">{startup.funding_progress}% Funded</p>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-gray-800 pt-4">
          <div>
            <p className="text-xs text-gray-400">Min Investment</p>
            <p className="font-medium text-sm">{startup.minimum_investment}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Equity Offered</p>
            <p className="font-medium text-sm">{startup.available_equity_offered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">University</p>
            <p className="font-medium text-sm">{startup.university_affiliation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StartupCard

