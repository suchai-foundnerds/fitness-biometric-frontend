import { db } from "~/server/utils/db";

export default eventHandler(async () => {
  const members = await db.getAllMembers();
  return members;
}); 