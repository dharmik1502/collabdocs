'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { DocItem } from './WorkspaceDashboard'

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function DocumentCard({ doc }: { doc: DocItem }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${doc.title || 'Untitled Document'}"?`)) return
    setDeleting(true)
    await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div
      className={`group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-sky-950/50 hover:border-sky-900/60 hover:-translate-y-0.5 transition-all duration-200 ${
        deleting ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      {/* Gradient top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-sky-400 to-blue-800" />

      <div className="p-5">
        {/* Icon row + delete */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-12 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-900/30 transition-colors border border-slate-700/60 group-hover:border-sky-800/50">
            <svg className="w-5 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {doc.isOwned && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-950/50 transition-all"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-200 text-sm line-clamp-2 mb-1 group-hover:text-sky-300 transition-colors leading-snug">
          {doc.title || 'Untitled Document'}
        </h3>

        {/* Time + shared-by */}
        <p className="text-xs text-slate-500 mb-4">
          {!doc.isOwned && doc.ownerName && (
            <span className="text-slate-400 font-medium">{doc.ownerName} · </span>
          )}
          {timeAgo(doc.updatedAt)}
        </p>

        {/* Footer: badge + open link */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            doc.isOwned
              ? 'bg-sky-950/60 text-sky-400 border border-sky-900/50'
              : doc.permission === 'edit'
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {doc.isOwned ? 'Owned' : doc.permission === 'edit' ? 'Can edit' : 'View only'}
          </span>

          <Link
            href={`/documents/${doc.id}`}
            className="flex items-center gap-0.5 text-xs font-semibold text-sky-500 hover:text-sky-300 group/link transition-colors"
          >
            Open
            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
