const express = require("express");
const route = express.Router();
const errHandler = require("../utils/errHandler");
const {
  errorResponse,
  paginationResponse,
  successResponse,
} = require("../utils/responseHandler");
const logger = require("../config/logger");
const { login, logout } = require("../services/authenticationServices");
const authMiddleware = require("../utils/authMiddleware");
//login
route.post("/login", async (req, res, next) => {
  errHandler(req, res, async () => {
    const { email, password } = req.body;
    const result = await login(email, password);
    console.log(result);
    return successResponse(result);
  });
});

//logout
route.post("/logout", authMiddleware, async (req, res, next) => {
  errHandler(req, res, async () => {
    const { sessionId } = req.user;
    const result = await logout(sessionId);
    console.log(result);
    return successResponse(result);
  });
});

module.exports = route;
