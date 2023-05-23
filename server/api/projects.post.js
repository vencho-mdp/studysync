import { getServerSession } from "#auth";
import db from "../db/db";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const body = await readBody(event);
  const { id } = session.user;
  const projects = await db("projects")
    .insert({
      name: body.name,
      description: body.description,
      deadline: body.deadline,
    })
    .returning("*");
  await db("project_user").insert({
    project_id: projects[0].id,
    user_id: id,
  });
  return projects[0];
});
