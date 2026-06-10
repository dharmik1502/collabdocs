import Link from 'next/link'

interface Doc {
  id: string
  title: string
  updatedAt: Date
}

interface Props {
  doc: Doc
  isOwned: boolean
  ownerName?: string
  permission?: string
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function DocumentCard({ doc, isOwned, ownerName, permission }: Props) {
  return (
    <Link
      href={`/documents/${doc.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isOwned ? (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Owner</span>
          ) : (
            <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full font-medium capitalize">
              {permission}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-medium text-gray-900 text-sm truncate mb-1 group-hover:text-blue-600 transition-colors">
        {doc.title || 'Untitled Document'}
      </h3>

      <div className="text-xs text-gray-400">
        {!isOwned && ownerName && <span className="block truncate">by {ownerName}</span>}
        <span>{timeAgo(doc.updatedAt)}</span>
      </div>
    </Link>
  )
}
