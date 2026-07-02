const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const EmployeesBodySchema = {
  type: "object",

  properties: {
    id: {
      type: "integer",
    },
    name: {
      type: "string",
    },
    email: {
      type: "string",
    },
    password: {
      type: "string",
    },
    leave_balance: {
      type: "integer",
    },
    manager_id: {
      type: "integer",
    },
    month: {
      type: "string",
    },
  },

  //required: ["name", "email", "password", "manager_id"],
  //additionalProperties: false,
};

const EmployeesQuerySchema = {
  type: "object",
  properties: {
    page: {
      type: "string",
      pattern: "^[0-9]+$",
    },
    limit: {
      type: "string",
      pattern: "^[0-9]+$",
    },
    role: {
      type: "string",
    },
  },
  //required: ["page", "limit", "role"],
  //additionalProperties: false,
};

const EmployeesParamsSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[0-9]+$",
    },
  },
  required: ["id"],
  additionalProperties: false,
};

module.exports = {
  EmployeesBodySchema,
  EmployeesQuerySchema,
  EmployeesParamsSchema,
};
