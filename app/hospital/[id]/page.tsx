"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Star, Phone, Calendar, ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

export default function HospitalDetail() {
  const params = useParams()
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("patientData")
    router.push("/")
  }

  // Mock hospital data
  const hospital = {
    id: params.id,
    name: "City General Hospital",
    location: "New York, NY",
    phone: "+1 (555) 123-4567",
    rating: 4.8,
    reviews: 342,
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    doctors: [
      { id: 1, name: "Dr. John Smith", specialty: "Cardiology", available: true },
      { id: 2, name: "Dr. Sarah Johnson", specialty: "Neurology", available: true },
      { id: 3, name: "Dr. Mike Williams", specialty: "Orthopedics", available: false },
    ],
    facilities: ["ICU", "24/7 Emergency", "Surgery Theater", "Pharmacy", "Lab"],
    description:
      "City General Hospital is a leading medical institution with state-of-the-art facilities and experienced healthcare professionals.",
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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{hospital.name}</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Hospital Info */}
            <div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span>{hospital.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span>{hospital.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(hospital.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{hospital.rating}</span>
                  <span className="text-gray-600">({hospital.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{hospital.description}</p>

              <div>
                <h3 className="font-semibold mb-3">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map((facility) => (
                    <span key={facility} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <Card className="p-6 h-fit">
              <h3 className="text-xl font-bold mb-4">Book an Appointment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Doctor</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Choose a doctor...</option>
                    {hospital.doctors.map((doc) => (
                      <option key={doc.id} disabled={!doc.available}>
                        {doc.name} - {doc.specialty} {!doc.available ? "(Unavailable)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                  </select>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Doctors */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Doctors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {hospital.doctors.map((doc) => (
              <Card key={doc.id} className="p-6">
                <h4 className="text-lg font-semibold">{doc.name}</h4>
                <p className="text-gray-600">{doc.specialty}</p>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      doc.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {doc.available ? "Available" : "Not Available"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
