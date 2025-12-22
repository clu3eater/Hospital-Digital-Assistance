"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, LogOut, Download, Plus, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PatientDrawer } from "@/components/patient/patient-drawer"

interface HealthRecord {
  _id: string
  recordType: string
  description: string
  hospitalName?: string
  recordDate: string
  fileUrl?: string
  fileName?: string
}

export default function HealthRecords() {
  const router = useRouter()
  const [patientName, setPatientName] = useState("")
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({
    recordType: "",
    description: "",
    hospitalName: "",
    recordDate: "",
    fileUrl: "",
    fileName: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    const patientData = localStorage.getItem("patientData")
    if (patientData) {
      setPatientName(JSON.parse(patientData).fullName)
    }

    fetchRecords(token)
  }, [router])

  const fetchRecords = async (token: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/patient/records", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load records")
      }

      setRecords(data.records || [])
    } catch (err: any) {
      setError(err.message || "Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setForm((prev) => ({
        ...prev,
        fileUrl: result,
        fileName: file.name,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("patientToken")
    if (!token) {
      router.push("/patient/login")
      return
    }

    try {
      const res = await fetch("/api/patient/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recordType: form.recordType.trim(),
          description: form.description.trim(),
          hospitalName: form.hospitalName.trim(),
          recordDate: form.recordDate,
          fileUrl: form.fileUrl.trim(),
          fileName: form.fileName.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to add record")
      }

      setRecords((prev) => [data.record, ...prev])
      setIsAdding(false)
      setForm({ recordType: "", description: "", hospitalName: "", recordDate: "", fileUrl: "", fileName: "" })
    } catch (err: any) {
      setError(err.message || "Failed to add record")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("patientToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("patientData")
    router.push("/")
  }

  const handleDownload = (fileUrl?: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank")
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>

        {isAdding && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Health Record</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Record Type *</label>
                  <Input
                    name="recordType"
                    value={form.recordType}
                    onChange={handleFormChange}
                    placeholder="e.g., Lab Report"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Hospital / Clinic</label>
                  <Input
                    name="hospitalName"
                    value={form.hospitalName}
                    onChange={handleFormChange}
                    placeholder="City General Hospital"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Record Date *</label>
                  <Input
                    type="date"
                    name="recordDate"
                    value={form.recordDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">File URL (optional)</label>
                  <Input
                    name="fileUrl"
                    value={form.fileUrl}
                    onChange={handleFormChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Upload File (optional)</label>
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                  />
                  {form.fileName && (
                    <p className="text-xs text-gray-500">Selected: {form.fileName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Description *</label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Brief details about the record"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Record
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {error && <Card className="p-6 mb-4 text-red-600">{error}</Card>}
        {loading && (
          <Card className="p-6 text-gray-600 flex items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading records…
          </Card>
        )}

        <div className="space-y-4">
          {!loading &&
            records.map((record) => (
              <Card key={record._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <FileText className="w-12 h-12 text-blue-100 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">{record.recordType}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{record.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(record.recordDate).toLocaleDateString()}</span>
                        {record.hospitalName && <span>{record.hospitalName}</span>}
                      </div>
                      {record.fileUrl && (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                          download={record.fileName || true}
                        >
                          View / Download {record.fileName || "file"}
                        </a>
                      )}
                    </div>
                  </div>
                  {record.fileUrl && (
                    <Button variant="outline" onClick={() => handleDownload(record.fileUrl)}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>

        {!loading && records.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No health records</h3>
            <p className="text-gray-600">Add your first record to keep everything in one place</p>
          </Card>
        )}
      </div>
    </div>
  )
}
