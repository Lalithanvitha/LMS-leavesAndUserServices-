const { errorResponse } = require("./responseHandler");
const logger = require("../config/logger");
const errHandler = (req, res, cb) => {
  //logger.info("errHandler")
  cb(req, res)
    ?.then((result) => {
      console.log(result);
      console.log(result.status);
      res?.status(result?.status)?.send(result);
    })
    ?.catch((err) => {
      console.log(err);
      const error = errorResponse(err);
      res.status(error?.status).send(error);
    });
};
module.exports = errHandler;
