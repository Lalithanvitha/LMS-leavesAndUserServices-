require("dotenv").config();
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_NAME,
    },
    pool: {
      min: 2,
      max: 5,
      idleTimeoutMillis: 3000,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
