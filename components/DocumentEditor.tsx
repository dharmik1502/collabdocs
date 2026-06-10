'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ShareModal from './ShareModal'
import ExportButton from './ExportButton'

const TiptapEditor = dynamic(() => import('./editor/Editor'), { ssr: false })

interface DocumentEditorProps {
  doc: { id: string; title: string; content: string }
  isOwner: boolean
  readOnly: boolean
}

export default function DocumentEditor({ doc, isOwner, readOnly }: DocumentEditorProps) {
  const [title, setTitle] = useState(doc.title)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle')
  const [showShare, setShowShare] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const contentRef = useRef(doc.content)

  const handleSaveStatus = useCallback((status: 'saving' | 'saved' | 'error') => {
    setSaveStatus(status)
  }, [])

  async function saveTitle(newTitle: string) {
    if (newTitle === doc.title) return
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm shadow-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors group"
            title="Back to dashboard"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-medium hidden sm:block">Docs</span>
          </Link>
          <span className="text-gray-300 select-none">/</span>

          {editingTitle && !readOnly ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { setEditingTitle(false); saveTitle(title) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { setEditingTitle(false); saveTitle(title) }
                if (e.key === 'Escape') { setTitle(doc.title); setEditingTitle(false) }
              }}
              className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent min-w-0 w-full max-w-md"
            />
          ) : (
            <h1
              className={`text-sm font-semibold text-gray-800 truncate max-w-xs sm:max-w-md transition-colors ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'
              }`}
              onClick={() => !readOnly && setEditingTitle(true)}
              title={readOnly ? undefined : 'Click to rename'}
            >
              {title || 'Untitled Document'}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Save status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-[60px] justify-end">
            {saveStatus === 'saving' && (
              <>
                <span className="w-3 h-3 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                <span className="text-gray-400">Saving…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-blue-600 font-medium">Saved</span>
              </>
            )}
            {saveStatus === 'error' && <span className="text-red-500">Save error</span>}
          </div>

          {readOnly && (
            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              View only
            </span>
          )}

          <ExportButton title={title} getContent={() => contentRef.current} />

          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-gradient-to-b from-sky-400 to-blue-800 hover:from-sky-300 hover:to-blue-700 rounded-xl transition-all shadow-md shadow-blue-300/40 hover:shadow-blue-400/60"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto">
        <TiptapEditor
          documentId={doc.id}
          initialContent={doc.content}
          readOnly={readOnly}
          onSaveStatus={handleSaveStatus}
          onContentChange={(c) => { contentRef.current = c }}
        />
      </div>

      {showShare && (
        <ShareModal documentId={doc.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
