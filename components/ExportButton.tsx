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
    setTimeout(() => window.print(), 50)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all"
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
        <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <button
            onClick={exportMarkdown}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="w-8 text-xs font-mono text-sky-400 bg-sky-950/50 border border-sky-800/50 rounded px-1 py-0.5 text-center">.md</span>
            Markdown
          </button>
          <button
            onClick={exportPDF}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="w-8 text-xs font-mono text-rose-400 bg-rose-950/50 border border-rose-800/50 rounded px-1 py-0.5 text-center">.pdf</span>
            PDF
          </button>
        </div>
      )}
    </div>
  )
}
