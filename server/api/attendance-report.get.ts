import { prisma } from "~/server/utils/db";
import { eventHandler, getQuery } from 'h3';

export default eventHandler(async (event) => {
  const query = getQuery(event);
  const date = query.date ? new Date(query.date as string) : new Date();
  
  // Set start and end of the day for filtering
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Start of current month for new members count
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Get total members count
  const totalMembers = await prisma.user.count({
    where: { active: true }
  });
  
  // Get today's attendance count
  const todayAttendance = await prisma.userAttendance.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  
  // Get new members this month
  const newMembersThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    }
  });
  
  // Get attendance records for the selected date
  const attendanceList = await prisma.userAttendance.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  // Format attendance records
  const formattedAttendanceList = attendanceList.map((attendance) => {
    return {
      id: attendance.id,
      name: attendance.user.name,
      time: attendance.createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      userId: attendance.userId
    };
  });
  
  return {
    stats: {
      totalMembers,
      todayAttendance,
      newMembersThisMonth
    },
    attendanceList: formattedAttendanceList
  };
}); 