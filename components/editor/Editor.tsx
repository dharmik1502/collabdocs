'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Toolbar from './Toolbar'

interface EditorProps {
  documentId: string
  initialContent: string
  readOnly?: boolean
  onSaveStatus?: (status: 'saving' | 'saved' | 'error') => void
}

function parseContent(raw: string) {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    // If it's our HTML-import format from file uploads
    if (parsed.__html) return parsed.__html
    return parsed
  } catch {
    // Not JSON — treat as plain text
    return raw
  }
}

export default function TiptapEditor({ documentId, initialContent, readOnly = false, onSaveStatus }: EditorProps) {
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)
  const isDirty = useRef(false)

  const save = useCallback(
    async (content: string) => {
      onSaveStatus?.('saving')
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
        onSaveStatus?.('saved')
      } catch {
        onSaveStatus?.('error')
      }
    },
    [documentId, onSaveStatus]
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: parseContent(initialContent),
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (readOnly) return
      isDirty.current = true
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON())
        save(json)
        isDirty.current = false
      }, 1500)
    },
  })

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [])

  if (!editor) return null

  return (
    <div className="tiptap-editor flex flex-col">
      {!readOnly && <Toolbar editor={editor} />}
      {readOnly && (
        <div className="px-4 py-2 border-b border-amber-200 bg-amber-50 text-xs text-amber-700">
          Read-only — you have view access to this document
        </div>
      )}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto"
      />
    </div>
  )
}
