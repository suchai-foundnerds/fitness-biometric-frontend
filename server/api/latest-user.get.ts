import { PrismaClient } from '~/generated/prisma'

export default eventHandler(async (e) => {
  const prisma = new PrismaClient()
  const user = await prisma.user.findFirst({
    orderBy: {
      id: 'desc',
    },
  })
  
  return user ?? { id: -1}
})
