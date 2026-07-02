const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

let db;

async function bootstrap() {
  try {
    await client.connect();

    db = client.db("companyDB");

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

function getDb() {
  return db;
}

module.exports = {
  bootstrap,
  getDb,
};
