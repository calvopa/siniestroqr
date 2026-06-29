import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import AseguradoraHeader from '@/components/aseguradora/AseguradoraHeader'
import ApiKeysManager from '@/components/aseguradora/ApiKeysManager'

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.insurerId || session.user.role !== 'ASEGURADORA') redirect('/login')

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-900">
      <AseguradoraHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/aseguradora" className="text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary dark:text-white">API Keys</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Gestioná las claves de integración de tu aseguradora</p>
          </div>
        </div>
        <ApiKeysManager />
      </div>
    </div>
  )
}
