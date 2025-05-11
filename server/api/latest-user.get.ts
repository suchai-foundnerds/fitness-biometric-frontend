import { db } from "../utils/db"

export default eventHandler(async (e) => {
  const user = await db.findLatestUser()
  return user
})
