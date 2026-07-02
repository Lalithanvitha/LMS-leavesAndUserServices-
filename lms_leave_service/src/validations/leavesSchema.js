const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const LeavesSchema = {
  type: "object",

  properties: {
    id: {
      type: "integer",
    },
    emp_id: {
      type: "integer",
    },
    leavereason: {
      type: "string",
    },
    status: {
      type: "string",
    },
    from_date: {
      type: "string",
      format: "date",
    },
    to_date: {
      type: "string",
      format: "date",
    },
    days: {
      type: "integer",
    },
  },

  //required: ["emp_id", "leavereason", "from_date", "to_date", "days"],
};
const LeavesQuerySchema = {
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

const LeavesParamsSchema = {
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

module.exports = { LeavesSchema, LeavesQuerySchema, LeavesParamsSchema };
