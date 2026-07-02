const EventEmitter = require("events");
const { sendLeaveStatusMail, sendLeaveAppliedMail } = require("./mail");
const leaveEmitter = new EventEmitter();
const LeavesModel = require("../models/leavesModel");
const logger = require("../config/logger");

leaveEmitter.on(
  "leaveStatusMail",
  async ({ employee, from_date, to_date, manager, status, idl }) => {
    try {
      const info = await sendLeaveStatusMail(
        employee.email,
        employee.name,
        from_date,
        to_date,
        manager.name,
        status,
      );

      logger.info(`Mail sent from leaveMailEvent: ${info}`);
      console.log("Mail sent:", info);
    } catch (err) {
      console.error("Mail error:", err);
    }
  },
);

leaveEmitter.on(
  "leaveApplyMail",
  async ({ employee, from_date, to_date, manager }) => {
    console.log("leaveApplyMail listener triggered");
    try {
      const info = await sendLeaveAppliedMail(
        employee.email,
        employee.name,
        from_date,
        to_date,
        manager.name,
        manager.email,
      );
    } catch (err) {
      console.error("Mail error:", err);
    }
  },
);

module.exports = leaveEmitter;
