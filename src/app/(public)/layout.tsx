export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-white">
      <header className="bg-primary text-white py-3 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">
              SQ
            </div>
            <span className="font-bold text-lg tracking-tight">SiniestroQR</span>
          </div>
          <span className="text-xs text-blue-200 hidden sm:block">
            Intercambio Digital de Datos
          </span>
        </div>
      </header>
      <main className="py-6 px-4">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 mt-auto">
        <p>SiniestroQR © {new Date().getFullYear()} — Plataforma InsurTech Argentina</p>
      </footer>
    </div>
  )
}
