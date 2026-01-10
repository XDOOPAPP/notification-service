const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const notifyController = require("../controllers/notification.controller");
const auth = require("../middlewares/auth.middleware")

module.exports = (app) => {
  const bus = app.get("eventBus");
  const controller = new notifyController(bus);


  return router;
}