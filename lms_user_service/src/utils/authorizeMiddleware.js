const { getDb } = require("../connection");

const authorizeAdminOrHR = async (req, res, next) => {
  try {
    const db = getDb();

    const role = await db.collection("roles").findOne({
      emp_id: req.user.id,
    });

    if (!role) {
      return res.status(403).json({
        message: "Role not found",
      });
    }

    if (role.name !== "Admin" && role.name !== "HR") {
      return res.status(403).json({
        message: "Only Admin and HR have access!",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = authorizeAdminOrHR;
