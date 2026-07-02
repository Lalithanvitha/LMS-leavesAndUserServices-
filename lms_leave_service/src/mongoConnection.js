const { MongoClient } = require("mongodb");

let db;

const connectMongoDB = async () => {
  const client = await MongoClient.connect(process.env.MONGO_URI);

  db = client.db("companyDB");

  console.log("MongoDB Connected");
};

const getMongoDb = () => db;

module.exports = {
  connectMongoDB,
  getMongoDb,
};
