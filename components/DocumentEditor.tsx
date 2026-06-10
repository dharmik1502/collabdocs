'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ShareModal from './ShareModal'

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
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 flex-shrink-0" title="Back to dashboard">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {editingTitle && !readOnly ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false)
                saveTitle(title)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingTitle(false)
                  saveTitle(title)
                }
                if (e.key === 'Escape') {
                  setTitle(doc.title)
                  setEditingTitle(false)
                }
              }}
              className="text-base font-medium text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent min-w-0 w-full max-w-md"
            />
          ) : (
            <h1
              className={`text-base font-medium text-gray-900 truncate max-w-xs sm:max-w-md ${
                readOnly ? '' : 'cursor-pointer hover:text-blue-600'
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
          <span className="text-xs text-gray-400 hidden sm:block">
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && 'Saved ✓'}
            {saveStatus === 'error' && 'Save error'}
          </span>

          {/* Share button — owner only */}
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 max-w-4xl w-full mx-auto">
        <TiptapEditor
          documentId={doc.id}
          initialContent={doc.content}
          readOnly={readOnly}
          onSaveStatus={handleSaveStatus}
        />
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal documentId={doc.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
