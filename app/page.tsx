"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Star, Clock, Users, Shield } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [userType, setUserType] = useState<"patient" | "hospital" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">MediConnect</span>
          </div>
          <div className="flex gap-4">
            <Link href="/patient/login">
              <Button variant="outline">Patient Login</Button>
            </Link>
            <Link href="/hospital/login">
              <Button variant="outline">Hospital Login</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="text-purple-600">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Your Healthcare, Simplified</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find the best hospitals, book appointments, and manage your health all in one place. Connect with quality
            healthcare providers instantly.
          </p>

          {/* User Type Selection */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer flex-1 max-w-sm">
              <div className="flex flex-col items-center gap-4">
                <Users className="w-12 h-12 text-blue-600" />
                <h3 className="text-xl font-semibold">I'm a Patient</h3>
                <p className="text-gray-600">Find hospitals, book appointments</p>
                <Link href="/patient/register" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer flex-1 max-w-sm">
              <div className="flex flex-col items-center gap-4">
                <Shield className="w-12 h-12 text-emerald-600" />
                <h3 className="text-xl font-semibold">I'm a Hospital</h3>
                <p className="text-gray-600">Manage your profile and appointments</p>
                <Link href="/hospital/register" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="flex gap-4">
            <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Find Hospitals Near You</h4>
              <p className="text-gray-600">Search by location, specialty, and facilities</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Book Instantly</h4>
              <p className="text-gray-600">Get appointments at your preferred time</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Star className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Read Reviews</h4>
              <p className="text-gray-600">Make informed decisions with ratings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
