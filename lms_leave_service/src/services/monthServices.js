const express = require("express");
const route = express.Router();
const LeavesModel = require("../models/leavesModel");
const MonthsModel = require("../models/monthsModel");
const errHandler = require("../utils/errHandler");
const { successResponse } = require("../utils/responseHandler");
const { errorResponse } = require("../utils/responseHandler");
const createError = require("http-errors");
const logger = require("../config/logger");
const { raw } = require("objection");

//get no.of leaves applied per month
exports.getLeavesPerMonth = async () => {
  const result = await MonthsModel.query()
    .select("months.month_name")
    .count("leaves.id as total_leaves")
    .leftJoin("leaves", function () {
      this.on(
        raw("EXTRACT(MONTH FROM leaves.from_date)"),
        "=",
        raw("months.month_num"),
      ).andOnVal("leaves.status", "APPROVED");
    })
    .groupBy("months.month_num", "months.month_name")
    .orderBy("months.month_num");
  return result;
};
