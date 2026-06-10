'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const router = useRouter()

  async function handleFile(file: File) {
    setError('')
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/documents/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Upload failed')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Import Document</h3>
      </div>

      <p className="text-xs text-gray-500 mb-5 leading-relaxed">
        Upload an existing file. We support{' '}
        <strong className="text-gray-700">Word Documents (.docx)</strong>,{' '}
        <strong className="text-gray-700">Markdown (.md)</strong>, and{' '}
        <strong className="text-gray-700">Plain Text (.txt)</strong>.
        Your formatting will be automatically parsed!
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.docx"
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center py-10 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
          loading
            ? 'cursor-wait opacity-60 border-violet-200 bg-violet-50/30'
            : dragging
            ? 'border-violet-400 bg-violet-50 scale-[0.99]'
            : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40'
        }`}
      >
        {loading ? (
          <span className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-3" />
        ) : (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
            dragging ? 'bg-violet-100' : 'bg-violet-50'
          }`}>
            <svg
              className={`w-5 h-5 transition-colors ${dragging ? 'text-violet-600' : 'text-violet-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        )}
        <p className={`text-sm font-semibold transition-colors ${
          dragging ? 'text-violet-700' : 'text-gray-600'
        }`}>
          {loading ? 'Uploading…' : dragging ? 'Drop to import' : 'Drag and drop or click to upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">TXT, MD, or DOCX up to 5MB</p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
