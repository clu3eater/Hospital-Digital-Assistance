"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Star, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: params.id,
          rating,
          review,
        }),
      })

      if (response.ok) {
        router.push("/patient/appointments?success=true")
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">MediConnect</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Experience</h1>
          <p className="text-gray-600 mb-8">Help other patients make informed decisions</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">How would you rate this appointment?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star
                      className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with the hospital and doctor..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                rows={6}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" /> Submit Review
              </Button>
              <Link href="/patient/appointments" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Skip for Now
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
