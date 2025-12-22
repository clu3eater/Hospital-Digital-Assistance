"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, LogOut, Plus, Calendar, Loader2, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface Appointment {
  _id: string
  hospitalId: {
    hospitalName: string
    address: string
  }
  doctorId: {
    name: string
    specialization: string
  }
  appointmentDate: string
  appointmentTime: string
  status: string
  reason: string
}

// Polling interval in milliseconds (10 seconds)
const POLLING_INTERVAL = 10000

export default function PatientDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientName, setPatientName] = useState("")
  const [statusUpdateAlert, setStatusUpdateAlert] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>("") // Avoid Date for hydration
  const [isMounted, setIsMounted] = useState(false)
  const previousStatuses = useRef<Map<string, string>>(new Map())
  const isInitialLoad = useRef<boolean>(true)

  const fetchAppointments = useCallback(async (token: string, isBackground = false) => {
    try {
      if (!isBackground) {
        setError(null)
      }
      const response = await fetch("/api/appointments/patient", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await response.json()

      if (response.ok) {
        // Get upcoming appointments only (pending or confirmed, not past dates)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today
        
        const upcoming = data.appointments.filter(
          (apt: Appointment) => {
            const aptDate = new Date(apt.appointmentDate)
            aptDate.setHours(0, 0, 0, 0)
            return (
              (apt.status === "pending" || apt.status === "confirmed") &&
              aptDate >= today
            )
          }
        )

        // Check for status changes (only after initial load)
        if (!isInitialLoad.current) {
          upcoming.forEach((apt: Appointment) => {
            const prevStatus = previousStatuses.current.get(apt._id)
            if (prevStatus && prevStatus !== apt.status) {
              if (apt.status === "confirmed") {
                setStatusUpdateAlert(`Your appointment at ${apt.hospitalId?.hospitalName} has been confirmed!`)
                setTimeout(() => setStatusUpdateAlert(null), 5000)
              }
            }
          })
        }

        // Update previous statuses
        previousStatuses.current.clear()
        upcoming.forEach((apt: Appointment) => {
          previousStatuses.current.set(apt._id, apt.status)
        })
        isInitialLoad.current = false

        setAppointments(upcoming)
        setLastRefresh(new Date().toLocaleTimeString())
      } else if (data.error) {
        if (!isBackground) {
          setError(data.error)
        }
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      if (!isBackground) {
        setError("Failed to load appointments")
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    
    const token = localStorage.getItem("patientToken")
    // Only require the patient token; userType may change if another role logs in on the same browser
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      const patient = JSON.parse(patientData)
      setPatientName(patient.fullName)
    }

    // Initial fetch
    fetchAppointments(token)

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      const currentToken = localStorage.getItem("patientToken")
      if (currentToken) {
        fetchAppointments(currentToken, true) // Background fetch
      }
    }, POLLING_INTERVAL)

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval)
    }
  }, [router, fetchAppointments])

  const handleManualRefresh = () => {
    const token = localStorage.getItem("patientToken")
    if (token) {
      setLoading(true)
      fetchAppointments(token)
    }
  }

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem("patientToken")
    if (!token) return

    try {
      const response = await fetch("/api/appointments/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: id,
          status: "cancelled",
        }),
      })

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt._id !== id))
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
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
      {/* Status Update Alert Banner */}
      {statusUpdateAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white py-3 px-4 flex items-center justify-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{statusUpdateAlert}</span>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => setStatusUpdateAlert(null)}
            className="ml-4"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`bg-white border-b border-blue-100 ${statusUpdateAlert ? 'mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PatientDrawer patientName={patientName} />
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">MediConnect</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            {isMounted && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
                {lastRefresh && (
                  <span className="text-xs">
                    {lastRefresh}
                  </span>
                )}
              </div>
            )}
            {/* Manual Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={loading}
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back{patientName ? `, ${patientName}` : ""}! Manage your appointments
            </p>
          </div>
          <Link href="/hospitals">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Book Appointment
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {error && !loading && (
          <Card className="p-6 mb-6 text-red-600">{error}</Card>
        )}

        {/* Appointments */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {appointments.map((apt) => (
              <Card key={apt._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{apt.hospitalId?.hospitalName || "Hospital"}</h3>
                    <p className="text-gray-600">with {apt.doctorId?.name || "Doctor"}</p>
                    {apt.doctorId?.specialization && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {apt.doctorId.specialization}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      apt.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                    </span>
                  </div>
                  {apt.reason && (
                    <p className="text-sm text-gray-600">
                      <strong>Reason:</strong> {apt.reason}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href="/patient/appointments" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 bg-transparent"
                    onClick={() => handleCancel(apt._id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
            <p className="text-gray-600 mb-6">Book your first appointment with a hospital</p>
            <Link href="/hospitals">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Hospitals</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
