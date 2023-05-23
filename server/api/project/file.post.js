import db from "../../db/db";

export default defineEventHandler(async (event) => {
  const { url, title, project_id } = await readBody(event);
  const file = await db("files")
    .insert({
      file_url: url,
      name: title,
      project_id,
    })

    .returning("*");
  return file[0];
});
