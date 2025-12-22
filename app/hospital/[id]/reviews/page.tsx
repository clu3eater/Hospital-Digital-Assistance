"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Heart, Star, User, ArrowLeft, ThumbsUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Review {
  _id: string
  patientId?: {
    fullName?: string
  }
  rating: number
  comment: string
  createdAt: string
}

export default function HospitalReviews() {
  const params = useParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params?.id) return

    const fetchReviews = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/reviews/hospital/${params.id}`)
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
  }, [params?.id])

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === "highest") return b.rating - a.rating
    if (sortBy === "lowest") return a.rating - b.rating
    if (sortBy === "helpful") return 0
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
              <div className="text-5xl font-bold mb-2">{Number(averageRating).toFixed(1)}</div>
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
                        width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
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
          {loading && (
            <Card className="p-6 text-gray-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
            </Card>
          )}
          {error && <Card className="p-6 text-red-600">{error}</Card>}
          {!loading && !error && sortedReviews.length === 0 && <Card className="p-6 text-gray-600">No reviews yet</Card>}
          {!loading && !error &&
            sortedReviews.map((review) => (
              <Card key={review._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.patientId?.fullName || "Patient"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-line">{review.comment}</p>

                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm" disabled>
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful</span>
                </button>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
