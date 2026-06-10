'use client'

import { useRef, useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import DocumentCard from './DocumentCard'
import CreateDocButton from './CreateDocButton'

export type DocItem = {
  id: string
  title: string
  updatedAt: string
  isOwned: boolean
  ownerName?: string | null
  permission?: string | null
}

type Tab = 'all' | 'owned' | 'shared'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'owned', label: 'Owned' },
  { key: 'shared', label: 'Shared with Me' },
]

interface Props {
  docs: DocItem[]
  userName: string
  ownedCount: number
  sharedCount: number
}

export default function WorkspaceDashboard({ docs, userName, ownedCount, sharedCount }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let list = docs
    if (tab === 'owned') list = docs.filter((d) => d.isOwned)
    if (tab === 'shared') list = docs.filter((d) => !d.isOwned)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((d) => d.title.toLowerCase().includes(q))
    }
    return list
  }, [docs, tab, search])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    setUploading(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/documents/${data.id}`)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-sky-50 rounded-full translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">
                Welcome back, {userName}
              </p>
              <h1 className="text-3xl font-bold text-blue-800 tracking-tight">My Workspace</h1>
              <p className="text-gray-500 text-sm mt-1.5">
                Create, edit, import and manage your documents collaboratively.
              </p>
            </div>

            {/* Hero CTAs */}
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,.docx"
                className="hidden"
                onChange={handleFile}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 text-sm font-semibold rounded-xl border border-gray-200 hover:border-blue-300 transition-all disabled:opacity-60"
              >
                {uploading ? (
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                Import File
              </button>
              <CreateDocButton />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-7">
            {[
              { label: 'My documents', value: ownedCount },
              { label: 'Shared with me', value: sharedCount },
              { label: 'Total', value: ownedCount + sharedCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-blue-50 rounded-2xl px-5 py-3 border border-blue-100 min-w-[100px]"
              >
                <p className="text-2xl font-bold text-blue-800 tabular-nums">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-14 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
          {/* Tab pills */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl p-1 gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  tab === t.key
                    ? 'bg-gradient-to-b from-sky-400 to-blue-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[180px] max-w-sm relative">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => startTransition(() => router.refresh())}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all ml-auto"
          >
            <svg
              className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Document grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-200 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              {search ? 'No documents found' : 'No documents yet'}
            </p>
            <p className="text-xs text-gray-400">
              {search ? 'Try a different search term' : 'Create a document or import a file to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
