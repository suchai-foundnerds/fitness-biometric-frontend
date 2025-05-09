import { PrismaClient } from "~/generated/prisma";

export default eventHandler(async () => {
  const prisma = new PrismaClient();
  
  const members = await prisma.user.findMany({
    include: {
      userAttendances: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return members;
}); 