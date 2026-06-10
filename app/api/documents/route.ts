import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: session.userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true, ownerId: true },
    }),
    prisma.documentShare.findMany({
      where: { userId: session.userId },
      include: {
        document: {
          select: { id: true, title: true, createdAt: true, updatedAt: true, ownerId: true, owner: { select: { name: true, email: true } } },
        },
      },
      orderBy: { document: { updatedAt: 'desc' } },
    }),
  ])

  return NextResponse.json({
    owned,
    shared: shared.map((s) => ({ ...s.document, permission: s.permission })),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const title = body.title ?? 'Untitled Document'
  const content = body.content ?? ''

  const doc = await prisma.document.create({
    data: { title, content, ownerId: session.userId },
  })

  return NextResponse.json(doc, { status: 201 })
}
