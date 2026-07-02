const express = require("express");
const route = express.Router();
//const wrapRoutes = require('../utils/wrapRoutes');
//const employeesServices = require('../services/employeesServices');
const {
  getEmployees,
  getEmployeeById,
  postEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  employeesManager,
  managersEmployees,
} = require("../services/employeesServices");
const errHandler = require("../utils/errHandler");
const {
  errorResponse,
  paginationResponse,
  successResponse,
} = require("../utils/responseHandler");
const logger = require("../config/logger");
const {
  EmployeesBodySchema,
  EmployeesQuerySchema,
  EmployeesParamsSchema,
} = require("../validations/EmployeesSchema");
const validate = require("../utils/validate");
const authMiddleware = require("../utils/authMiddleware");
const authorizeAdminOrHR = require("../utils/authorizeMiddleware");

//get employees manager
route.get(
  "/employeesManager",
  authMiddleware,
  validate(EmployeesQuerySchema, "query"),
  async (req, res, next) => {
    errHandler(req, res, async () => {
      const userId = req.user.id;
      const result = await employeesManager(userId);
      return successResponse(result);
    });
  },
);

route.get(
  "/managersEmployee",
  authMiddleware,
  //validate(EmployeesParamsSchema, "params"),
  async (req, res, next) => {
    errHandler(req, res, async () => {
      const userId = req.user.id;
      const result = await managersEmployees(userId);
      return successResponse(result);
    });
  },
);
//create employee with password
route.post(
  "/createEmployee",
  authMiddleware,
  authorizeAdminOrHR,
  validate(EmployeesBodySchema),
  async (req, res, next) => {
    errHandler(req, res, async () => {
      const { name, email, password, manager_id } = req.body;
      const result = await createEmployee(name, email, password, manager_id);
      console.log(result);
      return successResponse(result);
    });
  },
);

//get employees
route.get(
  "/",
  authMiddleware,
  validate(EmployeesQuerySchema, "query"),
  async (req, res, next) => {
    //logger.info("Employees router hit");
    errHandler(req, res, async () => {
      //console.log("route hit")
      const user = req.user;
      const { role, page = 1, limit = 10 } = req.query;
      const result = await getEmployees(user, role, page, limit);
      console.log(req.user);
      //logger.info("API's fetched successfully");
      return paginationResponse(result);
    });
  },
);

//get employee by id
route.get(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(EmployeesParamsSchema, "params"),
  async (req, res, next) => {
    //logger.info("Employees router hit");
    errHandler(req, res, async () => {
      const id = req.params.id;
      const result = await getEmployeeById(id);
      //logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);

//update employee
route.put(
  "/",
  authMiddleware,
  validate(EmployeesBodySchema),
  async (req, res, next) => {
    //logger.info("Employees router hit");
    errHandler(req, res, async () => {
      const userId = req.user.id;
      const { name, email } = req.body;
      const result = await updateEmployee(userId, name, email);
      return successResponse(result);
    });
  },
);

//delete employee
route.delete(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(EmployeesParamsSchema, "params"),
  async (req, res, next) => {
    //logger.info("Employees router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const result = await deleteEmployee(id);
      //const  logger  = require('../config/logger');
      return successResponse(result);
    });
  },
);

module.exports = route;
