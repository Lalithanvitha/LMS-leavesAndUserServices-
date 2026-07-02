const express = require("express");
const route = express.Router();
const morgan = require("morgan");
/*const EmployeesModel = require("../models/employeesModel");
const LeavesModel = require("../models/leavesModel");
const RolesModel = require("../models/rolesModel");*/
const errHandler = require("../utils/errHandler");
const { successResponse } = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { paginationMongodb } = require("../helpers/paginationHelper");
const createError = require("http-errors");
const logger = require("../config/logger");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../utils/authMiddleware");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../connection");

exports.getBirthdayEmployees = async () => {
  logger.info("[birthdayServices]: Hitting birthday services");

  const db = getDb();

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Find employees whose birthday is today
  const birthdayEmployees = await db
    .collection("employees")
    .aggregate([
      {
        $addFields: {
          birthMonth: { $month: "$dob" },
          birthDay: { $dayOfMonth: "$dob" },
        },
      },
      {
        $match: {
          birthMonth: month,
          birthDay: day,
        },
      },
      {
        $project: {
          password: 0,
          birthMonth: 0,
          birthDay: 0,
        },
      },
    ])
    .toArray();

  console.log("Today's birthday employees:", birthdayEmployees);

  if (birthdayEmployees.length === 0) {
    return [];
  }

  // Start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get employee emails
  const emails = birthdayEmployees.map((emp) => emp.email);

  // Find employees who have already received birthday mail today
  const sentLogs = await db
    .collection("birthdayMailLogs")
    .find({
      email: { $in: emails },
      status: "Success",
      sentAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
    .toArray();

  // Create a Set of emails already sent today
  const sentEmails = new Set(sentLogs.map((log) => log.email));

  // Return only employees who haven't received the mail today
  const employeesToSend = birthdayEmployees.filter(
    (employee) => !sentEmails.has(employee.email),
  );
  if (employeesToSend.length === 0) {
    throw createError(404, "No birthday emails to send");
  }

  return employeesToSend;
};
