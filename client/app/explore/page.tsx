"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
import data from './_data'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card" 
  import Link from 'next/link'
import StartupCard from '@/components/ui/startupcard'
const Explore = () => {
  const [search, setSearch] = React.useState('')
  const filteredData = data.filter(startup => 
    startup.startup_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='flex flex-col items-center justify-center px-10 pt-8 pb-10 w-full'>
        <Input
        className="mb-5"
        type="search"
        placeholder="Search Startups..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 w-full">

      { filteredData.map((startup) => (
        <StartupCard key={startup.startup_name} startup={startup} />
      ))}
    </div></div>
  )
}

export default Explore