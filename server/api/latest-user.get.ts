import { prisma } from "../utils/db"

export default eventHandler(async (e) => {
  const user = await prisma.user.findFirst({
    orderBy: {
      id: 'desc',
    },
  })
  
  return user ?? { id: -1}
})
