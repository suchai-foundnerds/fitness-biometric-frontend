import { readFile } from 'fs/promises'
import { PrismaClient } from '~/generated/prisma'

export default eventHandler(async (e) => {
  const fingerprint = await readFile('./db/fingerprint-identify.txt', 'utf-8')
  const [id, timestamp] = fingerprint.split(':')

  if (!id || !timestamp) return null

  const prisma = new PrismaClient()
  const user = await prisma.user.findFirst({
    where: {
      id: parseInt(id),
    },
  })

  if (!user) return null

  return {
    ...user,
    identifyTimestamp: parseInt(timestamp),
    attendanceCount: 0,
  }
})
