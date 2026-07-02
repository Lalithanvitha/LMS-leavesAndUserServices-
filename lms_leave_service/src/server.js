require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const redisClient = require("./config/redis");
require("./connection");
const leaveRoutes = require("./routes/leavesRoutes");
const monthRoutes = require("./routes/monthsRoutes");
const { bootstrap } = require("./connection");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/leaves", leaveRoutes);
app.use("/api/month", monthRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(3000, () => {
  console.log("Server is running");
  bootstrap();
});
