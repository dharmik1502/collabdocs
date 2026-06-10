import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getDocumentAccess(docId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { shares: true },
  })
  if (!doc) return { doc: null, permission: null }
  if (doc.ownerId === userId) return { doc, permission: 'owner' }
  const share = doc.shares.find((s) => s.userId === userId)
  if (share) return { doc, permission: share.permission }
  return { doc: null, permission: null }
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/documents/[id]'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { doc, permission } = await getDocumentAccess(id, session.userId)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const owner = await prisma.user.findUnique({ where: { id: doc.ownerId }, select: { name: true, email: true } })

  return NextResponse.json({ ...doc, permission, owner })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/documents/[id]'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { doc, permission } = await getDocumentAccess(id, session.userId)
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (permission !== 'owner' && permission !== 'edit') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/documents/[id]'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.document.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
