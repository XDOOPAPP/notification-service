const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const paymentController = require("../controllers/payment.controller");
const auth = require("../middlewares/auth.middleware")

module.exports = (app) => {
  const bus = app.get("eventBus"); 
  const vnpayGateway = app.get("vnpayGateway");
  const controller = new paymentController(bus, vnpayGateway);
    
  router.post("/", asyncHandler(controller.create));

  router.get("/vnpay/ipn", asyncHandler(controller.ipn));

  router.get("/:ref", asyncHandler(controller.getStatus));

  router.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "payment-service"
    });
  });


  return router;
}