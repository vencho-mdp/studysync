import db from "../../db/db";

export default defineEventHandler(async (event) => {
  const { task_id } = await readBody(event);
  const task = await db("tasks")
    .where("id", task_id)
    .update({
      status: "done",
    })
    .returning("*");
  return task[0];
});
