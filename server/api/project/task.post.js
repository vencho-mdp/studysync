import db from "../../db/db";

export default defineEventHandler(async (event) => {
  const { name, description, deadline, priority, assignee, project_id } =
    await readBody(event);
  const user_id = await db("users")
    .where("email", assignee)
    .select("id")
    .first();
  const task = await db("tasks")
    .insert({
      name,
      description,
      deadline,
      priority,
      status: "incomplete",
      user_id: user_id.id,
      project_id,
    })
    .returning("*");
  return task[0];
});
