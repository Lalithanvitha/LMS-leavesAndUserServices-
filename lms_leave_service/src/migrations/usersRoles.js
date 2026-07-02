require("dotenv").config();
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");

async function migrate() {
  // PostgreSQL connection
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_NAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });

  // MongoDB connection
  const mongoClient = new MongoClient(process.env.MONGO_URI);

  await mongoClient.connect();

  const db = mongoClient.db("companyDB");

  // Migrate users
  const employees = (await pool.query("SELECT * FROM employees")).rows;

  if (employees.length) {
    await db.collection("employees").insertMany(employees);
  }

  console.log("Migration completed");

  await pool.end();
  await mongoClient.close();
}

migrate().catch(console.error);
