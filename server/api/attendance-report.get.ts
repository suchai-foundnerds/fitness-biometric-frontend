import { db } from "~/server/utils/db";
import { eventHandler, getQuery } from 'h3';
import { createError } from 'h3';

export default eventHandler(async (event) => {
  const query = getQuery(event);
  const date = query.date ? new Date(query.date as string) : new Date();
  
  try {
    const report = await db.getAttendanceReport(date);
    return report;
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
}); 