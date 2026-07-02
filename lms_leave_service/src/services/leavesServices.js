const express = require("express");
const route = express.Router();
const LeavesModel = require("../models/leavesModel");
const MonthsModel = require("../models/monthsModel");
const errHandler = require("../utils/errHandler");
const { successResponse } = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { leaveStatus } = require("../helpers/enumHelper");
const { pagination } = require("../helpers/paginationHelper");
const { transaction } = require("objection");
const createError = require("http-errors");
const logger = require("../config/logger");
const { raw } = require("objection");
const leaveEmitter = require("../utils/leaveMailEvent");
const { getMongoDb } = require("../mongoConnection");

//get leaves of all employees per particular month
exports.allEmployeeLeavesPerMonth = async (month, page, limit) => {
  const db = await getMongoDb();
  const employees = await db.collection("employees").find().toArray();
  const knex = LeavesModel.knex();
  const leaveCounts = await knex("leaves")
    .select("emp_id")
    .count("* as total_leaves")
    .whereRaw("TO_CHAR(from_date, 'YYYY-MM') = ?", [month])
    .groupBy("emp_id");
  //console.log("leaveCounts:", leaveCounts);

  const result = employees.map((emp) => {
    const leave = leaveCounts.find((l) => l.emp_id === emp.id);
    //console.log("leave=", leave);
    return {
      name: emp.name,
      total_leaves: leave ? Number(leave.total_leaves) : 0,
    };
  });
  return result;
};

//create leave
exports.createLeave = async (userId, data) => {
  const db = getMongoDb();
  //function accepts request data
  logger.info("Leaves service hit");
  const trx = await LeavesModel.startTransaction();
  try {
    //const employee = await EmployeesModel.query(trx).findById(data.emp_id); //find employee with given id
    console.log("userId =", userId);
    console.log("typeof userId =", typeof userId);
    const employee = await db
      .collection("employees")
      .findOne({ id: Number(userId) });
    console.log(employee);
    // EmployeesModel.query(trx) means execute query inside the transaction
    logger.info("Logging employee in console");
    console.log(employee);
    if (!employee) {
      //if employee not found throw error
      throw createError(404, "Employee not found");
    }
    const days = Number(data.days);
    //logger.info("Logging data.days");
    //console.log(data.days);
    //console.log(typeof data.days);
    if (isNaN(days)) {
      throw createError(406, "Days must be a valid number");
    }
    if (employee.leave_balance < data.days) {
      //checks leave_balance ,if the condition becomes true,error is thrown
      throw createError(400, "Insufficient balance");
    }

    const month = new Date(data.from_date).getMonth() + 1;
    const year = new Date(data.from_date).getFullYear();
    const monthStart = new Date(year, month - 1, 1);
    const nextMonthStart = new Date(year, month, 1);
    const result = await LeavesModel.query(trx)
      .where("emp_id", userId)
      .whereIn("status", ["APPROVED", "PENDING"])
      .where("from_date", ">=", monthStart)
      .where("to_date", "<", nextMonthStart)
      .sum("days as total");
    const monthlyUsed = Number(result[0].total) || 0;
    logger.info("monthlyUsed");
    console.log(monthlyUsed);
    if (Number(monthlyUsed) + Number(data.days) > 2) {
      throw createError(
        403,
        `Your monthly used leaves are ${monthlyUsed}, per month you can apply only 2 leaves`,
      );
    }
    //create leave request
    logger.info("Inserting data");
    const Leave = await LeavesModel.query(trx).insert({
      //insert data into leaves table
      emp_id: userId,
      leavereason: data.leavereason,
      from_date: data.from_date,
      to_date: data.to_date,
      days: parseInt(data.days),
      document_url: data.document_url,
      status: "PENDING",
      manager_id: data.manager_id,
    });
    logger.info("Logging leaves");
    console.log(Leave);
    const from_date = new Date(Leave.from_date).toDateString();
    const to_date = new Date(Leave.to_date).toDateString();
    const managerData = await db
      .collection("employees")
      .findOne(
        { id: Number(userId) },
        { projection: { manager_id: 1, _id: 0 } },
      );
    console.log("managerData= ", managerData);
    const manager = await db
      .collection("employees")
      .findOne({ id: managerData.manager_id });
    console.log("manager= ", manager);
    //const status = Leave.status;
    // COMMIT transaction
    await trx.commit();
    console.log("before emit");
    leaveEmitter.emit("leaveApplyMail", {
      employee,
      from_date,
      to_date,
      manager,
    });
    console.log("After Emit");
    await LeavesModel.query().findById(Leave.id).patch({ email_sent: true });
    const updatedLeave = await LeavesModel.query().findById(Leave.id);
    logger.info("logging updateLeave");
    console.log(updatedLeave);
    return updatedLeave;
  } catch (err) {
    // ROLLBACK transaction
    await trx.rollback();
    console.log("Something went wrong ");
    logger.error(err.message);
    throw err;
  }
};

//get no.of leaves an employee applied per month
exports.getMonthlyLeavesOfEmployees = async (id, page, limit) => {
  const result = LeavesModel.query()
    .select(raw("TO_CHAR(from_date, 'YYYY-MM') as month"))
    .count("* as total_leaves")
    .where("emp_id", id)
    .groupByRaw("TO_CHAR(from_date, 'YYYY-MM')")
    .orderByRaw("TO_CHAR(from_date, 'YYYY-MM')");
  const data = await pagination(result, page, limit);
  console.log(data);
  return data;
};
//get Employee's leaves
exports.getLeaveRequests = async (userId, status, page, limit) => {
  logger.info("Leaves service hit");
  const result = LeavesModel.query().where("emp_id", userId);
  console.log(result);
  if (status) {
    result.where("status", status);
  }
  const data = await pagination(result, page, limit);
  console.log(data);
  if (data.data.length === 0) {
    throw createError(404, "Leave requests not found");
  }
  return data;
};

