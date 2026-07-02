const express = require("express");
const route = express.Router();
//const wrapRoutes = require('../utils/wrapRoutes');
//const roleServices = require('../services/roleServices');
const {
  getRoles,
  getRolesById,
  AddRole,
  UpdateRole,
  deleteRole,
} = require("../services/roleServices");
const {
  roleSchema,
  RolesQuerySchema,
  RolesParamsSchema,
} = require("../validations/roleSchema");
const validate = require("../utils/validate");
const errHandler = require("../utils/errHandler");
const {
  successResponse,
  paginationResponse,
} = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const {
  pagination,
  paginationMongodb,
} = require("../helpers/paginationHelper");
const logger = require("../config/logger");
const authMiddleware = require("../utils/authMiddleware");
const authorizeAdminOrHR = require("../utils/authorizeMiddleware");

route.get(
  "/",
  authMiddleware,
  authorizeAdminOrHR,
  validate(RolesQuerySchema, "query"),
  async (req, res, next) => {
    logger.info("Roles router hit");
    errHandler(req, res, async () => {
      //console.log("roles errHandler")
      const { emp_id, page = 1, limit = 10 } = req.query;
      //console.log(emp_id,page,limit);
      const result = await getRoles(emp_id, page, limit);
      logger.info("API's fetched successfully");
      return paginationResponse(result);
    });
  },
);
route.get(
  "/:id",
  authMiddleware,
  validate(RolesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Roles router hit");
    errHandler(req, res, async () => {
      const loggedInUser = req.user.id;
      const requestedId = req.params.id;
      const result = await getRolesById(loggedInUser, requestedId);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.post(
  "/",
  authMiddleware,
  authorizeAdminOrHR,
  validate(roleSchema),
  async (req, res, next) => {
    logger.info("Roles router hit");
    errHandler(req, res, async () => {
      const { name, emp_id } = req.body;
      const result = await AddRole(name, emp_id);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.put(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(RolesParamsSchema, "params"),
  validate(roleSchema),
  async (req, res, next) => {
    logger.info("Roles router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const { name, emp_id } = req.body;
      const result = await UpdateRole(id, name, emp_id);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.delete(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(RolesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Roles router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const result = await deleteRole(id);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);

module.exports = route;
