const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const notifyController = require("../controllers/notification.controller");
const auth = require("../middlewares/auth.middleware")

module.exports = (app) => {
  const bus = app.get("eventBus");
  const controller = new notifyController(bus);

  router.post("/", auth, asyncHandler(controller.createNotification));

  router.get("/", auth, asyncHandler(controller.getAll));

  router.get("/unread-count", auth, asyncHandler(controller.getUnreadCount));

  router.post("/:id/read", auth, asyncHandler(controller.markRead));

  router.post("/read-all", auth, asyncHandler(controller.markAllRead));

  router.delete("/:id", auth, asyncHandler(controller.deleteOne));

  router.delete("/", auth, asyncHandler(controller.deleteAll));

  router.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "notification-service"
    });
  });

  return router;
}