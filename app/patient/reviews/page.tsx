"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, LogOut, Star, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface ReviewItem {
  _id: string
  hospitalId?: {
    _id: string
    hospitalName?: string
    city?: string
  }
  rating: number
  comment: string
  createdAt: string
}

type SortKey = "recent" | "highest" | "lowest"

export default function PatientReviewsPage() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>("recent")

  useEffect(() => {
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      const patient = JSON.parse(patientData)
      setPatientName(patient.fullName)
    }

    fetchReviews(token)
  }, [router])

  const fetchReviews = async (token: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/reviews/patient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
      } else {
        if (data.error?.toLowerCase().includes("missing patientid")) {
          localStorage.removeItem("patientToken")
          localStorage.removeItem("userType")
          localStorage.removeItem("patientData")
          router.push("/patient/login")
          return
        }
        setError(data.error || "Failed to load reviews")
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err)
      setError("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("patientToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("patientData")
    router.push("/")
  }

  const sortedReviews = useMemo(() => {
    const list = [...reviews]
    list.sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "highest") return b.rating - a.rating
      if (sortBy === "lowest") return a.rating - b.rating
      return 0
    })
    return list
  }, [reviews, sortBy])

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
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">My Reviews</h1>
            <p className="text-gray-600">View and manage the reviews you've shared</p>
          </div>
          <Card className="p-4 flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            </div>
          </Card>
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-end">
          <div className="flex gap-2">
            {[{ key: "recent", label: "Recent" }, { key: "highest", label: "Highest" }, { key: "lowest", label: "Lowest" }].map(
              (opt) => (
                <Button
                  key={opt.key}
                  size="sm"
                  variant={sortBy === opt.key ? "default" : "outline"}
                  className={sortBy === opt.key ? "bg-blue-600" : ""}
                  onClick={() => setSortBy(opt.key as SortKey)}
                >
                  {opt.label}
                </Button>
              )
            )}
          </div>
        </div>

        {loading && (
          <Card className="p-6 text-gray-600 flex items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
          </Card>
        )}
        {error && <Card className="p-6 text-red-600 mb-4">{error}</Card>}

        {!loading && !error && sortedReviews.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No reviews yet</h3>
            <p className="text-gray-600">Share your experience after your appointments.</p>
            <div className="mt-4">
              <Link href="/patient/appointments">
                <Button className="bg-blue-600 hover:bg-blue-700">View Appointments</Button>
              </Link>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {!loading && !error &&
            sortedReviews.map((rev) => (
              <Card key={rev._id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{rev.hospitalId?.hospitalName || "Hospital"}</h3>
                    {rev.hospitalId?.city && <p className="text-sm text-gray-600">{rev.hospitalId.city}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-700 ml-2">{rev.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{rev.comment}</p>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
