import { getServerSession } from "#auth";
import db from "../db/db";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const { id } = session.user;
  const projects = await db("projects")
    .select("*")
    .join("project_user", "projects.id", "=", "project_user.project_id")
    .where("project_user.user_id", id)
    .orderBy(db.raw("projects.created_at"), "desc");
  return projects;
});
