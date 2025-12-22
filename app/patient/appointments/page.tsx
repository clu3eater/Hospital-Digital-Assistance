"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, LogOut, Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface Appointment {
  id: string
  hospital: string
  doctor: string
  date: string
  dateValue?: string
  time: string
  specialty: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  notes?: string
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("10:00 AM")
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)

  useEffect(() => {
    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }
    
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    fetchAppointments(token)
  }, [router])

  const fetchAppointments = async (token: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/appointments/patient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        const formattedAppointments = data.appointments.map((apt: any) => ({
          id: String(apt._id),
          hospital: apt.hospitalId?.hospitalName || "Hospital",
          doctor: apt.doctorId?.name || "Doctor",
          specialty: apt.doctorId?.specialization || "General",
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          dateValue: new Date(apt.appointmentDate).toISOString().split("T")[0],
          time: apt.appointmentTime,
          status: apt.status,
          notes: apt.notes || "",
        }))
        setAppointments(formattedAppointments)
      } else if (data.error) {
        if (data.error.toLowerCase().includes("missing patientid")) {
          // token is stale or missing patientId — force re-login
          localStorage.removeItem("patientToken")
          localStorage.removeItem("userType")
          localStorage.removeItem("patientData")
          router.push("/patient/login")
          return
        }
        setError(data.error)
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      setError("Failed to load appointments")
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

  const handleReschedule = (id: string) => {
    const target = appointments.find((apt) => apt.id === id)
    if (!target) return

    setRescheduleTarget(target)
    setRescheduleDate(target.dateValue || "")
    setRescheduleTime(target.time || "10:00 AM")
    setRescheduleError(null)
    setRescheduleOpen(true)
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
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
        )
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
    }
  }

  const closeReschedule = () => {
    setRescheduleOpen(false)
    setRescheduleTarget(null)
    setRescheduleError(null)
  }

  const submitReschedule = async () => {
    if (!rescheduleTarget) return
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please choose a new date and time")
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const picked = new Date(rescheduleDate)
    picked.setHours(0, 0, 0, 0)
    if (picked < today) {
      setRescheduleError("Date cannot be in the past")
      return
    }

    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    setRescheduleLoading(true)
    setRescheduleError(null)

    try {
      const response = await fetch("/api/appointments/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: rescheduleTarget.id,
          appointmentDate: rescheduleDate,
          appointmentTime: rescheduleTime,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reschedule appointment")
      }

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === rescheduleTarget.id
            ? {
                ...apt,
                date: new Date(rescheduleDate).toLocaleDateString(),
                dateValue: rescheduleDate,
                time: rescheduleTime,
                status: "pending",
              }
            : apt
        )
      )

      closeReschedule()
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule appointment")
    } finally {
      setRescheduleLoading(false)
    }
  }

  const filteredAppointments =
    activeFilter === "all" ? appointments : appointments.filter((apt) => apt.status === activeFilter)

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Appointments</h1>
          <Link href="/hospitals">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="w-4 h-4 mr-2" /> Book New
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["all", "confirmed", "pending", "completed", "cancelled"].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "bg-blue-600" : ""}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {error && <Card className="p-6 text-red-600 mb-4">{error}</Card>}

        {/* Appointments List */}
        <div className="space-y-4">
          {loading && <Card className="p-6 text-gray-600">Loading appointments…</Card>}
          {!loading && filteredAppointments.map((apt) => (
            <Card key={apt.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{apt.hospital}</h3>
                      <p className="text-gray-600">{apt.doctor}</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {apt.specialty}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[apt.status]}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{apt.time}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-900">{apt.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  {apt.status === "confirmed" && (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleReschedule(apt.id)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {apt.status === "pending" && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Waiting for hospital confirmation...</p>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 bg-transparent"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}
                  {apt.status === "completed" && (
                    <Link href={`/appointments/${apt.id}/review`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Leave Review</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {loading
                ? "Loading your appointments..."
                : activeFilter === "all"
                ? "You don't have any appointments yet"
                : `No ${activeFilter} appointments`}
            </p>
            <Link href="/hospitals">
              <Button className="bg-blue-600 hover:bg-blue-700">Book an Appointment</Button>
            </Link>
          </Card>
        )}
      </div>

      {rescheduleOpen && rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">Reschedule appointment</h3>
                <p className="text-sm text-gray-600">The hospital will reconfirm after you submit the new time.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeReschedule} disabled={rescheduleLoading}>
                Close
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">New date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">New time</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>

              {rescheduleError && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
                  {rescheduleError}
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={submitReschedule} disabled={rescheduleLoading}>
                  {rescheduleLoading ? "Updating..." : "Submit changes"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={closeReschedule} disabled={rescheduleLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
