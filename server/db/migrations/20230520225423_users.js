exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.schema.createTable("users", (table) => {
    table
      .uuid("id")
      .primary()
      .unique()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name");
    table.string("avatar_url").primary();
    table.string("email").primary();
    table.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("users");
};
