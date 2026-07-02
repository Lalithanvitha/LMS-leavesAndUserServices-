/*const EventEmitter = require("events");
const { sendBirthdayMails } = require("./mail");
const leaveEmitter = new EventEmitter();
//const LeavesModel = require("../models/leavesModel");
const logger = require("../config/logger");

leaveEmitter.on("BirthdayMail", async (name) => {
  try {
    const info = await sendBirthdayMails(name);
    logger.info(`Mail sent from leaveMailEvent: ${info}`);
    console.log("Mail sent:", info);
  } catch (err) {
    console.error("Mail error:", err);
  }
});

module.exports = leaveEmitter;*/