//manager's subordinates leaves
exports.getManagerSubordinateLeaves = async (userId, status, page, limit) => {
  const db = getMongoDb();
  /*const subordinates = await db
    .collection("employees")
    .find({ manager_id: userId })
    .project({ id: 1 })
    .toArray();*/
  const subordinates = await LeavesModel.query().where("manager_id", userId);
  if (!subordinates) {
    throw createError(404, "You have no subordinates");
  }
  const employeeIds = subordinates.map((emp) => emp.id);
  const result = LeavesModel.query().whereIn("emp_id", employeeIds);
  if (status) {
    result.where("status", status);
  }
  const data = await pagination(result, page, limit);
  return data;
};

//get employee leave request by id
exports.getLeaveRequestById = async (id) => {
  logger.info("Employees service hit");
  const result = await LeavesModel.query().findById(id); //fetch leave request of given id
  if (!result) {
    throw createError(404, "Leave request not found");
  }
  return result;
};

//Add employee's leaves (post)
exports.addLeaveRequests = async (
  emp_id,
  leavereason,
  from_date,
  to_date,
  days,
) => {
  logger.info("Employees service hit");
  if (!emp_id || !leavereason || !from_date || !to_date || !days) {
    //if emp_id,leavereason not mentioned, return error response
    throw createError(406, "All fields are required");
  }

  const result = await LeavesModel.query().insert({
    emp_id,
    leavereason,
    from_date,
    to_date,
    days,
  }); //else insert emp_id ,leavereason into the leaves table
  return result;
};
//Update employee's leave(put)
exports.updateLeaveRequest = async (
  id,
  emp_id,
  leavereason,
  from_date,
  to_date,
  days,
) => {
  if (!emp_id && !leavereason && !from_date && !to_date && !days) {
    //if emp_id,leavereason not mentioned, return error response
    throw createError(406, "Any one field is required");
  }
  const existingLeave = await LeavesModel.query().findById(id); //fetch a leave request with given id
  if (!existingLeave) {
    //if no leave with given id was found return error response
    throw createError(404, "Leave not found");
  }
  if (existingLeave.status === leaveStatus.PENDING) {
    const result = await LeavesModel.query().patchAndFetchById(id, {
      emp_id,
      leavereason,
      from_date,
      to_date,
      days,
    }); //add emp_id, leavereason to the given leaves id
    return result;
  } else {
    throw createError(406, "Status is not pending");
  }
};

//delete employee's leave request
exports.deleteLeaveRequest = async (id) => {
  logger.info("Employees service hit");
  const leave = await LeavesModel.query().findById(id);

  if (leave.document_url) {
    const objectKey = leave.document_url.split(".amazonaws.com/")[1];

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: objectKey,
      }),
    );
  }

  const deletedLeaveRequest = await LeavesModel.query()
    .deleteById(id)
    .returning("*");

  return deletedLeaveRequest;
};

//updateLeaveRequestByManager (using transaction)
exports.updateLeaveRequestByManager = async (id, idl, status) => {
  logger.info("Leaves service hit");
  const db = getMongoDb();
  const trx = await LeavesModel.startTransaction();
  try {
    // Validate inputs
    if (!idl || !status) {
      throw createError(406, "Both idl and status are required");
    }
    // Validate status value
    const allowedStatus = ["APPROVED", "REJECTED"];
    if (!allowedStatus.includes(status)) {
      throw createError(400, "Invalid status");
    }
    // Fetch leave request
    const leave = await LeavesModel.query(trx).findById(idl);
    console.log(leave);
    if (!leave) {
      throw createError(404, "Leave request not found");
    }
    const employee = await db
      .collection("employees")
      .findOne({ id: leave.emp_id });
    const manager = await db.collection("employees").findOne({ id: id });
    console.log(manager);
    console.log(employee);
    if (!employee) {
      throw createError(404, "Employee not found");
    }
    // Check manager role
    if (leave.manager_id !== id) {
      throw createError(403, "Access denied");
    }
    // Prevent updating again
    if (leave.status !== "PENDING") {
      throw createError(400, "Leave already processed");
    }
    // APPROVED → deduct balance
    if (status === "APPROVED") {
      // Check balance
      if (employee.leave_balance < leave.days) {
        throw createError(400, "Insufficient leave balance");
      }
      // Deduct balance
      await db.collection("employees").updateOne(
        { id: leave.emp_id },
        {
          $inc: {
            leave_balance: -leave.days,
          },
        },
      );
    }
    // Update leave status
    const result = await LeavesModel.query(trx).patchAndFetchById(idl, {
      status: status,
    });
    const from_date = leave.from_date.toDateString();
    const to_date = leave.to_date.toDateString();
    // COMMIT transaction
    await trx.commit();
    leaveEmitter.emit("leaveStatusMail", {
      employee,
      from_date,
      to_date,
      manager,
      status,
      idl,
    });
    await LeavesModel.query().findById(idl).patch({ email_sent: true });
    const updatedLeave = await LeavesModel.query().findById(idl);
    return updatedLeave;
  } catch (err) {
    // ROLLBACK transaction
    await trx.rollback();
    logger.error(err.message);
    throw err;
  }
};
