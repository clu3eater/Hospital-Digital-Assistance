"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Star, User, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Review {
  _id: string
  patientId?: {
    fullName?: string
  }
  rating: number
  comment: string
  createdAt: string
}

export default function HospitalReviewsManagement() {
  const router = useRouter()
  const [hospitalName, setHospitalName] = useState("Hospital")
  const [hospitalId, setHospitalId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent")

  useEffect(() => {
    const token = localStorage.getItem("hospitalToken")
    if (!token) {
      router.push("/hospital/login")
      return
    }

    const hospitalData = localStorage.getItem("hospitalData")
    if (hospitalData) {
      const parsed = JSON.parse(hospitalData)
      setHospitalName(parsed.hospitalName)
      setHospitalId(parsed._id || parsed.hospitalId || parsed.id)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem("hospitalToken")
    if (!token || !hospitalId) return

    const fetchReviews = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/reviews/hospital/${hospitalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Failed to load reviews")
        }
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
      } catch (err: any) {
        setError(err.message || "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [hospitalId])

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === "highest") return b.rating - a.rating
    if (sortBy === "lowest") return a.rating - b.rating
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">HDAS</span>
              <p className="text-xs text-gray-600">{hospitalName}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Patient Reviews</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Total Reviews</p>
            <p className="text-3xl font-bold">{reviews.length}</p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-600 text-sm">Average Rating</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-gray-600 text-sm">5-Star Share</p>
            <p className="text-3xl font-bold">
              {reviews.length > 0
                ? Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)
                : 0}
              %
            </p>
          </Card>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-gray-600">Sort by</span>
          <div className="flex gap-2">
            {[
              { key: "recent", label: "Most Recent" },
              { key: "highest", label: "Highest Rated" },
              { key: "lowest", label: "Lowest Rated" },
            ].map((opt) => (
              <Button
                key={opt.key}
                size="sm"
                variant={sortBy === opt.key ? "default" : "outline"}
                className={sortBy === opt.key ? "bg-emerald-600" : ""}
                onClick={() => setSortBy(opt.key as any)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {loading && (
            <Card className="p-6 text-gray-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
            </Card>
          )}
          {error && <Card className="p-6 text-red-600">{error}</Card>}
          {!loading && !error && sortedReviews.length === 0 && (
            <Card className="p-6 text-gray-600">No reviews yet</Card>
          )}
          {!loading && !error &&
            sortedReviews.map((review) => (
              <Card key={review._id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{review.patientId?.fullName || "Patient"}</h4>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
