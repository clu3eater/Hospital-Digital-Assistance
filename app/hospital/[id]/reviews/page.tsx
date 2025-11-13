"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Heart, Star, User, ArrowLeft, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Review {
  id: number
  patientName: string
  rating: number
  review: string
  date: string
  helpful: number
}

export default function HospitalReviews() {
  const params = useParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    // Mock reviews data
    setReviews([
      {
        id: 1,
        patientName: "John D.",
        rating: 5,
        review:
          "Excellent service and very professional doctors. The hospital is clean and well-maintained. Highly recommended!",
        date: "2024-11-20",
        helpful: 24,
      },
      {
        id: 2,
        patientName: "Sarah M.",
        rating: 4,
        review: "Good experience overall. The staff was helpful but the wait time was longer than expected.",
        date: "2024-11-15",
        helpful: 12,
      },
      {
        id: 3,
        patientName: "Mike T.",
        rating: 5,
        review:
          "Amazing hospital with state-of-the-art equipment. Dr. Smith was very attentive and explained everything clearly.",
        date: "2024-11-10",
        helpful: 18,
      },
      {
        id: 4,
        patientName: "Emma L.",
        rating: 4,
        review: "Very satisfied with the treatment. The only issue was the parking facility could be improved.",
        date: "2024-11-05",
        helpful: 8,
      },
    ])
  }, [])

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sortBy === "highest") return b.rating - a.rating
    if (sortBy === "lowest") return a.rating - b.rating
    if (sortBy === "helpful") return b.helpful - a.helpful
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href={`/hospital/${params.id}`} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">MediConnect</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Patient Reviews</h1>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Rating Summary */}
          <Card className="p-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{averageRating}</div>
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">Based on {reviews.length} reviews</p>
            </div>
          </Card>

          {/* Rating Distribution */}
          <Card className="p-8 lg:col-span-2">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full"
                      style={{
                        width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm text-gray-600">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">All Reviews</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{review.patientName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.review}</p>

              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
