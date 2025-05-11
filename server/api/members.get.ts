import { prisma } from "~/server/utils/db";

export default eventHandler(async () => {
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