"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PatientLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("patientToken", data.token)
        localStorage.setItem("userType", "patient")
        localStorage.setItem("patientData", JSON.stringify(data.patient))
        router.push("/patient/dashboard")
      } else {
        setError(data.error || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto pt-12 px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">MediConnect</span>
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2">Patient Login</h1>
          <p className="text-gray-600 mb-6">Access your health profile and appointments</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Don't have an account?{" "}
            <Link href="/patient/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
