'use client'
import { SessionProvider } from 'next-auth/react'
import ChatWidget from '@/components/ui/ChatWidget'

export default function AseguradoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ChatWidget />
    </SessionProvider>
  )
}
