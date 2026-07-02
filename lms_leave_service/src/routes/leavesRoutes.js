const express = require("express");
const route = express.Router();
//const wrapRoutes = require('../utils/wrapRoutes');
//const leavesServices = require('../services/leavesServices');
const {
  getLeaveRequests,
  getLeaveRequestById,
  addLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
  createLeave,
  getLeavesPerMonth,
  getMonthlyLeavesOfEmployees,
  allEmployeeLeavesPerMonth,
  getManagerSubordinateLeaves,
  updateLeaveRequestByManager,
} = require("../services/leavesServices");
const errHandler = require("../utils/errHandler");
const {
  successResponse,
  paginationResponse,
} = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { pagination } = require("../helpers/paginationHelper");
const logger = require("../config/logger");
const {
  LeavesSchema,
  LeavesQuerySchema,
  LeavesParamsSchema,
} = require("../validations/LeavesSchema");
const validate = require("../utils/validate");
const authMiddleware = require("../utils/authMiddleware");
const authorizeAdminOrHR = require("../utils/authorizeMiddleware");
const upload = require("../utils/upload");
const { uploadFileToS3 } = require("../services/s3Services");

//get monthly leaves of employees
route.get(
  "/leavesOfEmployees",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesSchema),
  async (req, res, next) => {
    errHandler(req, res, async () => {
      const { page = 1, limit = 10 } = req.query;
      const { month } = req.body;
      const result = await allEmployeeLeavesPerMonth(month, page, limit);
      return successResponse(result);
    });
  },
);

route.post(
  "/apply-leave",
  authMiddleware,
  authorizeAdminOrHR,
  upload.single("attachment"),
  async (req, res, next) => {
    logger.info("Apply Leave router hit");
    errHandler(req, res, async () => {
      const { id } = req.user;
      const data = req.body;
      let document_url = null;
      console.log("req.file =>", req.file);
      console.log("document_url =>", req.file?.location);
      console.log("data before insert =>", data);

      if (req.file) {
        document_url = await uploadFileToS3(req.file);
        console.log(document_url);
      }
      data.document_url = document_url;
      const result = await createLeave(data);

      logger.info("Leave applied successfully");

      return successResponse(result);
    });
  },
);

//get no.of leaves employee applied per month
route.get(
  "/leavesPerMonth/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const { page = 1, limit = 10 } = req.query;
      const { id } = req.params;
      const result = await getMonthlyLeavesOfEmployees(id, page, limit);
      logger.info("API's fetched successfully");
      return paginationResponse(result);
    });
  },
);

route.get(
  "/",
  authMiddleware,
  validate(LeavesQuerySchema, "query"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const userId = req.user.id;
      console.log("userId", userId);
      console.log("req.user", req.user);
      const { status, page = 1, limit = 10 } = req.query;
      const result = await getLeaveRequests(userId, status, page, limit);
      logger.info("API's fetched successfully");
      return paginationResponse(result);
    });
  },
);

route.get(
  "/managersSubordinates",
  authMiddleware,
  validate(LeavesQuerySchema, "query"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const userId = req.user.id;
      console.log("userId", userId);
      console.log("req.user", req.user);
      const { status, page = 1, limit = 10 } = req.query;
      const result = await getManagerSubordinateLeaves(
        userId,
        status,
        page,
        limit,
      );
      logger.info("API's fetched successfully");
      return paginationResponse(result);
    });
  },
);
route.get(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const result = await getLeaveRequestById(id);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.post(
  "/",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesSchema),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const { emp_id, leavereason, from_date, to_date, days } = req.body;
      console.log(req.body);
      const result = await addLeaveRequests(
        emp_id,
        leavereason,
        from_date,
        to_date,
        days,
      );
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.put(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesSchema),
  validate(LeavesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const { emp_id, leavereason } = req.body;
      const result = await updateLeaveRequest(id, emp_id, leavereason);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.delete(
  "/:id",
  authMiddleware,
  authorizeAdminOrHR,
  validate(LeavesParamsSchema, "params"),
  async (req, res, next) => {
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const { id } = req.params;
      const result = await deleteLeaveRequest(id);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);
route.post(
  "/createLeave",
  authMiddleware,
  validate(LeavesSchema),
  async (req, res, next) => {
    console.log("Leaves router hit");
    logger.info("Leaves router hit");
    errHandler(req, res, async () => {
      const userId = req.user.id;
      const data = req.body;
      console.log(data);
      const result = await createLeave(userId, data);
      console.log(result);
      logger.info("API's fetched successfully");
      return successResponse(result);
    });
  },
);

route.patch("/", authMiddleware, async (req, res, next) => {
  logger.info("Leaves router hit");
  errHandler(req, res, async () => {
    const { id } = req.user;
    const { idl, status } = req.body;
    const result = await updateLeaveRequestByManager(id, idl, status);
    logger.info("API's fetched successfully");
    return successResponse(result);
  });
});

module.exports = route;
