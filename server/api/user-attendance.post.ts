import { prisma } from "~/server/utils/db";

export default eventHandler(async (e) => {
    const {userId} = await readBody(e);

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID is required',
        })
    }

    await prisma.user.findFirstOrThrow({
        where: {
            id: userId,
        }
    })
    
    await prisma.userAttendance.create({
        data: {
            userId,
        }
    })
    
    return {
        success: true,
    }
})
