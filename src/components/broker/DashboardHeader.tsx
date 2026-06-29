'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface DashboardHeaderProps {
  brokerNombre: string
}

export default function DashboardHeader({ brokerNombre }: DashboardHeaderProps) {
  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
            SQ
          </div>
          <div className="min-w-0">
            <span className="font-bold text-lg tracking-tight">SiniestroQR</span>
            <span className="hidden sm:inline text-xs text-blue-300 ml-2">Panel de Control</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-blue-300">Sesión activa</p>
            <p className="text-sm font-medium truncate max-w-32">{brokerNombre}</p>
          </div>
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
