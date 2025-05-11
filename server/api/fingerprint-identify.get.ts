import { readFile } from 'fs/promises'
import path from 'path'
import { db } from '~/server/utils/db'

type ValidIdentifyResult = {
  status: 'valid',
  id: number,
  name: string,
  identifyTimestamp: number,
  attendanceCount: number,
}

type InvalidIdentifyResult = {
  status: 'invalid',
  identifyTimestamp: number,
}

type IdentifyResult = ValidIdentifyResult | InvalidIdentifyResult

export default eventHandler(async (e): Promise<IdentifyResult> => {
  const fingerprint = await readFile(path.join(process.env.BASE_FINGERPRINT_DB_PATH!, "fingerprint-identify.txt"), 'utf-8')
  const [id, timestamp] = fingerprint.split(':')

  if (!id || !timestamp) return {
    status: 'invalid',
    identifyTimestamp: parseInt(timestamp),
  }

  const user = await db.findUserWithAttendances(parseInt(id))

  if (!user) return {
    status: 'invalid',
    identifyTimestamp: parseInt(timestamp),
  }

  return {
    status: 'valid',
    id: user.id,
    name: user.name,
    identifyTimestamp: parseInt(timestamp),
    attendanceCount: Number(user.attendanceCount),
  }
})
