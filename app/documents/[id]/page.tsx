import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DocumentEditor from '@/components/DocumentEditor'

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  })

  if (!doc) notFound()

  const isOwner = doc.ownerId === session.userId
  const share = doc.shares.find((s) => s.userId === session.userId)

  if (!isOwner && !share) redirect('/dashboard')

  const permission = isOwner ? 'owner' : share!.permission
  const readOnly = permission === 'view'

  return (
    <DocumentEditor
      doc={{ id: doc.id, title: doc.title, content: doc.content }}
      isOwner={isOwner}
      readOnly={readOnly}
    />
  )
}
