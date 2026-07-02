const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//const EmployeesModel = require("../models/employeesModel");
//const SessionsModel = require("../models/sessionsModel");
const { v4: uuidv4 } = require("uuid");
const createError = require("http-errors");
const express = require("express");
const route = express.Router();
const morgan = require("morgan");
const {
  errorResponse,
  paginationResponse,
  successResponse,
} = require("../utils/responseHandler");
const { getDb } = require("../connection");
const redisClient = require("../config/redis");

//const crypto = require("crypto");

exports.login = async (email, password) => {
  const db = getDb();
  //const { email, password } = req.body;
  // check user
  const employee = await db.collection("employees").findOne({ email: email });
  if (!employee) {
    throw createError(401, "Invalid email");
  }
  // compare password
  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    throw createError(401, "Invalid password");
  }
  // generate session id
  const sessionId = uuidv4();
  // create token
  const token = jwt.sign(
    {
      id: employee.id,
      email: employee.email,
      sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  // store session in redis
  await redisClient.set(
    `session:${sessionId}`,
    JSON.stringify({
      emp_id: employee.id,
      email: employee.email,
    }),
    {
      EX: 60 * 60 * 24, // 24 hours
    },
  );
  return { token };
};

//logout
exports.logout = exports.logout = async (sessionId) => {
  const db = getDb();
  await redisClient.del(`session:${sessionId}`);

  return {
    message: "Logged out successfully",
  };
};
