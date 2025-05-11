import postgres from 'postgres';

export const sql = postgres("postgres://foundnerds-general:f0undnerdsf0undnerdsf0undnerds@119.59.103.72:5433/fingerprint");

// Helper functions
export const db = {
  // User operations
  async createUser(data: { id: number; name: string; fingerprint: string }) {
    return await sql`
      INSERT INTO "User" (id, name, fingerprint, "createdAt", "updatedAt", active)
      VALUES (${data.id}, ${data.name}, ${data.fingerprint}, NOW(), NOW(), true)
      RETURNING *
    `;
  },

  async findLatestUser() {
    const users = await sql`
      SELECT * FROM "User"
      ORDER BY id DESC
      LIMIT 1
    `;
    return users[0] || { id: -1 };
  },

  async findUserById(id: number) {
    const users = await sql`
      SELECT * FROM "User"
      WHERE id = ${id}
    `;
    return users[0];
  },

  async findUserWithAttendances(id: number) {
    const users = await sql`
      SELECT u.*, 
        (SELECT COUNT(*) FROM "UserAttendance" WHERE "userId" = u.id) as "attendanceCount"
      FROM "User" u
      WHERE u.id = ${id} AND u.active = true
    `;
    return users[0];
  },

  async getAllMembers() {
    return await sql`
      SELECT u.*, 
        (SELECT COUNT(*) FROM "UserAttendance" WHERE "userId" = u.id) as "attendanceCount"
      FROM "User" u
      ORDER BY u."createdAt" DESC
    `;
  },

  async updateUserActiveStatus(id: number, active: boolean) {
    return await sql`
      UPDATE "User"
      SET active = ${active}, "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
  },

  // Attendance operations
  async createAttendance(userId: number) {
    return await sql`
      INSERT INTO "UserAttendance" ("userId", "createdAt", "updatedAt")
      VALUES (${userId}, NOW(), NOW())
      RETURNING *
    `;
  },

  async getUserAttendance(userId: number) {
    return await sql`
      SELECT * FROM "UserAttendance"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
    `;
  },

  async getAttendanceReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const [totalMembers, todayAttendance, newMembersThisMonth, attendanceList] = await Promise.all([
      sql`SELECT COUNT(*) FROM "User" WHERE active = true`,
      sql`SELECT COUNT(*) FROM "UserAttendance" WHERE "createdAt" >= ${startOfDay} AND "createdAt" <= ${endOfDay}`,
      sql`SELECT COUNT(*) FROM "User" WHERE "createdAt" >= ${startOfMonth}`,
      sql`
        SELECT a.*, u.name
        FROM "UserAttendance" a
        JOIN "User" u ON u.id = a."userId"
        WHERE a."createdAt" >= ${startOfDay} AND a."createdAt" <= ${endOfDay}
        ORDER BY a."createdAt" ASC
      `
    ]);

    return {
      stats: {
        totalMembers: Number(totalMembers[0].count),
        todayAttendance: Number(todayAttendance[0].count),
        newMembersThisMonth: Number(newMembersThisMonth[0].count)
      },
      attendanceList: attendanceList.map(a => ({
        id: a.id,
        name: a.name,
        time: new Date(a.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        userId: a.userId
      }))
    };
  }
};