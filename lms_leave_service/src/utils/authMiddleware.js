const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const SessionsModel = require("../models/sessionsModel");
const logger = require("../config/logger");
const { getMongoDb } = require("../mongoConnection");
const redisClient = require("../config/redis");

const authMiddleware = async (req, res, next) => {
  try {
    logger.info("authmiddleware hit");
    // get authorization header
    const authHeader = req.headers.authorization;
    // check header exists
    if (!authHeader) {
      throw createError(401, "Token required");
    }
    // format:
    // Bearer token
    const token = authHeader.split(" ")[1];
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.sessionId);
    // check session in DB
    const session = await redisClient.get(`session:${decoded.sessionId}`);

    if (!session) {
      throw createError(401, "Session expired");
    }
    // save user info in request
    req.user = decoded;
    logger.info("authmiddleware sessionId");

    next();
  } catch (err) {
    console.log(err);
    next(createError(401, "Invalid or expired token"));
  }
};

module.exports = authMiddleware;
