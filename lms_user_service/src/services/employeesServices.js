const express = require("express");
const route = express.Router();
const morgan = require("morgan");
/*const EmployeesModel = require("../models/employeesModel");
const LeavesModel = require("../models/leavesModel");
const RolesModel = require("../models/rolesModel");*/
const { successResponse } = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { paginationMongodb } = require("../helpers/paginationHelper");
const createError = require("http-errors");
const logger = require("../config/logger");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../utils/authMiddleware");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../connection");

//get employee's manager
exports.employeesManager = async (userId) => {
  const db = await getDb();
  //console.log(Object.keys(EmployeesModel.getRelations()));
  const result = await db
    .collection("employees")
    .aggregate([
      {
        $match: {
          id: Number(userId),
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "manager_id",
          foreignField: "id",
          as: "manager",
        },
      },
      {
        $project: {
          password: 0,
          "manager.password": 0,
        },
      },
    ])
    .toArray();
  //console.log(Object.keys(EmployeesModel.getRelations()));
  return result;
};

//get  manager's employees
exports.managersEmployees = async (userId) => {
  const db = await getDb();
  const result = await db
    .collection("employees")
    .aggregate([
      {
        $match: {
          id: Number(userId),
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "id",
          foreignField: "manager_id",
          as: "subordinates",
        },
      },
      {
        $project: {
          password: 0,
          "subordinates.password": 0,
        },
      },
    ])
    .toArray();
  return result;
};

//create Employee
exports.createEmployee = async (name, email, password, manager_id) => {
  const db = await getDb();
  logger.info("[postEmployee]: Employees service hit");
  if (!name || !email || !password || !manager_id) {
    //if name and email not mentioned in the body,throws error
    logger.error(
      "[postEmployee]: Both name,email,password, manager_id fields are required",
    );
    throw createError(
      406,
      "Name,email,password,manager_id fields are required",
    );
  }
  const lastEmployee = await db
    .collection("employees")
    .findOne({}, { sort: { id: -1 } });

  const nextId = lastEmployee ? lastEmployee.id + 1 : 1;

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // save in PostgreSQL
  const employee = {
    id: nextId, // your custom employee id
    name,
    email,
    password: hashedPassword,
    manager_id,

    leave_balance: 10, // default value
    created_at: new Date(), // current timestamp
    updated_at: new Date(), // current timestamp
  };

  const existingUser = await db
    .collection("employees")
    .findOne({ email: employee.email }); //checking if an employee exists with given id
  if (existingUser) {
    //if there is no employee with given id ,throw an error
    logger.error(`[updateEmployee]:email already exists`);
    throw createError(403, "user already exists");
  }

  const result = await db.collection("employees").insertOne(employee);
  const user = await db
    .collection("employees")
    .findOne({ id: nextId }, { projection: { password: 0 } });
  return user;
};

//get employees
exports.getEmployees = async (user, role, page, limit) => {
  const db = await getDb();
  console.log("userId= ", user, "typeof userId= ", typeof user);
  logger.info("[getEmployees]: Employees service hit");
  const pipeline = [
    {
      $match: {
        id: user.id,
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "id",
        foreignField: "emp_id",
        as: "roles",
      },
    },
  ];
  if (role) {
    pipeline.push({
      $match: {
        "roles.name": role,
      },
    });
  }
  pipeline.push({
    $project: {
      password: 0,
    },
  });

  const result = await db.collection("employees").aggregate(pipeline).toArray();
  console.log("hereeee");
  console.log(result);
  const data = await paginationMongodb(result, page, limit);
  return data;
};

//get employee by id
exports.getEmployeeById = async (id) => {
  logger.info("[getEmployeeById]: Employees service hit");
  const db = await getDb();
  const result = await db
    .collection("employees")
    .findOne({ id: Number(id) }, { projection: { password: 0 } }); //fetch all columns from the employees table with given id
  if (!result) {
    //if no employee found with given id , throw error
    logger.error(`[getEmployeeById]: Missing Data for id : ${id}`);
    throw createError(404, "Employee not found");
  }
  return result;
};

//update employee
exports.updateEmployee = async (userId, name, email) => {
  const db = await getDb();

  logger.info("[updateEmployee]: Employees service hit");
  if (!name && !email) {
    //if name and email are not mentioned throw an error
    logger.error("[updateEmployee]: Both name and email fields are required");
    throw createError(406, "name,email any one field is required");
  }
  const existingUser = await db
    .collection("employees")
    .findOne({ id: Number(userId) }, { projection: { password: 0 } }); //checking if an employee exists with given id
  if (!existingUser) {
    //if there is no employee with given id ,throw an error
    logger.error(`[updateEmployee]: Missing Data for id : ${userId}`);
    throw createError(404, "Employee not found");
  }
  const filter = { id: { $ne: Number(userId) } };
  const conditions = [];
  if (name) {
    conditions.push({ name });
  }
  if (email) {
    conditions.push({ email });
  }
  if (conditions.length > 0) {
    filter.$or = conditions;
  }
  const duplicate = await db.collection("employees").findOne(filter); //if given name or email found with different id ,then name or email can be duplicate
  console.log(duplicate);
  if (duplicate) {
    //as duplicate returns array, if duplicate array length is greater than zero throw an error
    logger.error("[updateEmployee]: name,email alread exists");
    throw createError(409, "name,email alread exists");
  }
  const result = await db
    .collection("employees")
    .findOneAndUpdate(
      { id: Number(userId) },
      { $set: { name, email } },
      { projection: { password: 0 }, returnDocument: "after" },
    );
  //add name,email and fetch the employee record by id
  return result;
};

//delete an employee
exports.deleteEmployee = async (id) => {
  const db = await getDb();
  logger.info("Employees service hit");
  //delete employee with given id and return the deleted object(employee)
  const result = await db
    .collection("employees")
    .findOneAndDelete({ id: Number(id) }, { projection: { password: 0 } });
  if (!result) {
    //if no employee was found with given id return error response
    logger.error(`[deleteEmployee]: Missing Data for id : ${id}`);
    throw createError(404, `Employee with given id ${id} not found`);
  }
  return result;
};
