'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Building2,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Knowledge Base',
    href: '/admin/knowledge-base',
    icon: BookOpen,
  },
  {
    label: 'Moderation',
    href: '/admin/moderation',
    icon: MessageSquare,
  },
  {
    label: 'Facilities',
    href: '/admin/facilities',
    icon: Building2,
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-border overflow-y-auto">
      {/* Logo Section -- a fixed h-20 (not content-driven padding) so this box
          is exactly as tall as the header bar's own h-20 (see Header.tsx).
          Two independently-sized boxes (image+2-line text here vs. just
          2-line text there) landed at slightly different heights, so their
          bottom borders sat at different Y positions -- a visible "step" in
          what should be one continuous line across the sidebar/header
          boundary. */}
      <div className="h-20 px-5 border-b border-border flex items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/kalingapp-logo.png"
            alt="KalingApp Logo"
            width={44}
            height={44}
          />
          <div>
            <h1 className="font-bold text-foreground leading-tight">KalingApp</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-light-pink text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-light-pink/50 hover:text-primary'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
