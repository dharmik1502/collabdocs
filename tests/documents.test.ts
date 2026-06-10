import 'dotenv/config'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

let prisma: PrismaClient
let userId: string
let bobId: string
let docId: string

beforeAll(async () => {
  const adapter = new PrismaPg(process.env.DATABASE_URL!)
  prisma = new PrismaClient({ adapter } as never)

  const password = await bcrypt.hash('testpass', 10)

  // Clean up any leftover test data (documents first due to FK constraint)
  await prisma.document.deleteMany({ where: { owner: { email: { in: ['test-alice@test.com', 'test-bob@test.com'] } } } })
  await prisma.user.deleteMany({ where: { email: { in: ['test-alice@test.com', 'test-bob@test.com'] } } })

  const alice = await prisma.user.create({
    data: { email: 'test-alice@test.com', name: 'Test Alice', password },
  })
  const bob = await prisma.user.create({
    data: { email: 'test-bob@test.com', name: 'Test Bob', password },
  })
  userId = alice.id
  bobId = bob.id
})

afterAll(async () => {
  // Delete documents (and cascaded shares) before users
  await prisma.document.deleteMany({ where: { owner: { email: { in: ['test-alice@test.com', 'test-bob@test.com'] } } } })
  await prisma.user.deleteMany({ where: { email: { in: ['test-alice@test.com', 'test-bob@test.com'] } } })
  await prisma.$disconnect()
})

describe('Document CRUD', () => {
  it('creates a document', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Test Document', content: '{}', ownerId: userId },
    })
    docId = doc.id
    expect(doc.title).toBe('Test Document')
    expect(doc.ownerId).toBe(userId)
  })

  it('fetches document by id', async () => {
    const doc = await prisma.document.findUnique({ where: { id: docId } })
    expect(doc).not.toBeNull()
    expect(doc!.title).toBe('Test Document')
  })

  it('updates document title', async () => {
    const updated = await prisma.document.update({
      where: { id: docId },
      data: { title: 'Updated Title' },
    })
    expect(updated.title).toBe('Updated Title')
  })

  it('updates document content (auto-save)', async () => {
    const content = JSON.stringify({ type: 'doc', content: [] })
    const updated = await prisma.document.update({
      where: { id: docId },
      data: { content },
    })
    expect(updated.content).toBe(content)
  })
})

describe('Document Sharing', () => {
  it('shares document with another user', async () => {
    const share = await prisma.documentShare.create({
      data: { documentId: docId, userId: bobId, permission: 'edit' },
      include: { user: true },
    })
    expect(share.userId).toBe(bobId)
    expect(share.permission).toBe('edit')
    expect(share.user.name).toBe('Test Bob')
  })

  it('lists documents shared with a user', async () => {
    const shared = await prisma.documentShare.findMany({
      where: { userId: bobId },
      include: { document: true },
    })
    expect(shared.length).toBeGreaterThanOrEqual(1)
    const testDoc = shared.find((s) => s.document.id === docId)
    expect(testDoc).toBeDefined()
    expect(testDoc!.document.title).toBe('Updated Title')
  })

  it('enforces unique document+user share constraint', async () => {
    await expect(
      prisma.documentShare.create({
        data: { documentId: docId, userId: bobId, permission: 'view' },
      })
    ).rejects.toThrow()
  })

  it('removes share', async () => {
    const shares = await prisma.documentShare.findMany({ where: { documentId: docId, userId: bobId } })
    await prisma.documentShare.delete({ where: { id: shares[0].id } })
    const after = await prisma.documentShare.findMany({ where: { documentId: docId, userId: bobId } })
    expect(after.length).toBe(0)
  })
})

describe('Document Deletion', () => {
  it('deletes document and cascades shares', async () => {
    const doc2 = await prisma.document.create({
      data: { title: 'To Delete', content: '', ownerId: userId },
    })
    await prisma.documentShare.create({
      data: { documentId: doc2.id, userId: bobId, permission: 'view' },
    })
    await prisma.document.delete({ where: { id: doc2.id } })
    const shares = await prisma.documentShare.findMany({ where: { documentId: doc2.id } })
    expect(shares.length).toBe(0)
  })
})
