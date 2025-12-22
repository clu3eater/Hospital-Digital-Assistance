"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Star, Search, Filter, Loader2, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface Hospital {
  _id: string
  hospitalName: string
  email: string
  phone: string
  city: string
  address: string
  specialties: string[]
  isVerified: boolean
}

export default function HospitalsPage() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }

    fetchHospitals()
  }, [router])

  const fetchHospitals = async (search = "") => {
    setLoading(true)
    setError("")
    try {
      const url = search
        ? `/api/hospital/list?search=${encodeURIComponent(search)}`
        : "/api/hospital/list"
      
      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setHospitals(data.hospitals)
      } else {
        setError(data.error || "Failed to fetch hospitals")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("An error occurred while fetching hospitals")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchHospitals(searchTerm)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (e.target.value === "") {
      fetchHospitals("")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("patientToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("patientData")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PatientDrawer patientName={patientName} />
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">MediConnect</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Link href="/patient/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-8">Find Hospitals</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by hospital name or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Hospitals Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {hospitals.map((hospital) => (
              <Card key={hospital._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{hospital.hospitalName}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.city ? `${hospital.city} - ` : ""}{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞 {hospital.phone}</span>
                  </div>
                </div>

                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Specialties:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hospital.isVerified && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      ✓ Verified Hospital
                    </span>
                  </div>
                )}

                <Link href={`/hospital/${hospital._id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">View Details & Book</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {!loading && hospitals.length === 0 && !error && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </div>
  )
}
