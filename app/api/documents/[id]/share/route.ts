import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/documents/[id]/share'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc || doc.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const shares = await prisma.documentShare.findMany({
    where: { documentId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(shares)
}

export async function POST(request: NextRequest, ctx: RouteContext<'/api/documents/[id]/share'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc || doc.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, permission = 'view' } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  if (permission !== 'view' && permission !== 'edit') {
    return NextResponse.json({ error: 'Invalid permission' }, { status: 400 })
  }

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (targetUser.id === session.userId) {
    return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
  }

  const share = await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } },
    update: { permission },
    create: { documentId: id, userId: targetUser.id, permission },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(share, { status: 201 })
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/documents/[id]/share'>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc || doc.ownerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { shareId } = await request.json()
  await prisma.documentShare.delete({ where: { id: shareId } })
  return NextResponse.json({ ok: true })
}
