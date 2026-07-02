const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const roleSchema = {
  type: "object",

  properties: {
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    emp_id: {
      type: "integer",
    },
  },

  required: ["name", "emp_id"],
};

const RolesQuerySchema = {
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

const RolesParamsSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[0-9]+$",
    },
  },
  required: ["id"],
  //additionalProperties: false,
};

module.exports = { roleSchema, RolesQuerySchema, RolesParamsSchema };
