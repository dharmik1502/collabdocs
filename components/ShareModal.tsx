'use client'

import { useState, useEffect } from 'react'

interface Share {
  id: string
  permission: string
  user: { id: string; name: string; email: string }
}

interface ShareModalProps {
  documentId: string
  onClose: () => void
}

export default function ShareModal({ documentId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/documents/${documentId}/share`)
      .then((r) => r.json())
      .then(setShares)
      .catch(() => {})
  }, [documentId])

  async function addShare() {
    if (!email.trim()) return
    setError('')
    setSuccess('')
    setLoading(true)

    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), permission }),
    })

    setLoading(false)

    if (res.ok) {
      const share = await res.json()
      setShares((prev) => {
        const existing = prev.findIndex((s) => s.id === share.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = share
          return updated
        }
        return [...prev, share]
      })
      setEmail('')
      setSuccess(`Shared with ${share.user.name}`)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to share')
    }
  }

  async function removeShare(shareId: string) {
    await fetch(`/api/documents/${documentId}/share`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareId }),
    })
    setShares((prev) => prev.filter((s) => s.id !== shareId))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Share document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Add share */}
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && addShare()}
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
            <button
              onClick={addShare}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Share
            </button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          {/* Shared with list */}
          {shares.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Shared with</p>
              <ul className="space-y-2">
                {shares.map((share) => (
                  <li key={share.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{share.user.name}</p>
                      <p className="text-xs text-gray-400">{share.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize">{share.permission}</span>
                      <button
                        onClick={() => removeShare(share.id)}
                        className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                        title="Remove access"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {shares.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Not shared with anyone yet</p>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Demo users: alice@demo.com, bob@demo.com, carol@demo.com
          </p>
        </div>
      </div>
    </div>
  )
}
