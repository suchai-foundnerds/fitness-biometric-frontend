import { defineEventHandler, readBody } from 'h3';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { name, fingerprint, id, phoneNumber, membershipStartAt, membershipEndAt, remark } = body;

    const membershipStartAtDate = new Date(`${membershipStartAt}T12:00:00`);
    const membershipEndAtDate = new Date(`${membershipEndAt}T12:00:00`);
    const newUser = await db.createUser({ id, name, fingerprint, phoneNumber, membershipStartAt: membershipStartAtDate, membershipEndAt: membershipEndAtDate, remark });

    return {
      message: 'User creation endpoint called successfully',
      user: newUser[0],
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Error creating user:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
