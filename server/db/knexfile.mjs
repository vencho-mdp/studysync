const settings =
  process.env.NODE_ENV === "production"
    ? {
        connection:
          "postgresql://postgres:e6c*G3C%T?ebmHp@db.hcucsoafouihtxtfpvvp.supabase.co:5432/postgres",
        client: "pg",
      }
    : {
        client: "pg",
        connection: {
          database: "studysync",
        },
        onUpdateTrigger: (table) => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `,
      };
export default settings;
