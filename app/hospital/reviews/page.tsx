"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Star, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface Review {
  id: number
  patientName: string
  rating: number
  review: string
  date: string
  status: "published" | "flagged"
}

export default function HospitalReviewsManagement() {
  const router = useRouter()
  const [hospitalName, setHospitalName] = useState("Hospital")
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/hospital/login")
      return
    }

    const hospitalData = localStorage.getItem("hospitalData")
    if (hospitalData) {
      setHospitalName(JSON.parse(hospitalData).hospitalName)
    }
    
    // Load reviews
    setReviews([
      {
        id: 1,
        patientName: "John D.",
        rating: 5,
        review: "Excellent service and very professional doctors.",
        date: "2024-11-20",
        status: "published",
      },
      {
        id: 2,
        patientName: "Sarah M.",
        rating: 4,
        review: "Good experience overall.",
        date: "2024-11-15",
        status: "published",
      },
    ])
  }, [router])

  const filteredReviews = filter === "all" ? reviews : reviews.filter((r) => r.status === filter)

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
              <p className="text-3xl font-bold">
                {(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-gray-600 text-sm">Flagged Reviews</p>
            <p className="text-3xl font-bold">{reviews.filter((r) => r.status === "flagged").length}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {["all", "published", "flagged"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-emerald-600" : ""}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{review.patientName}</h4>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        review.status === "published" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.review}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
