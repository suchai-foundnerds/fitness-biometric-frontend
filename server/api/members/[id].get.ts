import { PrismaClient } from "~/generated/prisma";

export default eventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid member ID'
    });
  }
  
  const prisma = new PrismaClient();
  
  try {
    const member = await prisma.user.findUnique({
      where: { 
        id 
      },
      include: {
        userAttendances: true
      }
    });
    
    if (!member) {
      throw createError({
        statusCode: 404,
        message: 'Member not found'
      });
    }
    
    return member;
    
  } catch (error) {
    console.error('Error fetching member:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}); 