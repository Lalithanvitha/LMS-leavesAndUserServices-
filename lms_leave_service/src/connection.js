const { Model } = require("objection");
const Knex = require("knex");
const config = require("./knexfile");
const { connectMongoDB } = require("./mongoConnection");

async function bootstrap() {
  try {
    console.log("Initializing...");
    const knex = Knex(config.development);
    Model.knex(knex);
    console.log("postgresql connected");
    await connectMongoDB();
    console.log("application started");
  } catch (err) {
    console.error("Bootstrap failed:", err);
    process.exit(1);
  }
}

module.exports = { Model, bootstrap };
