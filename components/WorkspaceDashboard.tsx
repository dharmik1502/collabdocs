'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import DocumentCard from './DocumentCard'
import CreateDocButton from './CreateDocButton'
import ImportPanel from './ImportPanel'

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

export default function WorkspaceDashboard({ docs }: { docs: DocItem[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
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

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Workspace</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Create, edit, import and manage your documents collaboratively.
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Tab pills */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
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
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => startTransition(() => router.refresh())}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
          >
            <svg
              className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <CreateDocButton />
        </div>
      </div>

      {/* Main layout: document list + import panel */}
      <div className="flex gap-6 items-start">
        {/* Document list */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {search ? 'No documents match your search' : 'No documents yet'}
              </p>
              <p className="text-xs text-gray-400">
                {search
                  ? 'Try a different search term'
                  : 'Create a new document or import a file to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>

        {/* Import panel */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <ImportPanel />
        </div>
      </div>
    </main>
  )
}
