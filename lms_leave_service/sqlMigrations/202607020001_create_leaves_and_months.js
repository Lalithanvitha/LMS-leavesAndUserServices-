exports.up = async function (knex) {
  // Create PostgreSQL enum
  await knex.raw(`
    CREATE TYPE leave_status AS ENUM (
      'PENDING',
      'APPROVED',
      'REJECTED'
    );
  `);

  // Create leaves table
  await knex.schema.createTable("leaves", (table) => {
    table.increments("id").primary();

    table.integer("emp_id").notNullable();

    table.text("leavereason").notNullable();

    table
      .specificType("status", "leave_status")
      .notNullable()
      .defaultTo("PENDING");

    table.date("from_date").notNullable();

    table.date("to_date").notNullable();

    table.integer("days").notNullable();

    table.boolean("email_sent").defaultTo(false);

    table.text("document_url");

    table.integer("manager_id");

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["emp_id"], "idx_leave_emp_id");
    table.index(["status"], "idx_leave_status");
    table.index(["emp_id", "status"], "idx_leave_emp_status");
  });

  // Create months table
  await knex.schema.createTable("months", (table) => {
    table.string("month_name", 20).notNullable();
    table.integer("month_num").notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("months");
  await knex.schema.dropTableIfExists("leaves");

  await knex.raw(`
    DROP TYPE IF EXISTS leave_status;
  `);
};