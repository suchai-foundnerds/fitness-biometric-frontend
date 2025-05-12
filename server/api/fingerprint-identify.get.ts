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
  const config = useRuntimeConfig()
  const fingerprint = await readFile(path.join(config.baseFingerprintDBPath, "fingerprint-identify.txt"), 'utf-8')
  const [id, timestamp] = fingerprint.split(':')

  if (!id || !timestamp) return {
    status: 'invalid',
    identifyTimestamp: parseInt(timestamp),
  }

  const user = await db.findUserWithAttendances(parseInt(id))
  
  if (user.membershipEndAt && new Date(user.membershipEndAt) < new Date()) {
    return {
      status: 'invalid',
      identifyTimestamp: parseInt(timestamp),
    }
  } else if (user.membershipStartAt && new Date(user.membershipStartAt) > new Date()) {
    return {
      status: 'invalid',
      identifyTimestamp: parseInt(timestamp),
    }
  }

  if (!user) return {
    status: 'invalid',
    identifyTimestamp: parseInt(timestamp),
  }

  return {
    status: 'valid',
    id: user.id,
    name: user.name,
    membershipStartAt: user.membershipStartAt,
    membershipEndAt: user.membershipEndAt,
    remark: user.remark,
    identifyTimestamp: parseInt(timestamp),
    attendanceCount: Number(user.attendanceCount),
  }
})
