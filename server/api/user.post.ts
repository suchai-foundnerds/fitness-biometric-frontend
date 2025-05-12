import { defineEventHandler, readBody } from 'h3';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { name, fingerprint, id, phoneNumber, membershipStartAt, membershipEndAt, remark } = body;

    const newUser = await db.createUser({ id, name, fingerprint, phoneNumber, membershipStartAt, membershipEndAt, remark });

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
