import { readFile } from 'fs/promises'
import path from 'path'

export default eventHandler(async (e) => {
  const fingerprint = await readFile(path.join(process.env.BASE_FINGERPRINT_DB_PATH!, "fingerprint-db.txt"), 'utf-8')
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
