import db from "../../db/db";
export default defineEventHandler(async (event) => {
  const id = event.context.params.id;
  const project = await db("projects")
    .where(db.raw("projects.id"), id)
    .leftJoin("project_user", "projects.id", "project_user.project_id")
    .leftJoin("users", "users.id", "project_user.user_id")
    .leftJoin("files", "files.project_id", "projects.id")
    .leftJoin("tasks", "tasks.project_id", "projects.id")
    .groupBy("projects.id")
    .select(
      "projects.*",
      db.raw("json_agg(DISTINCT users.*) as users"),
      db.raw("json_agg(DISTINCT tasks.*) as tasks"),
      db.raw("json_agg(DISTINCT files.*) as files")
    )
    .first();

  return {
    ...project,
    files: project.files.filter(Boolean),
    tasks: project.tasks.filter(Boolean),
  };
});
