"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, LogOut, Plus, Calendar, Loader2 } from "lucide-react"
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

export default function PatientDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [patientName, setPatientName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      const patient = JSON.parse(patientData)
      setPatientName(patient.fullName)
    }

    fetchAppointments(token)
  }, [router])

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch("/api/appointments/patient", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        // Get upcoming appointments only
        const upcoming = data.appointments.filter(
          (apt: Appointment) => 
            apt.status !== "completed" && 
            apt.status !== "cancelled" &&
            new Date(apt.appointmentDate) >= new Date()
        )
        setAppointments(upcoming)
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem("token")
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
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    router.push("/")
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
          <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
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
