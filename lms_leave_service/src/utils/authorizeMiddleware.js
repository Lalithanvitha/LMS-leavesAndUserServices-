const { getMongoDb } = require("../mongoConnection");

const authorizeAdminOrHR = async (req, res, next) => {
  try {
    const db = await getMongoDb();

    const role = await db.collection("roles").findOne({
      emp_id: req.user.id,
    });
    console.log("req.user.id = ", req.user.id);
    console.log("role = ", role);

    if (!role) {
      return res.status(403).json({
        message: "Role not found",
      });
    }

    if (role.name !== "Admin" && role.name !== "HR") {
      return res.status(403).json({
        message:
          "Only Admin or HR can retrive,create,delete and update employees",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = authorizeAdminOrHR;
