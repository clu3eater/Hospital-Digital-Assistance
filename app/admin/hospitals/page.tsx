"use client"

import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Shield, LogOut, Building2, CheckCircle, XCircle, Search, Filter, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Hospital {
  _id: string
  hospitalName: string
  email: string
  phone: string
  city: string
  address: string
  specialties: string[]
  isVerified: boolean
  createdAt: string
}

function AdminHospitalsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [adminName, setAdminName] = useState("")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState(searchParams.get("filter") || "all")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const userType = localStorage.getItem("userType")

    if (!token || userType !== "admin") {
      router.push("/admin/login")
      return
    }

    const adminData = localStorage.getItem("adminData")
    if (adminData) {
      setAdminName(JSON.parse(adminData).username)
    }

    fetchHospitals(token)
  }, [router])

  useEffect(() => {
    filterHospitals()
  }, [hospitals, filter, searchTerm])

  const fetchHospitals = async (token: string) => {
    try {
      const response = await fetch("/api/hospital/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setHospitals(data.hospitals)
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterHospitals = () => {
    let filtered = hospitals

    // Filter by verification status
    if (filter === "verified") {
      filtered = filtered.filter((h) => h.isVerified)
    } else if (filter === "pending") {
      filtered = filtered.filter((h) => !h.isVerified)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (h) =>
          h.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredHospitals(filtered)
  }

  const handleApprove = async (hospitalId: string) => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    setProcessingId(hospitalId)
    try {
      const response = await fetch("/api/hospital/approve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalId,
          isVerified: true,
        }),
      })

      if (response.ok) {
        setHospitals((prev) =>
          prev.map((h) => (h._id === hospitalId ? { ...h, isVerified: true } : h))
        )
      }
    } catch (error) {
      console.error("Failed to approve hospital:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (hospitalId: string) => {
    const token = localStorage.getItem("adminToken")
    if (!token) return

    setProcessingId(hospitalId)
    try {
      const response = await fetch("/api/hospital/approve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalId,
          isVerified: false,
        }),
      })

      if (response.ok) {
        setHospitals((prev) =>
          prev.map((h) => (h._id === hospitalId ? { ...h, isVerified: false } : h))
        )
      }
    } catch (error) {
      console.error("Failed to reject hospital:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("adminData")
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Admin Portal</span>
              <p className="text-xs text-gray-600">{adminName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hospital Management</h1>
          <p className="text-gray-600">Approve or manage hospital registrations</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, city, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
              className={filter === "all" ? "bg-purple-600" : ""}
            >
              All ({hospitals.length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              size="sm"
              className={filter === "pending" ? "bg-purple-600" : ""}
            >
              Pending ({hospitals.filter((h) => !h.isVerified).length})
            </Button>
            <Button
              variant={filter === "verified" ? "default" : "outline"}
              onClick={() => setFilter("verified")}
              size="sm"
              className={filter === "verified" ? "bg-purple-600" : ""}
            >
              Verified ({hospitals.filter((h) => h.isVerified).length})
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Hospitals List */}
        {!loading && (
          <div className="grid gap-4">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital._id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{hospital.hospitalName}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              hospital.isVerified
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {hospital.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📧 {hospital.email}</p>
                          <p>📞 {hospital.phone}</p>
                          <p>📍 {hospital.city} - {hospital.address}</p>
                          <p className="text-xs text-gray-500">
                            Registered: {new Date(hospital.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {hospital.specialties && hospital.specialties.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {hospital.specialties.map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!hospital.isVerified ? (
                      <Button
                        onClick={() => handleApprove(hospital._id)}
                        disabled={processingId === hospital._id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        {processingId === hospital._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleReject(hospital._id)}
                        disabled={processingId === hospital._id}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        size="sm"
                      >
                        {processingId === hospital._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredHospitals.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hospitals found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : filter === "pending"
                  ? "No hospitals pending approval"
                  : "No hospitals registered yet"}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AdminHospitals() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <AdminHospitalsContent />
    </Suspense>
  )
}
