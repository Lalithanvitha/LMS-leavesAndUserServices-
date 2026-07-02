const express = require("express");
const route = express.Router();
const morgan = require("morgan");
//const EmployeesModel = require("../models/employeesModel");
//const LeavesModel = require("../models/leavesModel");
//const RolesModel = require("../models/rolesModel");
const errHandler = require("../utils/errHandler");
const { successResponse } = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { leaveStatus } = require("../helpers/enumHelper");
const {
  pagination,
  paginationMongodb,
} = require("../helpers/paginationHelper");
const createError = require("http-errors");
const logger = require("../config/logger");
const { transaction } = require("objection");
const authMiddleware = require("../utils/authMiddleware");
const { sendLeaveStatusMail } = require("../utils/mail");
const leaveEmitter = require("../utils/leaveMailEvent");
const { getDb } = require("../connection");

//get roles
exports.getRoles = async (emp_id, page = 1, limit = 10) => {
  logger.info("Roles service hit");

  const db = getDb();

  const pipeline = [];

  // Apply filter if emp_id is provided
  if (emp_id) {
    pipeline.push({
      $match: {
        emp_id: Number(emp_id),
      },
    });
  }

  // Join roles with employees collection
  pipeline.push({
    $lookup: {
      from: "employees",
      localField: "emp_id",
      foreignField: "id",
      as: "employee",
    },
  });

  // Convert employee array into an object
  pipeline.push({
    $unwind: "$employee",
  });

  // Select required fields
  pipeline.push({
    $project: {
      _id: 1,
      emp_id: 1,
      role_name: 1,
      "employee.id": 1,
      "employee.name": 1,
    },
  });

  // Pagination
  pipeline.push({
    $skip: (page - 1) * limit,
  });

  pipeline.push({
    $limit: Number(limit),
  });

  const result = await db.collection("roles").aggregate(pipeline).toArray();
  const data = await paginationMongodb(result, page, limit);
  return data;
};
//get roles by id
exports.getRolesById = async (loggedInUser, requestedId) => {
  logger.info("Roles service hit");
  const db = await getDb();
  if (loggedInUser !== Number(requestedId)) {
    throw createError(401, "Access denied");
  }
  const result = await db
    .collection("roles")
    .findOne({ id: Number(requestedId) }, { projection: { password: 0 } });
  if (!result) {
    throw createError(404, "Role not found");
  }
  return result;
};
//post roles
exports.AddRole = async (name, emp_id) => {
  const db = await getDb();
  logger.info("Roles service hit");
  if (!name || !emp_id) {
    throw createError(406, "Both name and emp_id are required");
  }
  const lastRole = await db
    .collection("roles")
    .findOne({}, { sort: { id: -1 } });

  const nextId = lastRole ? lastRole.id + 1 : 1;

  const role = {
    id: nextId, // your custom employee id
    name,
    emp_id,
    created_at: new Date(), // current timestamp
    updated_at: new Date(), // current timestamp
  };
  const result = await db.collection("roles").insertOne(role);
  const postRole = await db.collection("roles").findOne({ id: nextId });
  return postRole;
};
//Update role
exports.UpdateRole = async (id, name, emp_id) => {
  const db = await getDb();
  logger.info("Roles service hit");
  if (!name || !emp_id) {
    //if name or emp_id not mentioned throw error response
    throw createError(406, "Both name an emp_id are required");
  }
  const existingRole = await db.collection("roles").findOne({ id: Number(id) }); //checking if an role exists with given id
  if (!existingRole) {
    //if no role exists throw error response
    throw createError(404, "Role not found");
  }
  const result = await db.collection("roles").findOneAndUpdate(
    { id: Number(id) },
    {
      $set: {
        name,
        emp_id,
      },
    },
    { returnDocument: "after" },
  ); //add name,email and fetch the employee record by id
  return result;
};

//delete a role
exports.deleteRole = async (id) => {
  const db = await getDb();
  logger.info("Roles service hit");
  const deletedRole = await db
    .collection("roles")
    .findOneAndDelete({ id: Number(id) }); //delete employee with given id and return the deleted object(role)
  if (!deletedRole) {
    //if no role was found with given id return error response
    throw createError(404, "role does not exist");
  }
  return deletedRole;
};
