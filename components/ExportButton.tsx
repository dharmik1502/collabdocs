'use client'

import { useState, useRef, useEffect } from 'react'
import { tiptapToMarkdown } from '@/lib/exportMarkdown'

interface ExportButtonProps {
  title: string
  getContent: () => string
}

export default function ExportButton({ title, getContent }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function exportMarkdown() {
    const md = tiptapToMarkdown(getContent(), title)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'document'}.md`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  function exportPDF() {
    setOpen(false)
    // Small delay so the dropdown closes before the print dialog opens
    setTimeout(() => window.print(), 50)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-all"
        title="Export document"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Export</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={exportMarkdown}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-8 text-xs font-mono text-indigo-400 bg-indigo-50 rounded px-1 py-0.5 text-center">.md</span>
            Markdown
          </button>
          <button
            onClick={exportPDF}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-8 text-xs font-mono text-rose-400 bg-rose-50 rounded px-1 py-0.5 text-center">.pdf</span>
            PDF
          </button>
        </div>
      )}
    </div>
  )
}
