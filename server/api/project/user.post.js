import db from "../../db/db";

export default defineEventHandler(async (event) => {
  const { email, project_id } = await readBody(event);
  const user = await db("users").where("email", email).first();
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User does not exist",
    });
  }

  await db("project_user").insert({
    project_id,
    user_id: user.id,
  });
  return [project_id];
});
