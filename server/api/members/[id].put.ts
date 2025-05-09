import { PrismaClient } from "~/generated/prisma";
import { eventHandler, readBody } from 'h3';

export default eventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid member ID'
    });
  }
  
  const body = await readBody(event);
  
  // Ensure active status is provided
  if (typeof body.active !== 'boolean') {
    throw createError({
      statusCode: 400,
      message: 'Active status must be a boolean'
    });
  }
  
  const prisma = new PrismaClient();
  
  try {
    // Check if member exists
    const existingMember = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingMember) {
      throw createError({
        statusCode: 404,
        message: 'Member not found'
      });
    }
    
    // Update the member's active status
    const updatedMember = await prisma.user.update({
      where: { id },
      data: {
        active: body.active,
        updatedAt: new Date()
      }
    });
    
    return updatedMember;
    
  } catch (error) {
    console.error('Error updating member:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}); 