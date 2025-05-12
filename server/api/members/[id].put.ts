import { db } from "~/server/utils/db";
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

  // Validate dates if provided
  if (body.membershipStartAt && isNaN(new Date(body.membershipStartAt).getTime())) {
    throw createError({
      statusCode: 400,
      message: 'Invalid start date format'
    });
  }

  if (body.membershipEndAt && isNaN(new Date(body.membershipEndAt).getTime())) {
    throw createError({
      statusCode: 400,
      message: 'Invalid membership end date format'
    });
  }
  
  try {
    // Check if member exists
    const existingMember = await db.findUserById(id);
    
    if (!existingMember) {
      throw createError({
        statusCode: 404,
        message: 'Member not found'
      });
    }
    
    // Update the member's status and dates
    const updatedMember = await db.updateUserActiveStatus(
      id, 
      body.active,
      body.membershipStartAt ? new Date(body.membershipStartAt) : undefined,
      body.membershipEndAt ? new Date(body.membershipEndAt) : undefined
    );
    
    return updatedMember[0];
    
  } catch (error) {
    console.error('Error updating member:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}); 