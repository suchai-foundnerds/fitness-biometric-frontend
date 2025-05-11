import { db } from "~/server/utils/db";

export default eventHandler(async (e) => {
    const {userId} = await readBody(e);

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID is required',
        })
    }

    const user = await db.findUserById(userId);
    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: 'User not found',
        })
    }
    
    await db.createAttendance(userId);
    
    return {
        success: true,
    }
})
