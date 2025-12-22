"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, LogOut, Building2, CheckCircle, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    patients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const userType = localStorage.getItem("userType")
    
    if (!token || userType !== "admin") {
      router.push("/admin/login")
      return
    }

    const adminData = localStorage.getItem("adminData")
    if (adminData) {
      const admin = JSON.parse(adminData)
      setAdminName(admin.username)
    }

    fetchStats(token)
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/hospital/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setStats({
          total: data.stats.total,
          verified: data.stats.verified,
          unverified: data.stats.unverified,
          patients: data.stats.patients || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("userType")
    localStorage.removeItem("adminData")
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Admin Portal</span>
              <p className="text-xs text-gray-600">{adminName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage hospitals and system overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Hospitals */}
          <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Hospitals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-2">All registered</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Verified Hospitals */}
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verified</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.verified}</p>
                <p className="text-xs text-gray-500 mt-2">Active hospitals</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          {/* Pending Approval */}
          <Card className="p-6 border-l-4 border-l-yellow-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.unverified}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* Total Patients */}
          <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.patients}</p>
                <p className="text-xs text-gray-500 mt-2">Registered users</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/hospitals">
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Hospitals
                </Button>
              </Link>
              <Link href="/admin/hospitals?filter=pending">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  View Pending Approvals ({stats.unverified})
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">System Status</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Database</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Pending Actions</span>
                <span className="text-2xl font-bold text-purple-600">{stats.unverified}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
