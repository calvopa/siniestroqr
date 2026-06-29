'use client'

import { SessionProvider } from 'next-auth/react'
import ChatWidget from '@/components/ui/ChatWidget'

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ChatWidget />
    </SessionProvider>
  )
}
