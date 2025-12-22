"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, LogOut, Save, Loader2 } from "lucide-react"

interface FormState {
  hospitalName: string
  email: string
  phone: string
  address: string
  city: string
  description: string
}

export default function HospitalSettingsPage() {
  const router = useRouter()
  const [hospitalName, setHospitalName] = useState("Hospital")
  const [form, setForm] = useState<FormState>({
    hospitalName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("hospitalToken")
    if (!token) {
      router.push("/hospital/login")
      return
    }

    const hospitalData = localStorage.getItem("hospitalData")
    if (hospitalData) {
      const parsed = JSON.parse(hospitalData)
      setHospitalName(parsed.hospitalName || "Hospital")
      setForm((prev) => ({
        ...prev,
        hospitalName: parsed.hospitalName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
        city: parsed.city || "",
        description: parsed.description || "",
      }))
    }
  }, [router])

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)
    setErrorMessage(null)

    const token = localStorage.getItem("hospitalToken")
    if (!token) {
      router.push("/hospital/login")
      return
    }

    try {
      const res = await fetch("/api/hospital/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.hospitalName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          description: form.description.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      setStatusMessage("Settings updated successfully")
      setHospitalName(form.hospitalName || hospitalName)

      // Persist locally so dashboard/header stay in sync
      const existing = localStorage.getItem("hospitalData")
      const parsed = existing ? JSON.parse(existing) : {}
      localStorage.setItem(
        "hospitalData",
        JSON.stringify({
          ...parsed,
          hospitalName: form.hospitalName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          description: form.description,
        })
      )
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("hospitalToken")
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
            <Link href="/hospital/doctors">
              <Button variant="ghost" size="sm">Doctors</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hospital Settings</h1>
          <p className="text-gray-600">Manage your hospital profile and contact details.</p>
        </div>

        <Card className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hospital Name *</label>
                <Input value={form.hospitalName} onChange={handleChange("hospitalName")} placeholder="City General Hospital" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Official Email *</label>
                <Input type="email" value={form.email} onChange={handleChange("email")} placeholder="contact@hospital.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone *</label>
                <Input value={form.phone} onChange={handleChange("phone")} placeholder="+1 (555) 123-4567" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <Input value={form.city} onChange={handleChange("city")} placeholder="San Francisco" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Input value={form.address} onChange={handleChange("address")} placeholder="123 Main St, Suite 400" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Short description about your hospital, specialties, and services."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
              {statusMessage && <span className="text-sm text-emerald-700">{statusMessage}</span>}
              {errorMessage && <span className="text-sm text-red-600">{errorMessage}</span>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
