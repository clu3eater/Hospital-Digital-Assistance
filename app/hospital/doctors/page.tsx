"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Check, X, Stethoscope, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Doctor {
  id: number
  name: string
  specialty: string
  qualifications: string
  phone: string
  email?: string
}

export default function DoctorsManagement() {
  const router = useRouter()
  const [hospitalName, setHospitalName] = useState("Hospital")
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      name: "Dr. John Smith",
      specialty: "Cardiology",
      qualifications: "MD, Board Certified",
      phone: "+1 (555) 111-1111",
      email: "john.smith@hospital.com",
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      specialty: "Neurology",
      qualifications: "MD, PhD",
      phone: "+1 (555) 222-2222",
      email: "sarah.johnson@hospital.com",
    },
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    qualifications: "",
    phone: "",
    email: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/hospital/login")
      return
    }

    const hospitalData = localStorage.getItem("hospitalData")
    if (hospitalData) {
      setHospitalName(JSON.parse(hospitalData).hospitalName)
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDoctor((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Update existing doctor
        setDoctors(doctors.map((d) => (d.id === editingId ? ({ ...newDoctor, id: editingId } as Doctor) : d)))
        setEditingId(null)
      } else {
        // Add new doctor
        const doctor = {
          id: Date.now(),
          ...newDoctor,
        } as Doctor
        setDoctors([...doctors, doctor])
      }
      setNewDoctor({ name: "", specialty: "", qualifications: "", phone: "", email: "" })
      setIsAdding(false)
    } catch (error) {
      console.error("Failed to add/update doctor:", error)
    }
  }

  const handleEditDoctor = (doctor: Doctor) => {
    setNewDoctor({
      name: doctor.name,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      phone: doctor.phone,
      email: doctor.email || "",
    })
    setEditingId(doctor.id)
    setIsAdding(true)
  }

  const handleDeleteDoctor = (id: number) => {
    setDoctors(doctors.filter((d) => d.id !== id))
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setNewDoctor({ name: "", specialty: "", qualifications: "", phone: "", email: "" })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("hospitalId")
    localStorage.removeItem("hospitalData")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
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
            <Link href="/hospital/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-gray-600 mt-2">Add, edit, and manage your hospital's medical staff</p>
          </div>
          <Button
            onClick={() => {
              setIsAdding(!isAdding)
              if (isAdding) handleCancel()
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Doctor
          </Button>
        </div>

        {/* Add/Edit Doctor Form */}
        {isAdding && (
          <Card className="p-6 mb-8 bg-emerald-50 border-emerald-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "Edit Doctor" : "Add New Doctor"}</h2>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newDoctor.name}
                    onChange={handleInputChange}
                    placeholder="Dr. Full Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    value={newDoctor.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={newDoctor.qualifications}
                    onChange={handleInputChange}
                    placeholder="MD, Board Certified"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newDoctor.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newDoctor.email}
                    onChange={handleInputChange}
                    placeholder="doctor@hospital.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-4 h-4 mr-2" /> {editingId ? "Update Doctor" : "Add Doctor"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Doctors List */}
        <div className="grid gap-6">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Card key={doctor.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-emerald-100 p-3 rounded-lg flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-emerald-600 font-medium mt-1">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600 mt-2">{doctor.qualifications}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>📞 {doctor.phone}</span>
                        {doctor.email && <span>📧 {doctor.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 bg-transparent"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 bg-transparent"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No doctors added yet</p>
              <p className="text-gray-500 text-sm mt-1">Click "Add Doctor" to start building your medical team</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
