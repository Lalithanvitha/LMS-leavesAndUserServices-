const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({
  allErrors: true,
  //coerceTypes: true,
});
addFormats(ajv);
const validate = (schema, property = "body") => {
  const validator = ajv.compile(schema);

  return (req, res, next) => {
    const data = req[property];

    const valid = validator(data);
    if (!valid) {
      console.log("AJV ERROR:", validator.errors);
      return res.status(400).json({
        success: false,
        error: true,
        message: validator.errors[0].message,
        errors: validate.errors,
        data: {},
      });
    }
    console.log(JSON.stringify(validator.errors, null, 2));
    next();
  };
};

module.exports = validate;
