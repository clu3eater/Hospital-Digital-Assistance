"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, LogOut, Edit2, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

export default function PatientProfile() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    allergies: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/patient/login")
      return
    }

    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("/api/patient/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setFormData({
          fullName: data.patient.fullName || "",
          email: data.patient.email || "",
          phone: data.patient.phone || "",
          dateOfBirth: data.patient.dateOfBirth
            ? new Date(data.patient.dateOfBirth).toISOString().split("T")[0]
            : "",
          allergies: data.patient.allergies || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("patientData", JSON.stringify(data.patient))
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
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
            <PatientDrawer patientName={formData.fullName} />
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Health Profile</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Basic Info Card */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <Input name="fullName" value={formData.fullName} onChange={handleChange} />
                  ) : (
                    <p className="text-gray-900">{formData.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{formData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <Input name="phone" value={formData.phone} onChange={handleChange} />
                  ) : (
                    <p className="text-gray-900">{formData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                  ) : (
                    <p className="text-gray-900">{formData.dateOfBirth}</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Medical Info</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold">
                    {formData.dateOfBirth
                      ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
                      : "N/A"}{" "}
                    years
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-lg font-semibold">{new Date().getFullYear()}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Medical Details */}
        <Card className="p-6 mb-12">
          <h2 className="text-xl font-bold mb-6">Medical Details</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                {isEditing ? (
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{formData.allergies || "None"}</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
