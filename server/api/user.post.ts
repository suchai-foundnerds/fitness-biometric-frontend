import { defineEventHandler, readBody } from 'h3';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate input
    if (!body.name || !body.fingerprint || !body.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, fingerprint, or id',
      });
    }

    const { name, fingerprint, id } = body;

    const newUser = await db.createUser({ id, name, fingerprint });

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
