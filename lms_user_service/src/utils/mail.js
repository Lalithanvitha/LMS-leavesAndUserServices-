const nodemailer = require("nodemailer");
const { Liquid } = require("liquidjs");
const path = require("path");
const { getBirthdayEmployees } = require("../services/birthdayServices");
const engine = new Liquid({
  root: path.join(__dirname, "../temps"), // root for layouts/includes lookup
  extname: ".liquid", // used for layouts/includes, defaults ""
});
const { getDb } = require("../connection");
const createError = require("http-errors");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBirthdayMails = async () => {
  console.log("sendBirthdayMails() called");
  const subject = "Happy Birthday!";
  const template = "birthday.liquid";

  const db = getDb();
  //get employees who has not received mail yet
  const employees = await getBirthdayEmployees();
  // throw an error ,if no mails has to send
  if (employees.length === 0) {
    throw createError(404, "No birthday emails to send.");
    return;
  }
  //loop through employees to send mail
  for (const employee of employees) {
    try {
      const html = await engine.renderFile(template, {
        name: employee.name,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject,
        html,
      });
      //insert in birthdayMailLogs that the mail is sent
      await db.collection("birthdayMailLogs").insertOne({
        employeeId: employee.id,
        employeeName: employee.name,
        email: employee.email,
        subject,
        body: html,
        sentAt: new Date(),
        status: "Success",
      });

      console.log(`Birthday mail sent to ${employee.name}`);
    } catch (err) {
      console.error(`Failed to send mail to ${employee.name}:`, err.message);
      //if sending mail is failed throe an error
      await db.collection("birthdayMailLogs").insertOne({
        employeeId: employee.id,
        employeeName: employee.name,
        email: employee.email,
        subject,
        sentAt: new Date(),
        status: "Failed",
        error: err.message,
      });
    }
  }
};

module.exports = {
  sendBirthdayMails,
};
