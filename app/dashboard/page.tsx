import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DocumentCard from '@/components/DocumentCard'
import FileUpload from '@/components/FileUpload'
import LogoutButton from '@/components/LogoutButton'
import CreateDocButton from '@/components/CreateDocButton'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [owned, sharedWith] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: session.userId },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.documentShare.findMany({
      where: { userId: session.userId },
      include: {
        document: { include: { owner: { select: { name: true, email: true } } } },
      },
      orderBy: { document: { updatedAt: 'desc' } },
    }),
  ])

  const initials = session.name
    ? session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">CollabDocs</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold select-none">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{session.name}</span>
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Action bar */}
        <div className="flex flex-wrap items-start gap-3 mb-10">
          <CreateDocButton />
          <FileUpload />
        </div>

        {/* My Documents */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">My Documents</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium tabular-nums">
              {owned.length}
            </span>
          </div>

          {owned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/60 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">No documents yet</p>
              <p className="text-xs text-gray-400">Create a new document or upload a file to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {owned.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} isOwned />
              ))}
            </div>
          )}
        </section>

        {/* Shared with me */}
        {sharedWith.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Shared with Me</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium tabular-nums">
                {sharedWith.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sharedWith.map(({ document: doc, permission }) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isOwned={false}
                  ownerName={doc.owner.name}
                  permission={permission}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
