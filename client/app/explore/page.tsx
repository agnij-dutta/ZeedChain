import React from 'react'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card" 
const Explore = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className='border'>Item 1</div>
      <div className=''>Item 2</div>
      <div className=''>Item 3</div>
      <div className=''>Item 4</div>
    </div>
  )
}

export default Explore