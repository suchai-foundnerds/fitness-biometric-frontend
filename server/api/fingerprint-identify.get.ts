import { readFile } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '~/generated/prisma'

export default eventHandler(async (e) => {
  const fingerprint = await readFile(path.join(process.env.BASE_FINGERPRINT_DB_PATH!, "fingerprint-identify.txt"), 'utf-8')
  const [id, timestamp] = fingerprint.split(':')

  if (!id || !timestamp) return null

  const prisma = new PrismaClient()
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          userAttendances: true,
        }
      }
    },
    where: {
      id: parseInt(id),
    },
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    identifyTimestamp: parseInt(timestamp),
    attendanceCount: user._count.userAttendances,
  }
})
