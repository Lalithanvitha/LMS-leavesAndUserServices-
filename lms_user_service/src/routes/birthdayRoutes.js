const express = require("express");
const route = express.Router();
//const wrapRoutes = require('../utils/wrapRoutes');
//const employeesServices = require('../services/employeesServices');
const { getBirthdayEmployees } = require("../services/birthdayServices");
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

route.get(
  "/todayBirthday",
  authorizeAdminOrHR,
  authMiddleware,
  validate(EmployeesQuerySchema, "query"),
  async (req, res, next) => {
    //logger.info("Employees router hit");
    errHandler(req, res, async () => {
      //console.log("route hit")
      const result = await getBirthdayEmployees();
      console.log(req.user);
      //logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);

module.exports = route;
