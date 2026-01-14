"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/library", label: "Library", icon: "📚" },
  { href: "/dashboard/materials", label: "Materials", icon: "📄" },
  { href: "/dashboard/study", label: "Study", icon: "🎯" },
  { href: "/dashboard/goals", label: "Goals", icon: "🏆" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/insights", label: "Insights", icon: "🧠" },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm py-8 px-6 overflow-y-auto">
        <div className="mb-12">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Flashly
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Study Smarter</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-4 py-2.5 h-auto text-foreground hover:bg-secondary/50 transition-all duration-200",
                  pathname === item.href &&
                  "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold border-l-2 border-primary",
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/50 transition-all duration-200">
            <UserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Account</p>
              <p className="text-xs text-muted-foreground">Manage profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
