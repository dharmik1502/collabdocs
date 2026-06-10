import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  const password = await bcrypt.hash('demo1234', 10)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@demo.com' },
    update: {},
    create: { email: 'alice@demo.com', name: 'Alice Demo', password },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@demo.com' },
    update: {},
    create: { email: 'bob@demo.com', name: 'Bob Demo', password },
  })

  await prisma.user.upsert({
    where: { email: 'carol@demo.com' },
    update: {},
    create: { email: 'carol@demo.com', name: 'Carol Demo', password },
  })

  const doc = await prisma.document.upsert({
    where: { id: 'seed-doc-001' },
    update: {},
    create: {
      id: 'seed-doc-001',
      title: 'Welcome to CollabDocs',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Welcome to CollabDocs' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'This is a collaborative document editor. You can format text, share documents, and upload files.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Features' }] },
          {
            type: 'bulletList', content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich text editing: bold, italic, underline, headings, lists' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Upload .txt, .md, and .docx files' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Share documents with view or edit permissions' }] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Auto-save as you type' }] }] },
            ],
          },
        ],
      }),
      ownerId: alice.id,
    },
  })

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
    update: {},
    create: { documentId: doc.id, userId: bob.id, permission: 'edit' },
  })

  console.log('✓ Seeded: alice@demo.com, bob@demo.com, carol@demo.com (password: demo1234)')
  console.log('✓ Sample document created and shared with Bob')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
