import { db } from "~/server/utils/db";

export default eventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid member ID'
    });
  }
  
  try {
    const member = await db.findUserWithAttendances(id);
    const memberAttendances = await db.getUserAttendance(id);
    
    if (!member) {
      throw createError({
        statusCode: 404,
        message: 'Member not found'
      });
    }
    
    return {
      ...member,
      memberAttendances
    };
    
  } catch (error) {
    console.error('Error fetching member:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}); 