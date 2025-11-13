"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, LogOut, Download, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

export default function HealthRecords() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [records, setRecords] = useState([
    {
      id: 1,
      type: "Lab Report",
      date: "2024-11-20",
      hospital: "City General Hospital",
      description: "Blood test results - All normal",
    },
    {
      id: 2,
      type: "Prescription",
      date: "2024-11-15",
      hospital: "Medical Plaza Clinic",
      description: "Antibiotic prescription for infection",
    },
    {
      id: 3,
      type: "Medical Certificate",
      date: "2024-11-10",
      hospital: "St. Mary's Medical Center",
      description: "Fitness certificate for work",
    },
  ])

  useEffect(() => {
    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    router.push("/")
  }

  const handleDownload = (id: number) => {
    console.log("Downloading record:", id)
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
          <h1 className="text-4xl font-bold">Health Records</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Upload Record
          </Button>
        </div>

        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <FileText className="w-12 h-12 text-blue-100 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">{record.type}</h3>
                    <p className="text-gray-600">{record.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>{record.date}</span>
                      <span>{record.hospital}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleDownload(record.id)}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {records.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No health records</h3>
            <p className="text-gray-600">Your medical records will appear here</p>
          </Card>
        )}
      </div>
    </div>
  )
}
