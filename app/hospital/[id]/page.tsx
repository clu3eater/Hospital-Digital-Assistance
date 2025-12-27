"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Star, Phone, Calendar, ArrowLeft, LogOut, Loader2, Video } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface Hospital {
  _id: string
  hospitalName: string
  city: string
  address: string
  phone: string
  specialties?: string[]
  isVerified?: boolean
}

interface Doctor {
  _id: string
  name: string
  specialization: string
  qualification?: string
  experience?: number
  isActive: boolean
}

export default function HospitalDetail() {
  const params = useParams()
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Booking form state
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("10:00 AM")
  const [reason, setReason] = useState("")
  const [visitType, setVisitType] = useState<"in_person" | "telehealth">("in_person")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("patientToken")
    // Only require a patient token; do not log out if another role changed userType in the same browser
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }

    const hospitalId = params?.id ? String(params.id) : null
    if (hospitalId) {
      fetchHospital(hospitalId)
    }
  }, [router, params])

  const fetchHospital = async (hospitalId: string) => {
    try {
      setLoading(true)
      setError(null)

      const hospitalRes = await fetch(`/api/hospital/${encodeURIComponent(hospitalId)}`)
      const hospitalData = await hospitalRes.json()
      if (!hospitalRes.ok || !hospitalData.hospital) throw new Error(hospitalData.error || "Hospital not found")
      console.log("Fetched hospital data:", {
        _id: hospitalData.hospital._id,
        name: hospitalData.hospital.hospitalName
      });
      setHospital(hospitalData.hospital)

      const doctorsRes = await fetch(`/api/doctors/${encodeURIComponent(hospitalId)}`)
      const doctorsData = await doctorsRes.json()
      if (doctorsRes.ok) {
        setDoctors(doctorsData.doctors || [])
      } else if (doctorsData.error) {
        setError((prev) => prev || doctorsData.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load hospital details")
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

  const handleBookAppointment = async () => {
    setBookingError(null)
    setBookingSuccess(false)

    if (!selectedDoctorId) {
      setBookingError("Please select a doctor")
      return
    }
    if (!appointmentDate) {
      setBookingError("Please select a date")
      return
    }
    if (!reason.trim()) {
      setBookingError("Please provide a reason for the appointment")
      return
    }

    const token = localStorage.getItem("patientToken")
    if (!token) {
      setBookingError("Please login as a patient to book appointments")
      router.push("/patient/login")
      return
    }

    setBookingLoading(true)
    try {
      const appointmentPayload = {
        hospitalId: hospital?._id,
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        visitType,
      };

      console.log("Booking appointment with payload:", appointmentPayload);

      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentPayload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment")
      }

      setBookingSuccess(true)
      // Reset form
      setSelectedDoctorId("")
      setAppointmentDate("")
      setReason("")
      setVisitType("in_person")

      // Redirect to patient appointments after a short delay
      setTimeout(() => {
        router.push("/patient/appointments")
      }, 2000)
    } catch (err: any) {
      setBookingError(err.message || "Failed to book appointment")
    } finally {
      setBookingLoading(false)
    }
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
            <Link href="/hospitals">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hospitals
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading hospital details…
          </div>
        )}
        {error && <Card className="p-6 mb-6 text-red-600">{error}</Card>}
        {!loading && !error && !hospital && (
          <Card className="p-6">Hospital not found.</Card>
        )}

        {!loading && !error && hospital && (
          <>
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">{hospital.hospitalName}</h1>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Hospital Info */}
                <div>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span>
                        {hospital.city ? `${hospital.city} - ` : ""}
                        {hospital.address}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <span>{hospital.phone}</span>
                    </div>

                    {hospital.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Verified Hospital
                      </span>
                    )}
                  </div>

                  {hospital.specialties && hospital.specialties.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((spec) => (
                          <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-gray-600 mb-6">Book an appointment with one of the available doctors below.</p>
                </div>

                {/* Booking Section */}
                <Card className="p-6 h-fit">
                  <h3 className="text-xl font-bold mb-4">Book an Appointment</h3>

                  {bookingSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
                      Appointment booked successfully! Redirecting to your appointments...
                    </div>
                  )}
                  {bookingError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                      {bookingError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Doctor</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                      >
                        <option value="">Choose a doctor...</option>
                        {doctors.filter(doc => doc.isActive).map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.name} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Select Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Select Time</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
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

                    <div>
                      <label className="block text-sm font-medium mb-2">Visit Type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="visitType"
                            value="in_person"
                            checked={visitType === "in_person"}
                            onChange={() => setVisitType("in_person")}
                            className="text-blue-600"
                          />
                          <span className="text-sm">In-Person</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="visitType"
                            value="telehealth"
                            checked={visitType === "telehealth"}
                            onChange={() => setVisitType("telehealth")}
                            className="text-blue-600"
                          />
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Telehealth</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        placeholder="Describe your symptoms or reason for the appointment..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleBookAppointment}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Doctors */}
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold">Doctors</h2>
                <span className="text-sm text-gray-600">{doctors.length} listed</span>
              </div>

              {doctors.length === 0 && <Card className="p-6">No doctors listed yet.</Card>}

              <div className="grid md:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <Card key={doc._id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold uppercase">
                        {doc.name?.slice(0, 2) || "Dr"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-lg font-semibold leading-tight">{doc.name}</h4>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${doc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {doc.isActive ? "Available" : "Not Available"}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{doc.specialization}</p>
                        {doc.qualification && (
                          <p className="text-sm text-gray-500 mt-1">{doc.qualification}</p>
                        )}
                        {typeof doc.experience === "number" && (
                          <p className="text-sm text-gray-500">Experience: {doc.experience} yrs</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
