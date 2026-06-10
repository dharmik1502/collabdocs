'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateDocButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled Document' }),
    })
    const doc = await res.json()
    setLoading(false)
    router.push(`/documents/${doc.id}`)
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 disabled:shadow-none"
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      New Document
    </button>
  )
}
