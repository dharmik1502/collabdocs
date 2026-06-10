import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import WorkspaceDashboard from '@/components/WorkspaceDashboard'
import LogoutButton from '@/components/LogoutButton'

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

  const docs = [
    ...owned.map((d) => ({
      id: d.id,
      title: d.title,
      updatedAt: d.updatedAt.toISOString(),
      isOwned: true as const,
    })),
    ...sharedWith.map(({ document: doc, permission }) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt.toISOString(),
      isOwned: false as const,
      ownerName: doc.owner.name,
      permission,
    })),
  ]

  const initials = session.name
    ? session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm shadow-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-b from-sky-400 to-blue-800 rounded-lg flex items-center justify-center shadow-md shadow-blue-300/40">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base font-bold text-blue-800 tracking-tight">
              Collab<span className="font-normal text-gray-400">Docs</span>
            </span>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-b from-sky-400 to-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-white select-none shadow-md shadow-blue-300/40">
                {initials}
              </div>
              <div className="flex flex-col items-end leading-none">
                <span className="text-sm font-semibold text-gray-800">{session.name}</span>
                <span className="text-xs text-gray-400 mt-0.5">{session.email}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <WorkspaceDashboard
        docs={docs}
        userName={session.name}
        ownedCount={owned.length}
        sharedCount={sharedWith.length}
      />
    </div>
  )
}
