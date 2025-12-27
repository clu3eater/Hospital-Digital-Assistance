"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, Calendar, Users, Star, Clock, CheckCircle, AlertCircle, ChevronRight, Bell, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Appointment {
  id: string
  patientName: string
  date: string
  time: string
  doctor: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  reason?: string
  patientPhone?: string
}

// Polling interval in milliseconds (10 seconds)
const POLLING_INTERVAL = 10000

export default function HospitalDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([])
  const [hospitalName, setHospitalName] = useState("City General Hospital")
  const [isVerified, setIsVerified] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalAppointments: 0,
    averageRating: 0,
    doctors: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAppointmentAlert, setNewAppointmentAlert] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string>("") // Avoid Date object for hydration
  const [isMounted, setIsMounted] = useState(false)
  const previousAppointmentCount = useRef<number>(0)
  const isInitialLoad = useRef<boolean>(true)

  const fetchDashboardData = useCallback(async (token: string, isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true)
        setError(null)
      }

      // Fetch stats
      const statsResponse = await fetch("/api/hospital/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const statsData = await statsResponse.json()

      if (statsResponse.ok) {
        setStats(statsData.stats)
        // Clear error on successful fetch
        if (isBackground) setError(null)
      } else if (statsData.error) {
        // Only show error if not background polling
        if (!isBackground) {
          setError(statsData.error)
        }
        return // Stop if stats fetch failed
      }

      // Fetch pending appointments
      const appointmentsResponse = await fetch("/api/appointments/hospital?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const appointmentsData = await appointmentsResponse.json()

      if (appointmentsResponse.ok) {
        const formattedAppointments = (appointmentsData.appointments || []).map((apt: any) => ({
          id: String(apt._id),
          patientName: apt.patientId?.fullName || "Unknown",
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          time: apt.appointmentTime,
          doctor: apt.doctorId?.name || "Not assigned",
          status: apt.status,
          reason: apt.reason,
          patientPhone: apt.patientId?.phone,
        }))

        // Check for new appointments (only after initial load)
        if (!isInitialLoad.current && formattedAppointments.length > previousAppointmentCount.current) {
          setNewAppointmentAlert(true)
          // Play notification sound (optional - browser may block)
          try {
            const audio = new Audio("/notification.mp3")
            audio.volume = 0.5
            audio.play().catch(() => { }) // Silently fail if autoplay is blocked
          } catch { }
        }

        previousAppointmentCount.current = formattedAppointments.length
        isInitialLoad.current = false
        setAppointments(formattedAppointments)
      } else if (appointmentsData.error) {
        // Only show error if not background polling
        if (!isBackground) {
          setError(appointmentsData.error)
        }
      }

      // Fetch confirmed appointments for schedule view
      const confirmedResponse = await fetch("/api/appointments/hospital?status=confirmed", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const confirmedData = await confirmedResponse.json()

      if (confirmedResponse.ok) {
        const formattedConfirmed = (confirmedData.appointments || []).map((apt: any) => ({
          id: String(apt._id),
          patientName: apt.patientId?.fullName || "Unknown",
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          time: apt.appointmentTime,
          doctor: apt.doctorId?.name || "Not assigned",
          status: apt.status,
          reason: apt.reason,
          patientPhone: apt.patientId?.phone,
        }))
        setConfirmedAppointments(formattedConfirmed)
      } else if (!isBackground && confirmedData.error) {
        setError((prev) => prev || confirmedData.error)
      }

      setLastRefresh(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      if (!isBackground) {
        setError("Failed to load dashboard data")
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [])

  // Initial load and setup polling
  useEffect(() => {
    setIsMounted(true)

    const token = localStorage.getItem("hospitalToken")
    const userType = localStorage.getItem("userType")

    console.log("Hospital Dashboard - Auth Check:", {
      hasToken: !!token,
      userType,
      tokenLength: token?.length
    });

    // Check if user is logged in as hospital
    if (!token) {
      console.log("No hospital token found, redirecting to login");
      localStorage.removeItem("hospitalToken")
      localStorage.removeItem("userType")
      localStorage.removeItem("hospitalData")
      router.push("/hospital/login")
      return
    }

    // Only check userType if it exists (it should be set during login)
    if (userType && userType !== "hospital") {
      console.log("User type mismatch:", userType, "- redirecting to login");
      localStorage.removeItem("hospitalToken")
      localStorage.removeItem("userType")
      localStorage.removeItem("hospitalData")
      router.push("/hospital/login")
      return
    }

    // If userType is not set but token exists, set it (recovery from potential bug)
    if (!userType) {
      console.log("UserType not set, setting it to 'hospital'");
      localStorage.setItem("userType", "hospital")
    }

    const hospitalData = localStorage.getItem("hospitalData")
    if (hospitalData) {
      const hospital = JSON.parse(hospitalData)
      setHospitalName(hospital.hospitalName)
      setIsVerified(hospital.isVerified || false)
    }

    // Initial fetch
    fetchDashboardData(token)

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      const currentToken = localStorage.getItem("hospitalToken")
      if (currentToken) {
        fetchDashboardData(currentToken, true) // Background fetch
      }
    }, POLLING_INTERVAL)

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval)
    }
  }, [router, fetchDashboardData])

  const handleManualRefresh = () => {
    const token = localStorage.getItem("hospitalToken")
    if (token) {
      setNewAppointmentAlert(false)
      fetchDashboardData(token)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hospitalToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("hospitalId")
    router.push("/")
  }

  const handleConfirm = async (id: string) => {
    const token = localStorage.getItem("hospitalToken")
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
          status: "confirmed",
        }),
      })

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id))
        setStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
          confirmed: prev.confirmed + 1,
        }))
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error)
    }
  }

  const handleReject = async (id: string) => {
    const token = localStorage.getItem("hospitalToken")
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
        setAppointments((prev) => prev.filter((apt) => apt.id !== id))
        setStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
        }))
      }
    } catch (error) {
      console.error("Failed to reject appointment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200"
      case "completed":
        return "bg-blue-50 text-blue-800 border-blue-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Appointment Alert Banner */}
      {newAppointmentAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white py-3 px-4 flex items-center justify-center gap-3 shadow-lg animate-pulse">
          <Bell className="w-5 h-5" />
          <span className="font-medium">New appointment request received!</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setNewAppointmentAlert(false)}
            className="ml-4"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`bg-white border-b border-gray-200 sticky ${newAppointmentAlert ? 'top-12' : 'top-0'} z-40 transition-all`}>
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
          <div className="flex items-center gap-4">
            {/* Live Status Indicator */}
            {isMounted && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
                {lastRefresh && (
                  <span className="text-xs">
                    Updated {lastRefresh}
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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status Banner */}
        {!isVerified && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Pending Approval</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Your hospital is currently under review. Once approved by the admin, your hospital will be visible to patients.
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-900">Hospital Verified</h3>
                <p className="text-sm text-emerald-800 mt-1">
                  Your hospital is approved and visible to patients.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your hospital overview</p>
          {loading && <p className="text-sm text-gray-500 mt-2">Loading latest stats…</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Appointments */}
          <Card className="p-6 border-l-4 border-l-yellow-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* Confirmed Appointments */}
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
                <p className="text-xs text-gray-500 mt-2">Scheduled appointments</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          {/* Total Appointments */}
          <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Rating */}
          <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.averageRating}</p>
                <p className="text-xs text-gray-500 mt-2">Patient satisfaction</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Appointments - Main Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pending Appointments</h2>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                  {stats.pending} pending
                </span>
              </div>

              {!loading && appointments.filter((a) => a.status === "pending").length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .filter((a) => a.status === "pending")
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{apt.doctor}</p>
                          </div>
                          <span
                            className={`${getStatusColor("pending")} px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-1`}
                          >
                            {getStatusIcon("pending")}
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          📅 {apt.date} at {apt.time}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleConfirm(apt.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button variant="outline" onClick={() => handleReject(apt.id)} className="flex-1">
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-gray-600">{loading ? "Loading appointments…" : "No pending appointments"}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Confirmed Schedule</h2>
                <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                  {confirmedAppointments.length} confirmed
                </span>
              </div>

              {!loading && confirmedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {confirmedAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                            {apt.patientPhone && (
                              <span className="text-xs text-gray-500">{apt.patientPhone}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{apt.doctor}</p>
                        </div>
                        <span
                          className={`${getStatusColor("confirmed")} px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-1`}
                        >
                          {getStatusIcon("confirmed")}
                          Confirmed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">📅 {apt.date} at {apt.time}</p>
                      {apt.reason && (
                        <p className="text-sm text-gray-700">Reason: {apt.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-600">
                  {loading ? "Loading confirmed appointments…" : "No confirmed appointments yet"}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Links & Info */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/hospital/doctors">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Doctors
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/hospital/settings">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    Hospital Settings
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/hospital/reviews">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Star className="w-4 h-4 mr-2" />
                    View Reviews
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Hospital Stats */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50">
              <h3 className="font-bold text-gray-900 mb-4">Hospital Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Active Doctors</span>
                  <span className="text-lg font-bold text-emerald-600">{stats.doctors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Completed Visits</span>
                  <span className="text-lg font-bold text-blue-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Patient Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold">{stats.averageRating}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
