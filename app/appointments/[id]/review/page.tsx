"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Star, Send, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface AppointmentDetails {
  _id: string
  hospitalId: {
    _id: string
    hospitalName: string
  }
  doctorId: {
    name: string
    specialization: string
  }
  appointmentDate: string
  status: string
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    fetchAppointment(token)
  }, [router, params])

  const fetchAppointment = async (token: string) => {
    try {
      const appointmentId = params?.id ? String(params.id) : null
      if (!appointmentId) {
        setError("Invalid appointment ID")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok && data.appointment) {
        if (data.appointment.status !== "completed") {
          setError("You can only review completed appointments")
        } else {
          setAppointment(data.appointment)
        }
      } else {
        setError(data.error || "Appointment not found")
      }
    } catch (err) {
      setError("Failed to load appointment details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!appointment?.hospitalId?._id) {
      setError("Hospital information not available")
      return
    }

    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalId: appointment.hospitalId._id,
          rating,
          comment: review,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/patient/appointments")
        }, 2000)
      } else {
        setError(data.error || "Failed to submit review")
      }
    } catch (err) {
      setError("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
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
          <Link href="/patient/appointments">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Appointments
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8">
          {error && !appointment ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/patient/appointments">
                <Button className="bg-blue-600 hover:bg-blue-700">Back to Appointments</Button>
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600 fill-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
              <p className="text-gray-600">Your review has been submitted successfully.</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to appointments...</p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Share Your Experience</h1>
              <p className="text-gray-600 mb-6">Help other patients make informed decisions</p>

              {appointment && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900">{appointment.hospitalId?.hospitalName}</h3>
                  <p className="text-sm text-blue-700">
                    Dr. {appointment.doctorId?.name} - {appointment.doctorId?.specialization}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}

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
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Submit Review
                      </>
                    )}
                  </Button>
                  <Link href="/patient/appointments" className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Skip for Now
                    </Button>
                  </Link>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
