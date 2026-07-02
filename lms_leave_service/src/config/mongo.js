/*const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

let db;

async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db("companyDB");
    console.log("MongoDB Connected");
  }

  return db;
}

module.exports = { connectMongo };
*/
