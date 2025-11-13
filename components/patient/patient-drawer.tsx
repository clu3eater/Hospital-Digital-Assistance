"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Calendar,
  User,
  FileText,
  Heart,
  LogOut,
  Menu,
  Hospital,
  Star,
  Bell,
  Settings,
} from "lucide-react"

interface PatientDrawerProps {
  patientName?: string
}

export function PatientDrawer({ patientName = "Patient" }: PatientDrawerProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    localStorage.removeItem("patientData")
    router.push("/")
    setOpen(false)
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/patient/dashboard",
      description: "Overview & appointments",
    },
    {
      title: "My Appointments",
      icon: Calendar,
      href: "/patient/appointments",
      description: "View & manage bookings",
    },
    {
      title: "Health Profile",
      icon: User,
      href: "/patient/profile",
      description: "Personal & medical info",
    },
    {
      title: "Health Records",
      icon: FileText,
      href: "/patient/health-records",
      description: "Medical documents",
    },
    {
      title: "Find Hospitals",
      icon: Hospital,
      href: "/hospitals",
      description: "Search & book",
    },
    {
      title: "My Reviews",
      icon: Star,
      href: "/patient/reviews",
      description: "Your feedback",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/patient/notifications",
      description: "Alerts & reminders",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/patient/settings",
      description: "Account settings",
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-white text-lg">MediConnect</SheetTitle>
                <p className="text-blue-100 text-xs">{patientName}</p>
              </div>
            </div>
          </SheetHeader>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-start gap-3 px-3 py-3 rounded-lg transition-all
                      ${
                        active
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? "text-blue-600" : "text-gray-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${active ? "text-blue-700" : "text-gray-900"}`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
