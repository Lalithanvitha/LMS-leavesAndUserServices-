const express = require("express");
const route = express.Router();
const { getLeavesPerMonth } = require("../services/monthServices");
const errHandler = require("../utils/errHandler");
const {
  successResponse,
  paginationResponse,
} = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const { pagination } = require("../helpers/paginationHelper");
const logger = require("../config/logger");
const { LeavesSchema } = require("../validations/LeavesSchema");
const validate = require("../utils/validate");
const authMiddleware = require("../utils/authMiddleware");
const authorizeAdminOrHR = require("../utils/authorizeMiddleware");

//get no.of leaves applied by all employees per month
route.get(
  "/approvedLeavesPerMonth",
  authMiddleware,
  authorizeAdminOrHR,
  async (req, res, next) => {
    errHandler(req, res, async () => {
      const result = await getLeavesPerMonth();
      return successResponse(result);
    });
  },
);

module.exports = route;
