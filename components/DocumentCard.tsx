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

const BADGE_STYLES: Record<string, string> = {
  owner: 'bg-indigo-50 text-indigo-600',
  edit: 'bg-emerald-50 text-emerald-600',
  view: 'bg-gray-100 text-gray-500',
}

export default function DocumentCard({ doc, isOwned, ownerName, permission }: Props) {
  const badgeKey = isOwned ? 'owner' : (permission ?? 'view')
  const badgeLabel = isOwned ? 'Owner' : (permission === 'edit' ? 'Can edit' : 'View only')

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
          <svg className="w-5 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[badgeKey] ?? BADGE_STYLES.view}`}>
          {badgeLabel}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm truncate mb-1.5 group-hover:text-indigo-600 transition-colors">
        {doc.title || 'Untitled Document'}
      </h3>

      <div className="text-xs text-gray-400 space-y-0.5">
        {!isOwned && ownerName && <p className="truncate">by {ownerName}</p>}
        <p>{timeAgo(doc.updatedAt)}</p>
      </div>
    </Link>
  )
}
