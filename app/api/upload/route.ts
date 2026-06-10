import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSupportedExtension, parseFileToHtml } from '@/lib/fileParser'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = getSupportedExtension(file.name)
  if (!ext) {
    return NextResponse.json(
      { error: 'Unsupported file type. Supported: .txt, .md, .docx' },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const html = await parseFileToHtml(buffer, ext)

  // Convert HTML to a basic Tiptap JSON structure
  const content = JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
  })

  const title = file.name.replace(/\.(txt|md|docx)$/i, '')

  const doc = await prisma.document.create({
    data: {
      title,
      content: JSON.stringify({ type: 'doc', __html: html }),
      ownerId: session.userId,
    },
  })

  return NextResponse.json({ id: doc.id, title: doc.title }, { status: 201 })
}
