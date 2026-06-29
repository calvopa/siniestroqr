'use client'
import { useState } from 'react'

interface Photo {
  id: string
  mimeType: string
  takenAt: string | null
}

export default function PhotoGallery({ siniestroId, photos }: { siniestroId: string; photos: Photo[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  if (photos.length === 0) {
    return <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">Sin fotos adjuntas</p>
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo.id)}
            className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-accent transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <img
              src={`/api/photos/${photo.id}`}
              alt="Foto del siniestro"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={`/api/photos/${selected}`}
            alt="Foto del siniestro"
            className="max-w-full max-h-full rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
