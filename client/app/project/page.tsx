"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, ChevronDown, Menu, Share2, Star, Volume2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function StartupProfile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-gray-100">
     
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 md:hidden">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link href="#" className="text-xl font-medium text-blue-400">
              Startups
            </Link>
            <Link href="#" className="text-xl font-medium text-gray-200">
              Leaderboard
            </Link>
            <Link href="#" className="text-xl font-medium text-gray-200">
              Projects
            </Link>
            <Link href="#" className="text-xl font-medium text-gray-200">
              Community
            </Link>
            <div className="mt-8 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-gray-700">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="font-medium text-lg">DevUser</span>
            </div>
          </nav>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="px-4 py-3 text-sm text-gray-500 md:px-8 lg:px-12">
        <Link href="#" className="hover:text-gray-300">
          Startups
        </Link>
        {" / "}
        <Link href="#" className="hover:text-gray-300">
          actual project name   
        </Link>
        {" / "}
        <span>About</span>
      </div>

      {/* Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gradient-to-r from-[#5a2e2e] to-[#b85a5a] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end p-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="bg-black/30 hover:bg-black/50 rounded-full">
              <X className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/30 hover:bg-black/50 rounded-full">
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/30 hover:bg-black/50 rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Company Profile */}
      <div className="px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
          <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-[#0a0a0e] bg-[#2a2a30]">
            <Image src="/placeholder.svg?height=160&width=160" alt="NexaTech Logo" fill className="object-cover" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">NexaTech</h1>
              <Check className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-gray-300">
              NexaTech builds innovative AI solutions for enterprise workflow automation and optimization.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-[#2a2a30] hover:bg-[#3a3a40]">
                AI
              </Badge>
              <Badge variant="outline" className="bg-[#2a2a30] hover:bg-[#3a3a40]">
                Enterprise
              </Badge>
              <Badge variant="outline" className="bg-[#2a2a30] hover:bg-[#3a3a40]">
                SaaS
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 md:ml-auto mt-2 md:mt-0">
            <Button variant="outline" size="icon" className="rounded-full">
              <Star className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="grid md:grid-cols-3 gap-8 px-4 md:px-8 lg:px-12 py-8">
        <div className="md:col-span-2">
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">About the Startup</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                NexaTech is a cutting-edge AI startup focused on revolutionizing enterprise workflows through
                intelligent automation. We are building a suite of tools that seamlessly integrate with existing
                business systems to optimize processes, reduce manual work, and provide actionable insights.
              </p>
              <p>
                Our platform uses advanced machine learning algorithms to analyze workflow patterns, identify
                bottlenecks, and suggest improvements. The system adapts over time, learning from user interactions to
                continuously enhance performance.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Our Technology Stack</h3>
              <p>
                The NexaTech platform is built on a robust, scalable architecture designed for enterprise-grade
                reliability and security. Our technology stack includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cloud-native microservices architecture</li>
                <li>Real-time data processing pipeline</li>
                <li>Custom machine learning models for workflow analysis</li>
                <li>Enterprise-grade security and compliance features</li>
                <li>Seamless integration with popular business tools</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">Our Vision</h3>
              <p>
                We believe that AI should augment human capabilities, not replace them. Our vision is to create
                intelligent systems that work alongside humans, handling routine tasks and providing insights that
                enable people to focus on creative problem-solving and strategic thinking.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Partnership Opportunities</h2>
            <div className="space-y-4 text-gray-300">
              <p>NexaTech is actively seeking partnerships with forward-thinking enterprises interested in:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Early access to our workflow optimization platform</li>
                <li>Co-development of industry-specific AI solutions</li>
                <li>Integration with existing enterprise systems</li>
                <li>Research collaboration on next-generation AI applications</li>
              </ul>

              <p className="mt-4">
                Ideal partners have complex workflow challenges that could benefit from intelligent automation and are
                willing to collaborate closely with our team during the implementation process.
              </p>
            </div>
          </section>
        </div>

        <div>
          <div className="bg-[#151518] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Investment Rounds</h3>

            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-blue-900"></div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <h4 className="font-medium">Series A</h4>
                  <p className="text-sm text-gray-400">$12M • March 2024</p>
                  <p className="mt-1 text-sm">Led by Acme Ventures with participation from Tech Innovators Fund</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-blue-900"></div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <h4 className="font-medium">Seed Round</h4>
                  <p className="text-sm text-gray-400">$3.5M • June 2023</p>
                  <p className="mt-1 text-sm">Led by Early Stage Partners with angel investors</p>
                </div>
              </div>

              <div className="relative">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <h4 className="font-medium">Pre-Seed</h4>
                  <p className="text-sm text-gray-400">$750K • November 2022</p>
                  <p className="mt-1 text-sm">Bootstrapped with initial angel investment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#151518] rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Team</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="CEO" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-gray-400">CEO & Co-founder</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="CTO" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-gray-400">CTO & Co-founder</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="CPO" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Alex Rivera</p>
                  <p className="text-sm text-gray-400">Chief Product Officer</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2">
                View All Team Members
              </Button>
            </div>
          </div>

          <div className="bg-[#151518] rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect with NexaTech</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

