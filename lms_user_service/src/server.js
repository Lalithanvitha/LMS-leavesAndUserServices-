require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const redisClient = require("./config/redis");
require("./connection");
require("./utils/birthdayJob");
const empRoutes = require("./routes/employeesRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const authRoutes = require("./routes/authenticationRoutes");
const bdayRoutes = require("./routes/birthdayRoutes");

const { bootstrap } = require("./connection");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/employees", empRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bday", bdayRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(7000, () => {
  console.log("Server is running");
  bootstrap();
});
