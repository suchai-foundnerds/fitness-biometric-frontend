import { readFile } from 'fs/promises'
import path from 'path'

export default eventHandler(async (e) => {
  const config = useRuntimeConfig()
  const fingerprint = await readFile(path.join(config.baseFingerprintDBPath, "fingerprint-db.txt"), 'utf-8')
  const usersInfos = fingerprint.split('\n')
  
  const users = usersInfos.map(user => {
    const [id, fingerprint] = user.split(':::')

    return {
      id: parseInt(id),
      fingerprint,
    }
  }) as { id: number, fingerprint: string }[]

  return users.filter(user => !!user.id)
})
