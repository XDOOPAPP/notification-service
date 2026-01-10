const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

module.exports = (req, res, next) => {

  // const userIdFromGateway = req.headers["x-user-id"];

  // if (!userIdFromGateway) {
  //   throw new AppError(
  //     "Unauthorized - Request must come from API Gateway",
  //     401
  //   );
  // }

  // const authHeader = req.headers.authorization;
  // let decoded = null;

  // if (authHeader?.startsWith("Bearer ")) {
  //   const token = authHeader.split(" ")[1];
  //   decoded = jwt.decode(token);
  // }

  // req.user = {
  //   userId: userIdFromGateway,
  //   role: decoded?.role,
  //   email: decoded?.email,
  // };

  next();
};
