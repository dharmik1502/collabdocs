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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">CollabDocs</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">{session.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <CreateDocButton />
          <FileUpload />
        </div>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            My Documents ({owned.length})
          </h2>
          {owned.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">
              No documents yet. Create one or upload a file to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {owned.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} isOwned />
              ))}
            </div>
          )}
        </section>

        {sharedWith.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Shared with Me ({sharedWith.length})
            </h2>
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
